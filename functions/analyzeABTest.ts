import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Não autenticado' }, { status: 401 });
        }

        const { campanhaId } = await req.json();
        
        if (!campanhaId) {
            return Response.json({ error: 'campanhaId é obrigatório' }, { status: 400 });
        }

        // Buscar campanha
        const campanha = await base44.entities.EmailCampanha.get(campanhaId);
        if (!campanha || !campanha.is_teste_ab) {
            return Response.json({ error: 'Campanha não é um teste A/B' }, { status: 400 });
        }

        // Buscar todas as variantes
        const variantes = await base44.entities.EmailCampanhaVariante.filter({ 
            campanha_id: campanhaId 
        });

        if (variantes.length < 2) {
            return Response.json({ error: 'Teste A/B precisa de pelo menos 2 variantes' }, { status: 400 });
        }

        // Calcular métricas para cada variante
        const variantesComScore = variantes.map(v => {
            const metricas = v.metricas || {};
            const enviados = metricas.enviados || 0;
            
            if (enviados === 0) {
                return { ...v, score: 0 };
            }

            // Calcular taxas
            const taxaAbertura = (metricas.abertos || 0) / enviados;
            const taxaCliques = (metricas.cliques || 0) / enviados;
            const taxaConversao = (metricas.conversoes || 0) / enviados;

            // Score ponderado baseado na métrica de decisão
            let score = 0;
            const metricaDecisao = campanha.teste_ab_config?.metrica_decisao || 'taxa_abertura';
            
            if (metricaDecisao === 'taxa_abertura') {
                score = taxaAbertura * 100;
            } else if (metricaDecisao === 'taxa_cliques') {
                score = (taxaAbertura * 0.3 + taxaCliques * 0.7) * 100;
            } else if (metricaDecisao === 'conversao') {
                score = (taxaAbertura * 0.2 + taxaCliques * 0.3 + taxaConversao * 0.5) * 100;
            }

            return {
                ...v,
                score,
                taxaAbertura: (taxaAbertura * 100).toFixed(2),
                taxaCliques: (taxaCliques * 100).toFixed(2),
                taxaConversao: (taxaConversao * 100).toFixed(2)
            };
        });

        // Ordenar por score
        variantesComScore.sort((a, b) => b.score - a.score);

        const vencedora = variantesComScore[0];
        const segundaColocada = variantesComScore[1];

        // Calcular diferença percentual
        const diferencaPercentual = vencedora.score > 0 
            ? ((vencedora.score - segundaColocada.score) / vencedora.score * 100).toFixed(2)
            : 0;

        // Calcular confiança estatística (simplificado)
        const enviadosTotal = variantesComScore.reduce((acc, v) => acc + (v.metricas?.enviados || 0), 0);
        const confiancaEstatistica = Math.min(95, Math.max(50, enviadosTotal / 10)); // Quanto mais dados, maior a confiança

        // Preparar contexto para IA
        const contexto = {
            campanha_titulo: campanha.titulo,
            metrica_decisao: campanha.teste_ab_config?.metrica_decisao,
            variantes: variantesComScore.map(v => ({
                letra: v.letra_variante,
                assunto: v.assunto,
                score: v.score.toFixed(2),
                taxa_abertura: v.taxaAbertura,
                taxa_cliques: v.taxaCliques,
                enviados: v.metricas?.enviados || 0,
                abertos: v.metricas?.abertos || 0,
                cliques: v.metricas?.cliques || 0
            })),
            vencedora: {
                letra: vencedora.letra_variante,
                assunto: vencedora.assunto,
                score: vencedora.score.toFixed(2)
            },
            diferenca: diferencaPercentual
        };

        const prompt = `Você é um especialista em análise de testes A/B para email marketing.

Analise os resultados deste teste A/B e forneça insights acionáveis:

CAMPANHA: ${contexto.campanha_titulo}
MÉTRICA DE DECISÃO: ${contexto.metrica_decisao}

RESULTADOS DAS VARIANTES:
${contexto.variantes.map((v, i) => `
${i + 1}. Variante ${v.letra}
   Assunto: "${v.assunto}"
   Score: ${v.score}
   Taxa Abertura: ${v.taxa_abertura}%
   Taxa Cliques: ${v.taxa_cliques}%
   Enviados: ${v.enviados}
   Abertos: ${v.abertos}
   Cliques: ${v.cliques}
`).join('\n')}

VENCEDORA: Variante ${contexto.vencedora.letra}
DIFERENÇA: ${contexto.diferenca}% superior à segunda colocada

Forneça:
1. Motivo da vitória (por que esta variante performou melhor)
2. Insights principais (3-5 insights acionáveis)
3. Recomendações para próximas campanhas
4. Aprendizados sobre o que funciona com este público

Responda em JSON:
{
  "motivo_vitoria": "explicação detalhada",
  "insights": ["insight 1", "insight 2", "insight 3"],
  "recomendacoes": ["recomendação 1", "recomendação 2"],
  "aprendizados": ["aprendizado 1", "aprendizado 2"]
}`;

        const aiResponse = await base44.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    motivo_vitoria: { type: "string" },
                    insights: {
                        type: "array",
                        items: { type: "string" }
                    },
                    recomendacoes: {
                        type: "array",
                        items: { type: "string" }
                    },
                    aprendizados: {
                        type: "array",
                        items: { type: "string" }
                    }
                }
            }
        });

        // Atualizar variante vencedora
        await base44.entities.EmailCampanhaVariante.update(vencedora.id, {
            is_vencedora: true,
            score_performance: vencedora.score
        });

        // Atualizar campanha
        await base44.entities.EmailCampanha.update(campanhaId, {
            status: 'teste_ab_concluido',
            'teste_ab_config.variante_vencedora': vencedora.id,
            'teste_ab_config.status_teste': 'concluido',
            'teste_ab_config.data_fim_teste': new Date().toISOString()
        });

        // Criar registro de resultado
        const resultado = await base44.entities.EmailABTestResult.create({
            campanha_id: campanhaId,
            loja_id: campanha.loja_id,
            variante_vencedora_id: vencedora.id,
            variante_vencedora_letra: vencedora.letra_variante,
            diferenca_percentual: parseFloat(diferencaPercentual),
            metrica_decisao: campanha.teste_ab_config?.metrica_decisao,
            confianca_estatistica: confiancaEstatistica,
            analise_ia: aiResponse,
            comparacao_variantes: variantesComScore.map(v => ({
                variante_letra: v.letra_variante,
                taxa_abertura: parseFloat(v.taxaAbertura),
                taxa_cliques: parseFloat(v.taxaCliques),
                score: v.score
            })),
            data_conclusao: new Date().toISOString()
        });

        return Response.json({
            success: true,
            resultado: {
                vencedora: {
                    id: vencedora.id,
                    letra: vencedora.letra_variante,
                    assunto: vencedora.assunto,
                    score: vencedora.score
                },
                diferenca_percentual: diferencaPercentual,
                confianca_estatistica: confiancaEstatistica,
                analise_ia: aiResponse,
                variantes_completo: variantesComScore
            }
        });

    } catch (error) {
        console.error('Erro ao analisar teste A/B:', error);
        return Response.json({ 
            error: 'Erro interno do servidor', 
            details: error.message 
        }, { status: 500 });
    }
});