import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    // Autenticação Base44
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { subject, body, segment_ids, from_name } = await req.json();

    if (!subject || !body) {
      return Response.json({ 
        error: 'subject e body são obrigatórios' 
      }, { status: 400 });
    }

    const apiKey = Deno.env.get('FLODESK_API_KEY');
    if (!apiKey) {
      return Response.json({ 
        error: 'FLODESK_API_KEY não configurada' 
      }, { status: 500 });
    }

    // Nota: A API do Flodesk pode ter limitações no gerenciamento de campanhas
    try {
      const campaignData = {
        name: subject,
        subject: subject,
        from_name: from_name || 'Cupom.Moda',
        content: {
          html: body
        },
        segment_ids: segment_ids || []
      };

      const response = await fetch('https://api.flodesk.com/v1/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(apiKey + ':')}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Cupom.Moda (cupom.moda)'
        },
        body: JSON.stringify(campaignData)
      });

      if (!response.ok) {
        // Se o endpoint não é suportado, sugerir alternativa
        if (response.status === 404 || response.status === 405) {
          return Response.json({ 
            success: false,
            error: 'Criação de campanhas via API não disponível',
            suggestion: 'Use a interface do Flodesk para criar campanhas manualmente ou configure workflows automáticos'
          }, { status: 200 });
        }
        
        const errorText = await response.text();
        return Response.json({ 
          success: false,
          error: 'Erro ao criar campanha no Flodesk',
          details: errorText 
        }, { status: response.status });
      }

      const campaign = await response.json();

      return Response.json({
        success: true,
        campaign,
        message: 'Campanha criada com sucesso'
      });
    } catch (fetchError) {
      return Response.json({ 
        success: false,
        error: 'Erro ao conectar com Flodesk API',
        suggestion: 'Verifique sua conexão ou use a interface do Flodesk diretamente',
        details: fetchError.message 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Erro ao criar campanha:', error);
    return Response.json({ 
      error: 'Erro ao criar campanha',
      details: error.message 
    }, { status: 500 });
  }
});