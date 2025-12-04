
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user || !["super_admin"].includes(user.app_role) && user.email !== "robertosaretta@gmail.com") {
            return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401, headers: { "Content-Type": "application/json" } });
        }

        const { userId, type, phoneNumber } = await req.json();
        if (!userId || !type) {
            return new Response(JSON.stringify({ error: 'userId e type são obrigatórios' }), { status: 400, headers: { "Content-Type": "application/json" } });
        }

        const userData = await base44.asServiceRole.entities.User.get(userId);
        if (!userData) {
            return new Response(JSON.stringify({ error: 'Usuário não encontrado' }), { status: 404, headers: { "Content-Type": "application/json" } });
        }

        const userName = userData.full_name?.split(' ')[0] || 'Cliente';
        let message = '';
        
        switch (type) {
            case 'welcome_engagement':
                message = `Olá ${userName}! 👋 Vi que você começou seu teste no Cupom.Moda. Precisa de alguma ajuda para criar sua primeira pesquisa ou cupom? Estou à disposição!`;
                break;
            case 'expiring': {
                const daysRemaining = Math.ceil((new Date(userData.trial_ends_at) - new Date()) / (1000 * 60 * 60 * 24));
                message = `Olá ${userName}! Seu teste gratuito está acabando, restam apenas ${daysRemaining} dias. Não perca a chance de continuar capturando clientes!`;
                break;
            }
            case 'expired':
                message = `Olá ${userName}! Seu período de teste expirou. Que tal reativar sua conta e continuar vendendo mais?`;
                break;
            default:
                message = `Olá ${userName}! Temos novidades no Cupom.Moda para você.`;
        }

        // SIMULAÇÃO: No futuro, substituir isso pela chamada real da API do WhatsApp.
        console.log(`--- SIMULAÇÃO DE ENVIO DE WHATSAPP ---`);
        console.log(`Para: ${phoneNumber}`);
        console.log(`Mensagem: ${message}`);
        console.log(`------------------------------------`);

        return new Response(JSON.stringify({ 
            success: true, 
            message: 'Notificação (simulada) processada com sucesso.'
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error('Erro na função sendTrialNotification:', error);
        return new Response(JSON.stringify({ error: 'Erro interno do servidor', details: error.message }), {
            status: 500, headers: { "Content-Type": "application/json" }
        });
    }
});
