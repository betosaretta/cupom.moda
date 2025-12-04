import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Não autenticado' }, { status: 401 });
        }

        const { assunto, conteudo_html, tipo_campanha, segmento_alvo } = await req.json();
        
        if (!assunto || !conteudo_html) {
            return Response.json({ error: 'assunto e conteudo_html são obrigatórios' }, { status: 400 });
        }

        // Buscar histórico de campanhas
        const campanhasAnteriores = await base44.entities.EmailCampanha.filter({ 
            loja_id: user.loja_id,
            status: 'enviada'
        });

        // Buscar dados de audiência
        const respostas = await base44.entities.Resposta.filter({ loja_id: user.loja_id });

        // Calcular benchmarks históricos
        const benchmarks = {
            media_abertura: 0,
            media_cliques: 0,
            melhor_abertura: 0,
            melhor_cliques: 0,
            total_campanhas: campanhasAnteriores.length
        };

        if (campanhasAnteriores.length > 0) {
            benchmarks.media_abertura = campanhasAnteriores.reduce((acc, c) => 
                acc + (c.metricas?.taxa_abertura || 0), 0) / campanhasAnteriores.length;
            benchmarks.media_cliques = campanhasAnteriores.reduce((acc, c) => 
                acc + (c.metricas?.taxa_cliques || 0), 0) / campanhasAnteriores.length;
            benchmarks.melhor_abertura = Math.max(...campanhasAnteriores.map(c => c.metricas?.taxa_abertura || 0));
            benchmarks.melhor_cliques = Math.max(...campanhasAnteriores.map(c => c.metricas?.taxa_cliques || 0));
        }

        // Análise do assunto
        const assuntoLength = assunto.length;
        const temEmojis = /[\u{1F300}-\u{1F9FF}]/u.test(assunto);
        const temNumeros = /\d/.test(assunto);
        const temPalavrasUrgencia = /(urgente|último|hoje|agora|expira|acaba)/i.test(assunto);
        const temPersonalizacao = /\[NOME/i.test(assunto);

        // Análise do conteúdo
        const conteudoLength = conteudo_html.length;
        const numCTAs = (conteudo_html.match(/<button|<a.*href/gi) || []).length;
        const temImagens = /<img/i.test(conteudo_html);

        const prompt = `Você é um cientista de dados especializado em email marketing.

Analise esta campanha e preveja seu desempenho baseado em dados históricos e melhores práticas.

CAMPANHA PARA ANÁLISE:
- Assunto: "${assunto}"
- Tipo: ${tipo_campanha}
- Segmento: ${JSON.stringify(segmento_alvo)}

CARACTERÍSTICAS DO ASSUNTO:
- Comprimento: ${assuntoLength} caracteres (ideal: 30-50)
- Tem emojis: ${temEmojis ? 'Sim' : 'Não'}
- Tem números: ${temNumeros ? 'Sim' : 'Não'}
- Palavras de urgência: ${temPalavrasUrgencia ? 'Sim' : 'Não'}
- Personalização: ${temPersonalizacao ? 'Sim' : 'Não'}

CARACTERÍSTICAS DO CONTEÚDO:
- Tamanho: ${conteudoLength} caracteres
- CTAs encontrados: ${numCTAs}
- Tem imagens: ${temImagens ? 'Sim' : 'Não'}

HISTÓRICO DA LOJA:
- Campanhas anteriores: ${benchmarks.total_campanhas}
${benchmarks.total_campanhas > 0 ? `
- Taxa média de abertura: ${benchmarks.media_abertura.toFixed(1)}%
- Taxa média de cliques: ${benchmarks.media_cliques.toFixed(1)}%
- Melhor abertura: ${benchmarks.melhor_abertura}%
- Melhor cliques: ${benchmarks.melhor_cliques}%` : ''}
- Total de clientes: ${respostas.length}

BENCHMARKS DO SETOR (Moda/Varejo):
- Taxa média de abertura: 22%
- Taxa média de cliques: 3.5%

Com base em análise de dados, preveja o desempenho desta campanha e forneça recomendações.

Responda em JSON:
{
  "previsao": {
    "taxa_abertura": {
      "estimativa": 0-100,
      "confianca": 0-100,
      "range_min": 0-100,
      "range_max": 0-100
    },
    "taxa_cliques": {
      "estimativa": 0-100,
      "confianca": 0-100,
      "range_min": 0-100,
      "range_max": 0-100
    },
    "score_geral": 0-100
  },
  "fatores_positivos": [
    {
      "fator": "nome do fator",
      "impacto": "alto|medio|baixo",
      "explicacao": "por que é positivo"
    }
  ],
  "fatores_negativos": [
    {
      "fator": "nome do fator",
      "impacto": "alto|medio|baixo",
      "explicacao": "por que é negativo"
    }
  ],
  "otimizacoes_sugeridas": [
    {
      "tipo": "assunto|conteudo|cta|timing",
      "sugestao": "o que fazer",
      "impacto_estimado": "+X% em abertura/cliques",
      "prioridade": "alta|media|baixa"
    }
  ],
  "comparacao_historico": "como se compara com campanhas anteriores",
  "probabilidade_sucesso": "baixa|media|alta",
  "recomendacao_envio": "enviar|otimizar_antes|fazer_mais_testes"
}`;

        const aiResponse = await base44.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    previsao: {
                        type: "object",
                        properties: {
                            taxa_abertura: {
                                type: "object",
                                properties: {
                                    estimativa: { type: "number" },
                                    confianca: { type: "number" },
                                    range_min: { type: "number" },
                                    range_max: { type: "number" }
                                }
                            },
                            taxa_cliques: {
                                type: "object",
                                properties: {
                                    estimativa: { type: "number" },
                                    confianca: { type: "number" },
                                    range_min: { type: "number" },
                                    range_max: { type: "number" }
                                }
                            },
                            score_geral: { type: "number" }
                        }
                    },
                    fatores_positivos: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                fator: { type: "string" },
                                impacto: { type: "string" },
                                explicacao: { type: "string" }
                            }
                        }
                    },
                    fatores_negativos: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                fator: { type: "string" },
                                impacto: { type: "string" },
                                explicacao: { type: "string" }
                            }
                        }
                    },
                    otimizacoes_sugeridas: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                tipo: { type: "string" },
                                sugestao: { type: "string" },
                                impacto_estimado: { type: "string" },
                                prioridade: { type: "string" }
                            }
                        }
                    },
                    comparacao_historico: { type: "string" },
                    probabilidade_sucesso: { type: "string" },
                    recomendacao_envio: { type: "string" }
                }
            }
        });

        return Response.json({
            success: true,
            previsao: aiResponse
        });

    } catch (error) {
        console.error('Erro ao prever performance:', error);
        return Response.json({ 
            error: 'Erro interno do servidor', 
            details: error.message 
        }, { status: 500 });
    }
});