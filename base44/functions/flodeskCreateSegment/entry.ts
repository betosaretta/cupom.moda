import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    // Autenticação Base44
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { name, color } = await req.json();

    if (!name) {
      return Response.json({ error: 'Nome do segmento é obrigatório' }, { status: 400 });
    }

    const apiKey = Deno.env.get('FLODESK_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'FLODESK_API_KEY não configurada' }, { status: 500 });
    }

    // Criar segmento no Flodesk
    const flodeskResponse = await fetch('https://api.flodesk.com/v1/segments', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(apiKey + ':')}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Cupom.Moda (cupom.moda)'
      },
      body: JSON.stringify({
        name,
        color: color || '#6366f1' // default color
      })
    });

    if (!flodeskResponse.ok) {
      const errorText = await flodeskResponse.text();
      console.error('Erro Flodesk:', errorText);
      return Response.json({ 
        error: 'Erro ao criar segmento no Flodesk',
        details: errorText 
      }, { status: flodeskResponse.status });
    }

    const segment = await flodeskResponse.json();

    return Response.json({
      success: true,
      segment
    });

  } catch (error) {
    console.error('Erro ao criar segmento:', error);
    return Response.json({ 
      error: 'Erro ao criar segmento',
      details: error.message 
    }, { status: 500 });
  }
});