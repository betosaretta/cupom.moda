import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    // Autenticação Base44
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { 
      name, 
      trigger_type, 
      segment_id,
      emails 
    } = await req.json();

    if (!name || !trigger_type) {
      return Response.json({ 
        error: 'name e trigger_type são obrigatórios' 
      }, { status: 400 });
    }

    const apiKey = Deno.env.get('FLODESK_API_KEY');
    if (!apiKey) {
      return Response.json({ 
        error: 'FLODESK_API_KEY não configurada' 
      }, { status: 500 });
    }

    // Criar workflow/automação
    const workflowData = {
      name,
      trigger: {
        type: trigger_type, // 'segment_added', 'tag_added', 'form_submitted', etc
        segment_id: segment_id || null
      },
      emails: emails || []
    };

    const response = await fetch('https://api.flodesk.com/v1/workflows', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(apiKey + ':')}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Cupom.Moda (cupom.moda)'
      },
      body: JSON.stringify(workflowData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json({ 
        success: false,
        error: 'Erro ao criar workflow no Flodesk',
        details: errorText 
      }, { status: response.status });
    }

    const workflow = await response.json();

    return Response.json({
      success: true,
      workflow,
      message: 'Workflow criado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao criar workflow:', error);
    return Response.json({ 
      error: 'Erro ao criar workflow',
      details: error.message 
    }, { status: 500 });
  }
});