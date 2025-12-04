import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    // Autenticação Base44
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { loja_id, limit = 1000 } = await req.json();

    if (!loja_id) {
      return Response.json({ error: 'loja_id é obrigatório' }, { status: 400 });
    }

    const apiKey = Deno.env.get('FLODESK_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'FLODESK_API_KEY não configurada' }, { status: 500 });
    }

    // ID do segmento fixo para todos os leads
    const SEGMENT_ID = '69138f775555abe8ab6d6905';

    // Buscar todos os leads (respostas) da loja usando service role
    const leads = await base44.asServiceRole.entities.Resposta.filter(
      { loja_id },
      '-created_date',
      limit
    );

    const results = {
      total: 0,
      success: 0,
      errors: 0,
      skipped: 0,
      details: []
    };

    results.total = leads.length;

    // Sincronizar cada lead com o Flodesk
    for (const lead of leads) {
      if (!lead.email_cliente) {
        results.skipped++;
        results.details.push({
          lead_id: lead.id,
          status: 'skipped',
          reason: 'sem email'
        });
        continue;
      }

      try {
        const subscriberData = {
          email: lead.email_cliente,
          first_name: lead.nome_cliente?.split(' ')[0] || '',
          last_name: lead.nome_cliente?.split(' ').slice(1).join(' ') || '',
          segment_ids: [SEGMENT_ID],
          custom_fields: {
            origem: 'cupom_moda',
            whatsapp: lead.whatsapp || '',
            data_aniversario: lead.data_aniversario || '',
            categoria_nps: lead.categoria_nps || '',
            nota_nps: lead.nota?.toString() || '',
            loja_id: lead.loja_id || ''
          }
        };

        const flodeskResponse = await fetch('https://api.flodesk.com/v1/subscribers', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(apiKey + ':')}`,
            'Content-Type': 'application/json',
            'User-Agent': 'Cupom.Moda (cupom.moda)'
          },
          body: JSON.stringify(subscriberData)
        });

        if (flodeskResponse.ok) {
          results.success++;
          results.details.push({
            lead_id: lead.id,
            email: lead.email_cliente,
            status: 'success'
          });
        } else {
          results.errors++;
          const errorText = await flodeskResponse.text();
          results.details.push({
            lead_id: lead.id,
            email: lead.email_cliente,
            status: 'error',
            error: errorText
          });
        }

        // Rate limiting - 100 req/min = ~600ms por request
        await new Promise(resolve => setTimeout(resolve, 700));

      } catch (error) {
        results.errors++;
        results.details.push({
          lead_id: lead.id,
          email: lead.email_cliente,
          status: 'error',
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      results,
      segment_id: SEGMENT_ID
    });

  } catch (error) {
    console.error('Erro ao sincronizar leads:', error);
    return Response.json({ 
      error: 'Erro ao sincronizar leads',
      details: error.message 
    }, { status: 500 });
  }
});