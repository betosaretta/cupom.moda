import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { loja_id, send_email = false } = await req.json();

    if (!loja_id) {
      return Response.json({ error: 'loja_id é obrigatório' }, { status: 400 });
    }

    // Calcular datas da semana atual
    const hoje = new Date();
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - 7);
    inicioSemana.setHours(0, 0, 0, 0);

    const fimSemana = new Date(hoje);
    fimSemana.setHours(23, 59, 59, 999);

    // Buscar dados da semana
    const [pesquisas, todasRespostas, loja] = await Promise.all([
      base44.entities.Pesquisa.filter({ loja_id }),
      base44.entities.Resposta.filter({ loja_id }, '-created_date', 1000),
      base44.entities.Loja.filter({ id: loja_id })
    ]);

    const nomeLoja = loja[0]?.nome || 'Sua Loja';

    // Filtrar respostas da semana
    const respostasSemana = todasRespostas.filter(r => {
      const dataResposta = new Date(r.created_date);
      return dataResposta >= inicioSemana && dataResposta <= fimSemana;
    });

    // Filtrar respostas da semana anterior para comparação
    const inicioSemanaAnterior = new Date(inicioSemana);
    inicioSemanaAnterior.setDate(inicioSemanaAnterior.getDate() - 7);
    
    const respostasSemanaAnterior = todasRespostas.filter(r => {
      const dataResposta = new Date(r.created_date);
      return dataResposta >= inicioSemanaAnterior && dataResposta < inicioSemana;
    });

    // Calcular métricas da semana atual
    const leadsCapturados = respostasSemana.length;
    const pesquisasRespondidas = respostasSemana.filter(r => r.nota !== undefined).length;
    const cuponsGerados = respostasSemana.filter(r => r.cupom_gerado).length;
    const cuponsUtilizados = respostasSemana.filter(r => r.status_cupom === 'utilizado').length;
    const taxaConversao = cuponsGerados > 0 ? Math.round((cuponsUtilizados / cuponsGerados) * 100) : 0;

    const promotores = respostasSemana.filter(r => r.nota >= 9).length;
    const detratores = respostasSemana.filter(r => r.nota <= 6).length;
    const neutros = respostasSemana.filter(r => r.nota === 7 || r.nota === 8).length;
    const npsScore = pesquisasRespondidas > 0 
      ? Math.round(((promotores - detratores) / pesquisasRespondidas) * 100) 
      : 0;

    // Calcular métricas da semana anterior
    const leadsAnterior = respostasSemanaAnterior.length;
    const pesquisasAnterior = respostasSemanaAnterior.filter(r => r.nota !== undefined).length;
    const promotoresAnterior = respostasSemanaAnterior.filter(r => r.nota >= 9).length;
    const detratoresAnterior = respostasSemanaAnterior.filter(r => r.nota <= 6).length;
    const npsAnterior = pesquisasAnterior > 0 
      ? Math.round(((promotoresAnterior - detratoresAnterior) / pesquisasAnterior) * 100) 
      : 0;
    const cuponsGeradosAnterior = respostasSemanaAnterior.filter(r => r.cupom_gerado).length;
    const cuponsUtilizadosAnterior = respostasSemanaAnterior.filter(r => r.status_cupom === 'utilizado').length;
    const conversaoAnterior = cuponsGeradosAnterior > 0 
      ? Math.round((cuponsUtilizadosAnterior / cuponsGeradosAnterior) * 100) 
      : 0;

    // Calcular variações
    const leadsVariacao = leadsAnterior > 0 
      ? Math.round(((leadsCapturados - leadsAnterior) / leadsAnterior) * 100) 
      : (leadsCapturados > 0 ? 100 : 0);
    const npsVariacao = npsScore - npsAnterior;
    const conversaoVariacao = taxaConversao - conversaoAnterior;

    // Pegar comentários em destaque
    const comentariosDestaque = respostasSemana
      .filter(r => r.comentario && r.comentario.trim().length > 10)
      .slice(0, 5)
      .map(r => ({
        nota: r.nota,
        comentario: r.comentario,
        data: r.created_date
      }));

    // Gerar insights com IA
    const promptIA = `
Você é um consultor de negócios especializado em varejo e fidelização de clientes.
Analise os dados semanais desta loja e gere insights úteis e acionáveis.

DADOS DA SEMANA:
- Loja: ${nomeLoja}
- Leads capturados: ${leadsCapturados} (variação: ${leadsVariacao > 0 ? '+' : ''}${leadsVariacao}%)
- Pesquisas respondidas: ${pesquisasRespondidas}
- NPS Score: ${npsScore} (variação: ${npsVariacao > 0 ? '+' : ''}${npsVariacao} pontos)
- Promotores: ${promotores}, Neutros: ${neutros}, Detratores: ${detratores}
- Cupons gerados: ${cuponsGerados}
- Cupons utilizados: ${cuponsUtilizados}
- Taxa de conversão: ${taxaConversao}% (variação: ${conversaoVariacao > 0 ? '+' : ''}${conversaoVariacao}%)

COMENTÁRIOS RECENTES:
${comentariosDestaque.map(c => `- Nota ${c.nota}: "${c.comentario}"`).join('\n') || 'Nenhum comentário esta semana.'}

Gere um relatório com:
1. Um resumo executivo de 2-3 frases
2. 2-3 pontos positivos (se houver)
3. 2-3 pontos de atenção (se houver problemas)
4. 2-3 recomendações práticas e específicas

Seja direto, prático e motivador. Use linguagem simples e amigável.
`;

    let insightsIA = {
      resumo: '',
      pontos_positivos: [],
      pontos_atencao: [],
      recomendacoes: []
    };

    try {
      const iaResponse = await base44.integrations.Core.InvokeLLM({
        prompt: promptIA,
        response_json_schema: {
          type: 'object',
          properties: {
            resumo: { type: 'string' },
            pontos_positivos: { type: 'array', items: { type: 'string' } },
            pontos_atencao: { type: 'array', items: { type: 'string' } },
            recomendacoes: { type: 'array', items: { type: 'string' } }
          }
        }
      });
      insightsIA = iaResponse;
    } catch (iaError) {
      console.error('Erro ao gerar insights IA:', iaError);
      insightsIA = {
        resumo: `Esta semana sua loja capturou ${leadsCapturados} novos leads e teve um NPS de ${npsScore}.`,
        pontos_positivos: leadsCapturados > 0 ? ['Você teve atividade esta semana!'] : [],
        pontos_atencao: leadsCapturados === 0 ? ['Nenhum lead capturado esta semana'] : [],
        recomendacoes: ['Continue divulgando seu QR Code para capturar mais leads']
      };
    }

    // Criar o relatório
    const relatorio = await base44.entities.RelatorioSemanal.create({
      loja_id,
      user_id: user.id,
      semana_inicio: inicioSemana.toISOString().split('T')[0],
      semana_fim: fimSemana.toISOString().split('T')[0],
      metricas: {
        leads_capturados: leadsCapturados,
        pesquisas_respondidas: pesquisasRespondidas,
        cupons_gerados: cuponsGerados,
        cupons_utilizados: cuponsUtilizados,
        taxa_conversao: taxaConversao,
        nps_score: npsScore,
        promotores,
        neutros,
        detratores
      },
      comparacao_semana_anterior: {
        leads_variacao: leadsVariacao,
        nps_variacao: npsVariacao,
        conversao_variacao: conversaoVariacao
      },
      comentarios_destaque: comentariosDestaque,
      insights_ia: insightsIA
    });

    // Enviar email se solicitado
    if (send_email && user.email) {
      try {
        const emailHtml = gerarEmailHtml(nomeLoja, relatorio);
        
        await base44.integrations.Core.SendEmail({
          to: user.email,
          subject: `📊 Relatório Semanal - ${nomeLoja}`,
          body: emailHtml
        });

        await base44.entities.RelatorioSemanal.update(relatorio.id, {
          enviado_email: true,
          data_envio_email: new Date().toISOString()
        });
      } catch (emailError) {
        console.error('Erro ao enviar email:', emailError);
      }
    }

    return Response.json({
      success: true,
      relatorio
    });

  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    return Response.json({ 
      error: 'Erro ao gerar relatório',
      details: error.message 
    }, { status: 500 });
  }
});

