import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    // Autenticação Base44
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { email_id, send_at } = await req.json();

    if (!email_id) {
      return Response.json({ 
        error: 'email_id é obrigatório' 
      }, { status: 400 });
    }

    const apiKey = Deno.env.get('FLODESK_API_KEY');
    if (!apiKey) {
      return Response.json({ 
        error: 'FLODESK_API_KEY não configurada' 
      }, { status: 500 });
    }

    // Enviar campanha
    const sendData = send_at ? { send_at } : {};

    const response = await fetch(`https://api.flodesk.com/v1/emails/${email_id}/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(apiKey + ':')}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Cupom.Moda (cupom.moda)'
      },
      body: JSON.stringify(sendData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json({ 
        success: false,
        error: 'Erro ao enviar campanha',
        details: errorText 
      }, { status: response.status });
    }

    const result = await response.json();

    return Response.json({
      success: true,
      result,
      message: send_at ? 'Campanha agendada com sucesso' : 'Campanha enviada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao enviar campanha:', error);
    return Response.json({ 
      error: 'Erro ao enviar campanha',
      details: error.message 
    }, { status: 500 });
  }
});