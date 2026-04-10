import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    // Autenticação Base44
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { email, first_name, last_name, custom_fields, segment_ids, double_optin } = await req.json();

    if (!email) {
      return Response.json({ error: 'Email é obrigatório' }, { status: 400 });
    }

    const apiKey = Deno.env.get('FLODESK_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'FLODESK_API_KEY não configurada' }, { status: 500 });
    }

    // Criar subscriber no Flodesk
    const flodeskResponse = await fetch('https://api.flodesk.com/v1/subscribers', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(apiKey + ':')}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Cupom.Moda (cupom.moda)'
      },
      body: JSON.stringify({
        email,
        first_name: first_name || '',
        last_name: last_name || '',
        custom_fields: custom_fields || {},
        segment_ids: segment_ids || [],
        double_optin: double_optin || false
      })
    });

    if (!flodeskResponse.ok) {
      const errorText = await flodeskResponse.text();
      console.error('Erro Flodesk:', errorText);
      return Response.json({ 
        error: 'Erro ao adicionar subscriber no Flodesk',
        details: errorText 
      }, { status: flodeskResponse.status });
    }

    const subscriber = await flodeskResponse.json();

    return Response.json({
      success: true,
      subscriber
    });

  } catch (error) {
    console.error('Erro ao adicionar subscriber:', error);
    return Response.json({ 
      error: 'Erro ao adicionar subscriber',
      details: error.message 
    }, { status: 500 });
  }
});