function gerarEmailHtml(nomeLoja, relatorio) {
  const { metricas, comparacao_semana_anterior, insights_ia, comentarios_destaque } = relatorio;
  
  const formatVariacao = (valor) => {
    if (valor > 0) return `<span style="color: #16a34a;">↑ +${valor}%</span>`;
    if (valor < 0) return `<span style="color: #dc2626;">↓ ${valor}%</span>`;
    return '<span style="color: #6b7280;">→ 0%</span>';
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">📊 Relatório Semanal</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">${nomeLoja}</p>
      <p style="color: rgba(255,255,255,0.7); margin: 5px 0 0 0; font-size: 14px;">
        ${relatorio.semana_inicio} a ${relatorio.semana_fim}
      </p>
    </div>

    <!-- Resumo IA -->
    <div style="background: white; padding: 25px; border-bottom: 1px solid #e5e7eb;">
      <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">💡 Resumo da Semana</h2>
      <p style="color: #4b5563; line-height: 1.6; margin: 0;">${insights_ia.resumo}</p>
    </div>

    <!-- Métricas Principais -->
    <div style="background: white; padding: 25px; border-bottom: 1px solid #e5e7eb;">
      <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 18px;">📈 Números da Semana</h2>
      
      <div style="display: flex; flex-wrap: wrap; gap: 15px;">
        <div style="flex: 1; min-width: 120px; background: #f0fdf4; padding: 15px; border-radius: 12px; text-align: center;">
          <div style="font-size: 28px; font-weight: bold; color: #16a34a;">${metricas.leads_capturados}</div>
          <div style="font-size: 12px; color: #166534;">Leads Capturados</div>
          <div style="font-size: 11px; margin-top: 5px;">${formatVariacao(comparacao_semana_anterior.leads_variacao)}</div>
        </div>
        
        <div style="flex: 1; min-width: 120px; background: #eff6ff; padding: 15px; border-radius: 12px; text-align: center;">
          <div style="font-size: 28px; font-weight: bold; color: #2563eb;">${metricas.nps_score}</div>
          <div style="font-size: 12px; color: #1e40af;">NPS Score</div>
          <div style="font-size: 11px; margin-top: 5px;">${formatVariacao(comparacao_semana_anterior.nps_variacao)}</div>
        </div>
        
        <div style="flex: 1; min-width: 120px; background: #fdf4ff; padding: 15px; border-radius: 12px; text-align: center;">
          <div style="font-size: 28px; font-weight: bold; color: #9333ea;">${metricas.taxa_conversao}%</div>
          <div style="font-size: 12px; color: #7e22ce;">Conversão</div>
          <div style="font-size: 11px; margin-top: 5px;">${formatVariacao(comparacao_semana_anterior.conversao_variacao)}</div>
        </div>
      </div>

      <div style="margin-top: 20px; padding: 15px; background: #f9fafb; border-radius: 12px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #6b7280; font-size: 14px;">Cupons Gerados</span>
          <span style="color: #1f2937; font-weight: 600;">${metricas.cupons_gerados}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #6b7280; font-size: 14px;">Cupons Utilizados</span>
          <span style="color: #1f2937; font-weight: 600;">${metricas.cupons_utilizados}</span>
        </div>
      </div>
    </div>

    <!-- Insights -->
    ${insights_ia.pontos_positivos?.length > 0 ? `
    <div style="background: white; padding: 25px; border-bottom: 1px solid #e5e7eb;">
      <h2 style="margin: 0 0 15px 0; color: #16a34a; font-size: 16px;">✅ Pontos Positivos</h2>
      <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
        ${insights_ia.pontos_positivos.map(p => `<li style="margin-bottom: 8px;">${p}</li>`).join('')}
      </ul>
    </div>
    ` : ''}

    ${insights_ia.pontos_atencao?.length > 0 ? `
    <div style="background: white; padding: 25px; border-bottom: 1px solid #e5e7eb;">
      <h2 style="margin: 0 0 15px 0; color: #f59e0b; font-size: 16px;">⚠️ Pontos de Atenção</h2>
      <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
        ${insights_ia.pontos_atencao.map(p => `<li style="margin-bottom: 8px;">${p}</li>`).join('')}
      </ul>
    </div>
    ` : ''}

    ${insights_ia.recomendacoes?.length > 0 ? `
    <div style="background: white; padding: 25px; border-bottom: 1px solid #e5e7eb;">
      <h2 style="margin: 0 0 15px 0; color: #6366f1; font-size: 16px;">💡 Recomendações</h2>
      <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
        ${insights_ia.recomendacoes.map(r => `<li style="margin-bottom: 8px;">${r}</li>`).join('')}
      </ul>
    </div>
    ` : ''}

    <!-- Comentários Destaque -->
    ${comentarios_destaque?.length > 0 ? `
    <div style="background: white; padding: 25px; border-bottom: 1px solid #e5e7eb;">
      <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 16px;">💬 O que seus clientes disseram</h2>
      ${comentarios_destaque.map(c => `
        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid ${c.nota >= 9 ? '#16a34a' : c.nota >= 7 ? '#f59e0b' : '#dc2626'};">
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 5px;">Nota: ${c.nota}/10</div>
          <p style="margin: 0; color: #374151; font-style: italic;">"${c.comentario}"</p>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <!-- Footer -->
    <div style="background: #1f2937; padding: 25px; border-radius: 0 0 16px 16px; text-align: center;">
      <p style="color: rgba(255,255,255,0.8); margin: 0 0 15px 0; font-size: 14px;">
        Continue acompanhando seus resultados no painel do Cupom.Moda
      </p>
      <a href="https://cupom.moda" style="display: inline-block; background: #6366f1; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">
        Acessar Dashboard
      </a>
      <p style="color: rgba(255,255,255,0.5); margin: 20px 0 0 0; font-size: 12px;">
        © ${new Date().getFullYear()} Cupom.Moda - Todos os direitos reservados
      </p>
    </div>

  </div>
</body>
</html>
  `;
}