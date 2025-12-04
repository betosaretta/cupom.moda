import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@16.2.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

// Planos disponíveis
const PLANS = {
    mensal: 'price_1Rsn3BCPt533DBcgprmHrgsf', // R$149,00
    promocional: 'price_1RvmbiCPt533DBcg3hZtvdz0' // R$79,00
};

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const origin = req.headers.get('origin');
        const appUrl = origin || 'https://cupom-moda.base44.app';
        
        // Pegar o plano do body (opcional)
        let planId = PLANS.mensal;
        try {
            const body = await req.json();
            if (body.plan && PLANS[body.plan]) {
                planId = PLANS[body.plan];
            }
        } catch (e) {
            // Se não houver body, usa o plano padrão
        }
        let customerId = user.stripe_customer_id;

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.full_name,
                metadata: {
                    base44_user_id: user.id,
                    loja_id: user.loja_id || ''
                }
            });
            customerId = customer.id;
            await base44.asServiceRole.entities.User.update(user.id, { stripe_customer_id: customerId });
        }

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card', 'boleto'],
            line_items: [{
                price: planId,
                quantity: 1,
            }],
            mode: 'subscription',
            allow_promotion_codes: true,
            payment_method_options: {
                boleto: {
                    expires_after_days: 7,
                },
            },
            success_url: `${appUrl}/Dashboard?payment=success`,
            cancel_url: `${appUrl}/Configuracoes?payment=cancel`,
            metadata: {
                base44_user_id: user.id,
                loja_id: user.loja_id || ''
            },
        });

        return Response.json({ url: session.url });

    } catch (error) {
        console.error('Stripe Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});