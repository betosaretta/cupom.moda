import { createClient } from 'npm:@base44/sdk@0.7.1';

const base44 = createClient({
    appId: Deno.env.get('BASE44_APP_ID'),
});

Deno.serve(async (req) => {
    // Esta função é projetada para ser acionada por um cron job (agendador).
    // A validação de 'cron-secret' garante que apenas o serviço de agendamento possa executá-la.
    const cronSecret = req.headers.get('Authorization')?.split(' ')[1];
    if (cronSecret !== Deno.env.get('CRON_SECRET')) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const today = new Date();
        // Usar asServiceRole para ter permissões de administrador para buscar todos os usuários
        const users = await base44.asServiceRole.entities.User.list();
        let notificationsSentCount = 0;

        console.log(`Verificando status de trial para ${users.length} usuários.`);

        for (const user of users) {
            if (user.subscription_status !== 'trial' || !user.trial_ends_at) {
                continue;
            }

            const trialEndDate = new Date(user.trial_ends_at);
            const daysRemaining = Math.ceil((trialEndDate - today) / (1000 * 60 * 60 * 24));
            
            let notificationType = null;
            if (daysRemaining === 7) notificationType = 'reminder_7_days';
            else if (daysRemaining === 3) notificationType = 'reminder_3_days';
            else if (daysRemaining === 1) notificationType = 'reminder_1_day';
            else if (daysRemaining <= 0) notificationType = 'expired';
            
            if (!notificationType) continue;

            const existingNotifications = user.trial_notifications_sent || [];
            const alreadySent = existingNotifications.some(n => n.type === notificationType);

            if (alreadySent) continue;
            
            const userName = user.full_name ? user.full_name.split(' ')[0] : 'Cliente';
            let subject = '', body = '';
            const appUrl = 'https://app.cupommoda.com/Configuracoes';

            switch (notificationType) {
                case 'reminder_7_days':
                    subject = `Seu teste gratuito no Cupom.Moda termina em 7 dias!`;
                    body = `Olá ${userName},\n\nFalta apenas uma semana para o fim do seu teste gratuito. Para não perder o acesso, adicione seus dados de pagamento e assine o plano.\n\nAcesse: ${appUrl}\n\nAtenciosamente,\nEquipe Cupom.Moda`;
                    break;
                case 'reminder_3_days':
                    subject = `Está acabando! Faltam 3 dias para seu teste no Cupom.Moda.`;
                    body = `Olá ${userName},\n\nSeu acesso de teste termina em 3 dias. Garanta a continuidade do seu trabalho assinando agora.\n\nAcesse: ${appUrl}\n\nAtenciosamente,\nEquipe Cupom.Moda`;
                    break;
                case 'reminder_1_day':
                    subject = `Última chance! Seu teste no Cupom.Moda termina amanhã.`;
                    body = `Olá ${userName},\n\nEste é o último dia do seu teste gratuito. Assine hoje para manter seus dados e continuar capturando clientes.\n\nAcesse: ${appUrl}\n\nAtenciosamente,\nEquipe Cupom.Moda`;
                    break;
                case 'expired':
                    subject = `Seu período de teste no Cupom.Moda expirou.`;
                    body = `Olá ${userName},\n\nSeu teste gratuito terminou. Esperamos que tenha gostado! Para reativar seu acesso e continuar usando a plataforma, por favor, realize a assinatura.\n\nAcesse: ${appUrl}\n\nAtenciosamente,\nEquipe Cupom.Moda`;
                    break;
            }
            
            // Enviar e-mail usando a integração Core
            await base44.asServiceRole.integrations.Core.SendEmail({
                to: user.email,
                subject: subject,
                body: body,
                from_name: 'Equipe Cupom.Moda'
            });

            // Atualizar o registro do usuário
            const updatedNotifications = [...existingNotifications, { type: notificationType, date: today.toISOString() }];
            const updatePayload = { trial_notifications_sent: updatedNotifications };
            if (notificationType === 'expired') {
                updatePayload.subscription_status = 'inactive';
            }
            await base44.asServiceRole.entities.User.update(user.id, updatePayload);
            
            notificationsSentCount++;
            console.log(`Notificação '${notificationType}' enviada para ${user.email}.`);
        }

        return new Response(JSON.stringify({ success: true, notificationsSent: notificationsSentCount }), {
            status: 200, headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Erro na função de verificação de trial:", error);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500, headers: { "Content-Type": "application/json" },
        });
    }
});