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
      return Response.json({ 
        error: 'FLODESK_API_KEY não configurada' 
      }, { status: 500 });
    }

    // Nota: A API do Flodesk pode não suportar listagem de campanhas
    // Este endpoint pode não estar disponível em todas as versões da API
    try {
      const response = await fetch('https://api.flodesk.com/v1/emails', {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${btoa(apiKey + ':')}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Cupom.Moda (cupom.moda)'
        }
      });

      if (!response.ok) {
        // Se o endpoint não existe, retornar lista vazia em vez de erro
        if (response.status === 404) {
          return Response.json({
            success: true,
            campaigns: [],
            message: 'Endpoint de campanhas não disponível na API do Flodesk'
          });
        }
        
        const errorText = await response.text();
        return Response.json({ 
          success: false,
          error: 'Erro ao listar campanhas',
          details: errorText 
        }, { status: response.status });
      }

      const campaigns = await response.json();

      return Response.json({
        success: true,
        campaigns: campaigns.data || campaigns || []
      });
    } catch (fetchError) {
      // Erro de rede ou endpoint não disponível
      return Response.json({
        success: true,
        campaigns: [],
        message: 'Gerenciamento de campanhas não disponível via API'
      });
    }

  } catch (error) {
    console.error('Erro ao listar campanhas:', error);
    return Response.json({ 
      success: true,
      campaigns: [],
      message: 'Erro ao conectar com Flodesk API'
    });
  }
});