import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    // Autenticação Base44
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const apiKey = Deno.env.get('FLODESK_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'FLODESK_API_KEY não configurada' }, { status: 500 });
    }

    // Listar todos os segmentos
    const flodeskResponse = await fetch('https://api.flodesk.com/v1/segments?per_page=100', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${btoa(apiKey + ':')}`,
        'User-Agent': 'Cupom.Moda (cupom.moda)'
      }
    });

    if (!flodeskResponse.ok) {
      const errorText = await flodeskResponse.text();
      console.error('Erro Flodesk:', errorText);
      return Response.json({ 
        error: 'Erro ao listar segmentos no Flodesk',
        details: errorText 
      }, { status: flodeskResponse.status });
    }

    const result = await flodeskResponse.json();

    return Response.json({
      success: true,
      segments: result.data || [],
      meta: result.meta || {}
    });

  } catch (error) {
    console.error('Erro ao listar segmentos:', error);
    return Response.json({ 
      error: 'Erro ao listar segmentos',
      details: error.message 
    }, { status: 500 });
  }
});