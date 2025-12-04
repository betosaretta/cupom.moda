import { createClient } from 'npm:@base44/sdk@0.1.0';
import Stripe from 'npm:stripe@16.2.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const base44 = createClient({
    appId: Deno.env.get('BASE44_APP_ID'),
});

Deno.serve(async (req) => {
    try {
        const origin = req.headers.get('origin');
        const appUrl = origin || Deno.env.get('BASE44_APP_URL');

        if (!appUrl) {
            console.error("Critical Error: Could not determine app URL for portal session.");
            return new Response(JSON.stringify({ error: 'Configuration error: App URL not found.' }), { status: 500, headers: { "Content-Type": "application/json" } });
        }

        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { "Content-Type": "application/json" } });
        }
        const token = authHeader.split(' ')[1];
        base44.auth.setToken(token);

        const user = await base44.auth.me();
        if (!user || !user.stripe_customer_id) {
            return new Response(JSON.stringify({ error: 'Stripe customer not found for this user.' }), { status: 404, headers: { "Content-Type": "application/json" } });
        }

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: user.stripe_customer_id,
            return_url: `${appUrl}/Configuracoes`,
        });

        return new Response(JSON.stringify({ url: portalSession.url }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Stripe Portal Error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});