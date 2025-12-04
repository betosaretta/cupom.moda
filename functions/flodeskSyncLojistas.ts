import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    // Autenticação Base44
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { segment_id, subscription_status_filter } = await req.json();

    const apiKey = Deno.env.get('FLODESK_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'FLODESK_API_KEY não configurada' }, { status: 500 });
    }

    // Buscar todos os usuários e lojas usando service role
    const [usuarios, lojas] = await Promise.all([
      base44.asServiceRole.entities.User.list(),
      base44.asServiceRole.entities.Loja.list()
    ]);

    // Criar mapa de lojas para acesso rápido
    const lojasMap = {};
    lojas.forEach(loja => {
      lojasMap[loja.id] = loja;
    });

    const results = {
      total: 0,
      success: 0,
      errors: 0,
      skipped: 0,
      details: []
    };

    // Filtrar usuários que são lojistas (têm loja_id)
    const lojistas = usuarios.filter(u => {
      // Filtrar por loja_id existente
      if (!u.loja_id) return false;
      
      // Filtrar por status de assinatura se especificado
      if (subscription_status_filter && subscription_status_filter !== 'all') {
        return u.subscription_status === subscription_status_filter;
      }
      
      return true;
    });

    results.total = lojistas.length;

    // Sincronizar cada lojista com o Flodesk
    for (const lojista of lojistas) {
      if (!lojista.email) {
        results.skipped++;
        results.details.push({
          lojista_id: lojista.id,
          status: 'skipped',
          reason: 'sem email'
        });
        continue;
      }

      try {
        const lojaInfo = lojasMap[lojista.loja_id];
        
        const subscriberData = {
          email: lojista.email,
          first_name: lojista.full_name?.split(' ')[0] || '',
          last_name: lojista.full_name?.split(' ').slice(1).join(' ') || '',
          custom_fields: {
            origem: 'CUPOM.MODA',
            tipo_usuario: 'lojista',
            nome_loja: lojaInfo?.nome || 'Sem loja',
            slug_loja: lojaInfo?.slug || '',
            setor_loja: lojaInfo?.setor || '',
            porte_loja: lojaInfo?.porte || '',
            status_assinatura: lojista.subscription_status || 'unknown',
            data_criacao: lojista.created_date || '',
            loja_id: lojista.loja_id || ''
          }
        };

        // Adicionar ao segmento se especificado
        if (segment_id) {
          subscriberData.segment_ids = [segment_id];
        }

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
            lojista_id: lojista.id,
            email: lojista.email,
            loja: lojaInfo?.nome || 'Sem loja',
            status: 'success'
          });
        } else {
          results.errors++;
          const errorText = await flodeskResponse.text();
          results.details.push({
            lojista_id: lojista.id,
            email: lojista.email,
            loja: lojaInfo?.nome || 'Sem loja',
            status: 'error',
            error: errorText
          });
        }

        // Rate limiting - 100 req/min = ~600ms por request
        await new Promise(resolve => setTimeout(resolve, 700));

      } catch (error) {
        results.errors++;
        results.details.push({
          lojista_id: lojista.id,
          email: lojista.email,
          status: 'error',
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      results
    });

  } catch (error) {
    console.error('Erro ao sincronizar lojistas:', error);
    return Response.json({ 
      error: 'Erro ao sincronizar lojistas',
      details: error.message 
    }, { status: 500 });
  }
});