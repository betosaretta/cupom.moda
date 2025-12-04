import { createClient } from 'npm:@base44/sdk@0.1.0';
import { SendEmail } from '@/integrations/Core';

const base44 = createClient({
    appId: Deno.env.get('BASE44_APP_ID'),
});

Deno.serve(async (req) => {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { "Content-Type": "application/json" }
            });
        }
        
        const token = authHeader.split(' ')[1];
        base44.auth.setToken(token);

        const user = await base44.auth.me();
        if (!user) {
            return new Response(JSON.stringify({ error: 'User not found' }), {
                status: 404,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Buscar dados da loja do usuário
        let loja = null;
        if (user.loja_id) {
            try {
                const lojas = await base44.entities.Loja.filter({ id: user.loja_id });
                if (lojas && lojas.length > 0) {
                    loja = lojas[0];
                }
            } catch (error) {
                console.log('Erro ao buscar loja:', error);
            }
        }

        // Preparar dados para o email ao admin
        const adminEmail = 'robertosaretta@gmail.com';
        const emailSubject = 'Nova Solicitação de Boleto - Cupom.Moda';
        
        const emailBody = `Nova solicitação de assinatura via boleto!

DADOS DO CLIENTE:
• Nome: ${user.full_name || 'N/A'}
• Email: ${user.email || 'N/A'}
• Telefone: ${user.phone_number || 'Não informado'}

DADOS DA LOJA:
• Nome da Loja: ${loja?.nome || 'Não informado'}
• CNPJ: ${loja?.cnpj || 'Não informado'}
• Telefone: ${loja?.telefone || 'Não informado'}

PLANO SOLICITADO:
• Plano: Mensal - R$ 149,00
• Forma de pagamento: Boleto Bancário

Data da solicitação: ${new Date().toLocaleString('pt-BR')}

Sistema Cupom.Moda`;

        // Enviar email para o admin
        await SendEmail({
            to: adminEmail,
            subject: emailSubject,
            body: emailBody,
            from_name: 'Sistema Cupom.Moda'
        });

        // Enviar confirmação para o cliente
        const userName = user.full_name ? user.full_name.split(' ')[0] : 'Cliente';
        const clientEmailBody = `Olá ${userName}!

Recebemos sua solicitação de assinatura via boleto bancário!

SOLICITAÇÃO REGISTRADA:
• Plano: Mensal - R$ 149,00/mês
• Forma de pagamento: Boleto Bancário

PRÓXIMOS PASSOS:
Nossa equipe entrará em contato em até 24 horas com os dados para pagamento.

Obrigado por escolher o Cupom.Moda!

Equipe Cupom.Moda
app.cupommoda.com`;

        await SendEmail({
            to: user.email,
            subject: 'Solicitação de Boleto Recebida - Cupom.Moda',
            body: clientEmailBody,
            from_name: 'Equipe Cupom.Moda'
        });

        return new Response(JSON.stringify({ 
            success: true, 
            message: 'Solicitação enviada com sucesso!' 
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Erro ao solicitar boleto:', error);
        return new Response(JSON.stringify({ 
            error: 'Erro interno do servidor',
            details: error.message 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});