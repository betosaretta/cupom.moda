import { createClient } from 'npm:@base44/sdk@0.1.0';

const base44 = createClient({
    appId: Deno.env.get('BASE44_APP_ID'),
});

// Função para escapar valores para CSV
const escapeCsvValue = (value) => {
    if (value === null || value === undefined) {
        return '';
    }
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
};

Deno.serve(async (req) => {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response('Unauthorized', { status: 401 });
        }
        const token = authHeader.split(' ')[1];
        base44.auth.setToken(token);
        
        const user = await base44.auth.me();
        if (!user || !user.loja_id) {
            return new Response('User or store not found', { status: 404 });
        }

        const leads = await base44.entities.Resposta.filter({ loja_id: user.loja_id }, '-created_date');
        const cupons = await base44.entities.Cupom.filter({ loja_id: user.loja_id });

        // Headers organizados como na tela
        const headers = [
            'Nome do Cliente', 
            'WhatsApp', 
            'Email', 
            'Cupom Gerado', 
            'Status do Cupom',
            'Origem/Campanha',
            'Nota NPS',
            'Data de Criacao'
        ];

        let csvContent = headers.join(',') + '\n';

        for (const lead of leads) {
            const cupomInfo = lead.cupom_id ? cupons.find(c => c.id === lead.cupom_id) : null;
            
            let origem = 'Manual';
            if (lead.origem === 'pesquisa_nps') {
                origem = `Pesquisa NPS (${lead.nota || 'N/A'}/10)`;
            } else if (cupomInfo) {
                origem = cupomInfo.nome;
            }

            const statusCupom = lead.status_cupom ? 
                (lead.status_cupom === 'gerado' ? 'Ativo' : 
                 lead.status_cupom === 'utilizado' ? 'Utilizado' : 
                 lead.status_cupom === 'expirado' ? 'Expirado' : lead.status_cupom) 
                : 'N/A';

            const row = [
                lead.nome_cliente || '',
                lead.whatsapp || '',
                lead.email_cliente || '',
                lead.cupom_gerado || 'N/A',
                statusCupom,
                origem,
                lead.origem === 'pesquisa_nps' ? (lead.nota || 'N/A') : 'N/A',
                new Date(lead.created_date).toLocaleDateString('pt-BR') + ' ' + new Date(lead.created_date).toLocaleTimeString('pt-BR')
            ].map(escapeCsvValue).join(',');
            
            csvContent += row + '\n';
        }

        return new Response(csvContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="clientes-cupom-moda-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.csv"`
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});