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
        if (!campanha) {
            return Response.json({ error: 'Campanha não encontrada' }, { status: 404 });
        }

        // Buscar todas as campanhas para benchmark
        const todasCampanhas = await base44.entities.EmailCampanha.filter({ 
            loja_id: user.loja_id,
            status: 'enviada'
        });

        // Calcular médias
        const mediaAberturas = todasCampanhas.reduce((acc, c) => 
            acc + (c.metricas?.taxa_abertura || 0), 0) / (todasCampanhas.length || 1);
        
        const mediaCliques = todasCampanhas.reduce((acc, c) => 
            acc + (c.metricas?.taxa_cliques || 0), 0) / (todasCampanhas.length || 1);

        // Preparar contexto para IA
        const contexto = {
            campanha: {
                titulo: campanha.titulo,
                assunto: campanha.assunto,
                tipo: campanha.tipo_campanha,
                metricas: campanha.metricas || {}
            },
            benchmarks: {
                media_abertura_loja: mediaAberturas.toFixed(2),
                media_cliques_loja: mediaCliques.toFixed(2),
                media_setor_abertura: '22%', // Benchmark do setor moda
                media_setor_cliques: '3.5%'
            },
            total_campanhas: todasCampanhas.length
        };

        const prompt = `Você é um especialista em análise de campanhas de email marketing.

Analise o desempenho desta campanha e forneça insights acionáveis:

CAMPANHA:
- Título: ${contexto.campanha.titulo}
- Assunto: ${contexto.campanha.assunto}
- Tipo: ${contexto.campanha.tipo}

MÉTRICAS:
- Enviados: ${contexto.campanha.metricas.total_enviados || 0}
- Abertos: ${contexto.campanha.metricas.total_abertos || 0}
- Taxa de Abertura: ${contexto.campanha.metricas.taxa_abertura || 0}%
- Cliques: ${contexto.campanha.metricas.total_cliques || 0}
- Taxa de Cliques: ${contexto.campanha.metricas.taxa_cliques || 0}%

BENCHMARKS:
- Sua média de abertura: ${contexto.benchmarks.media_abertura_loja}%
- Sua média de cliques: ${contexto.benchmarks.media_cliques_loja}%
- Média do setor abertura: ${contexto.benchmarks.media_setor_abertura}
- Média do setor cliques: ${contexto.benchmarks.media_setor_cliques}

Total de campanhas anteriores: ${contexto.total_campanhas}

Forneça:
1. Avaliação geral (excelente/boa/regular/ruim)
2. Pontos fortes da campanha
3. Pontos de melhoria específicos
4. Recomendações práticas e acionáveis
5. Score de qualidade (0-100)
6. O que testar na próxima campanha

Responda em JSON:
{
  "avaliacao_geral": "excelente|boa|regular|ruim",
  "score_qualidade": 0-100,
  "resumo": "resumo da análise",
  "pontos_fortes": ["ponto 1", "ponto 2"],
  "areas_melhoria": ["área 1", "área 2"],
  "recomendacoes": [
    {
      "categoria": "assunto|conteudo|timing|segmentacao",
      "recomendacao": "descrição",
      "impacto_esperado": "alto|medio|baixo"
    }
  ],
  "proximos_testes": ["teste 1", "teste 2"],
  "insights": ["insight 1", "insight 2"]
}`;

        const aiResponse = await base44.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    avaliacao_geral: { type: "string" },
                    score_qualidade: { type: "number" },
                    resumo: { type: "string" },
                    pontos_fortes: {
                        type: "array",
                        items: { type: "string" }
                    },
                    areas_melhoria: {
                        type: "array",
                        items: { type: "string" }
                    },
                    recomendacoes: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                categoria: { type: "string" },
                                recomendacao: { type: "string" },
                                impacto_esperado: { type: "string" }
                            }
                        }
                    },
                    proximos_testes: {
                        type: "array",
                        items: { type: "string" }
                    },
                    insights: {
                        type: "array",
                        items: { type: "string" }
                    }
                }
            }
        });

        // Atualizar campanha com análise
        await base44.entities.EmailCampanha.update(campanhaId, {
            analise_ia: {
                score_qualidade: aiResponse.score_qualidade,
                pontos_fortes: aiResponse.pontos_fortes,
                sugestoes_melhoria: aiResponse.areas_melhoria,
                previsao_desempenho: aiResponse.resumo
            }
        });

        return Response.json({
            success: true,
            analise: aiResponse
        });

    } catch (error) {
        console.error('Erro ao analisar performance:', error);
        return Response.json({ 
            error: 'Erro interno do servidor', 
            details: error.message 
        }, { status: 500 });
    }
});