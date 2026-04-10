import Stripe from 'npm:stripe@16.2.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    let event;
    try {
        event = await stripe.webhooks.constructEventAsync(
            body,
            signature,
            Deno.env.get('STRIPE_WEBHOOK_SECRET')
        );
    } catch (err) {
        console.error(`Webhook signature verification failed.`, err.message);
        return new Response(err.message, { status: 400 });
    }

    const session = event.data.object;
    
    const getUserId = async (session) => {
        if (session.metadata?.base44_user_id) {
            return session.metadata.base44_user_id;
        }
        if (session.client_reference_id) { // Legado
            return session.client_reference_id;
        }
        if (session.customer) {
            try {
                // Se não houver metadados na sessão, busca no objeto do cliente
                const customer = await stripe.customers.retrieve(session.customer);
                return customer?.metadata?.base44_user_id;
            } catch (customerError) {
                console.error("Could not retrieve customer to find user ID:", customerError);
                return null;
            }
        }
        return null;
    }

    const userId = await getUserId(session);
    
    if (!userId) {
        console.warn('Webhook received for session without a user ID. Skipping.', {
            eventId: event.id,
            sessionId: session.id
        });
        return new Response(JSON.stringify({ received: true, message: "User ID not found in session metadata." }), { status: 200 });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const subscriptionId = session.subscription;
                if (session.mode === 'subscription' && subscriptionId) {
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                    
                    await base44.asServiceRole.entities.User.update(userId, {
                        subscription_status: subscription.status, 
                        stripe_customer_id: session.customer,
                        stripe_subscription_id: subscriptionId,
                        trial_ends_at: null
                    });

                    // Criar/Atualizar registro de Assinatura
                    const existingAssinaturas = await base44.asServiceRole.entities.Assinatura.filter({ user_id: userId });
                    const assinaturaData = {
                        user_id: userId,
                        loja_id: session.metadata?.loja_id || '',
                        status: subscription.status,
                        stripe_subscription_id: subscriptionId,
                        stripe_customer_id: session.customer,
                        valor_mensal: subscription.items.data[0]?.price?.unit_amount / 100 || 149,
                        current_period_start: new Date(subscription.current_period_start * 1000).toISOString().split('T')[0],
                        current_period_end: new Date(subscription.current_period_end * 1000).toISOString().split('T')[0]
                    };

                    if (existingAssinaturas.length > 0) {
                        await base44.asServiceRole.entities.Assinatura.update(existingAssinaturas[0].id, assinaturaData);
                    } else {
                        await base44.asServiceRole.entities.Assinatura.create(assinaturaData);
                    }
                }
                break;
            }
            case 'invoice.payment_succeeded': {
                await base44.asServiceRole.entities.User.update(userId, {
                    subscription_status: 'active'
                });
                
                // Atualizar Assinatura também
                const assinaturas = await base44.asServiceRole.entities.Assinatura.filter({ user_id: userId });
                if (assinaturas.length > 0) {
                    await base44.asServiceRole.entities.Assinatura.update(assinaturas[0].id, { status: 'active' });
                }
                break;
            }
            case 'invoice.payment_failed': {
                const subscription = await stripe.subscriptions.retrieve(session.subscription);
                await base44.asServiceRole.entities.User.update(userId, {
                    subscription_status: subscription.status,
                });
                
                const assinaturas = await base44.asServiceRole.entities.Assinatura.filter({ user_id: userId });
                if (assinaturas.length > 0) {
                    await base44.asServiceRole.entities.Assinatura.update(assinaturas[0].id, { status: subscription.status });
                }
                break;
            }
            case 'customer.subscription.updated': {
                await base44.asServiceRole.entities.User.update(userId, {
                    subscription_status: session.status,
                });
                
                const assinaturas = await base44.asServiceRole.entities.Assinatura.filter({ user_id: userId });
                if (assinaturas.length > 0) {
                    await base44.asServiceRole.entities.Assinatura.update(assinaturas[0].id, { 
                        status: session.status,
                        current_period_start: new Date(session.current_period_start * 1000).toISOString().split('T')[0],
                        current_period_end: new Date(session.current_period_end * 1000).toISOString().split('T')[0]
                    });
                }
                break;
            }
            case 'customer.subscription.deleted': {
                await base44.asServiceRole.entities.User.update(userId, {
                    subscription_status: 'canceled',
                });
                
                const assinaturas = await base44.asServiceRole.entities.Assinatura.filter({ user_id: userId });
                if (assinaturas.length > 0) {
                    await base44.asServiceRole.entities.Assinatura.update(assinaturas[0].id, { status: 'canceled' });
                }
                break;
            }
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
    } catch (error) {
        console.error('Error handling webhook event:', error);
    }

    return Response.json({ received: true });
});