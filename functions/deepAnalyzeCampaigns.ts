import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Não autenticado' }, { status: 401 });
        }

        // Buscar todas as campanhas enviadas
        const campanhas = await base44.entities.EmailCampanha.filter({ 
            loja_id: user.loja_id,
            status: 'enviada'
        });

        if (campanhas.length === 0) {
            return Response.json({ 
                error: 'Sem campanhas suficientes para análise profunda',
                message: 'Envie pelo menos 1 campanha antes de usar esta análise'
            }, { status: 400 });
        }

        // Buscar testes A/B concluídos
        const testesAB = await base44.entities.EmailABTestResult.filter({ 
            loja_id: user.loja_id 
        });

        // Buscar perfil de audiência
        const respostas = await base44.entities.Resposta.filter({ loja_id: user.loja_id });

        // Análise de padrões temporais
        const campanhasPorDia = {};
        const campanhasPorHora = {};
        
        campanhas.forEach(c => {
            if (c.data_envio) {
                const data = new Date(c.data_envio);
                const dia = data.getDay();
                const hora = data.getHours();
                
                if (!campanhasPorDia[dia]) campanhasPorDia[dia] = [];
                if (!campanhasPorHora[hora]) campanhasPorHora[hora] = [];
                
                campanhasPorDia[dia].push(c.metricas?.taxa_abertura || 0);
                campanhasPorHora[hora].push(c.metricas?.taxa_abertura || 0);
            }
        });

        // Análise de assuntos
        const assuntos = campanhas.map(c => ({
            assunto: c.assunto,
            taxa_abertura: c.metricas?.taxa_abertura || 0,
            taxa_cliques: c.metricas?.taxa_cliques || 0
        }));

        // Análise de tipos de campanha
        const porTipo = {};
        campanhas.forEach(c => {
            if (!porTipo[c.tipo_campanha]) {
                porTipo[c.tipo_campanha] = {
                    quantidade: 0,
                    soma_abertura: 0,
                    soma_cliques: 0
                };
            }
            porTipo[c.tipo_campanha].quantidade++;
            porTipo[c.tipo_campanha].soma_abertura += c.metricas?.taxa_abertura || 0;
            porTipo[c.tipo_campanha].soma_cliques += c.metricas?.taxa_cliques || 0;
        });

        const prompt = `Você é um cientista de dados especializado em análise de campanhas de email marketing.

Realize uma análise PROFUNDA e ESTRATÉGICA dos dados históricos desta loja.

DADOS DISPONÍVEIS:

CAMPANHAS:
- Total de campanhas: ${campanhas.length}
- Melhor taxa de abertura: ${Math.max(...campanhas.map(c => c.metricas?.taxa_abertura || 0)).toFixed(1)}%
- Pior taxa de abertura: ${Math.min(...campanhas.map(c => c.metricas?.taxa_abertura || 0)).toFixed(1)}%
- Média geral de abertura: ${(campanhas.reduce((acc, c) => acc + (c.metricas?.taxa_abertura || 0), 0) / campanhas.length).toFixed(1)}%
- Média geral de cliques: ${(campanhas.reduce((acc, c) => acc + (c.metricas?.taxa_cliques || 0), 0) / campanhas.length).toFixed(1)}%

PERFORMANCE POR TIPO:
${Object.entries(porTipo).map(([tipo, data]) => `
${tipo}: ${data.quantidade} campanhas
  - Média abertura: ${(data.soma_abertura / data.quantidade).toFixed(1)}%
  - Média cliques: ${(data.soma_cliques / data.quantidade).toFixed(1)}%`).join('')}

TOP 5 ASSUNTOS POR ABERTURA:
${assuntos.sort((a, b) => b.taxa_abertura - a.taxa_abertura).slice(0, 5).map((a, i) => 
    `${i + 1}. "${a.assunto}" - ${a.taxa_abertura.toFixed(1)}% abertura`).join('\n')}

TESTES A/B REALIZADOS: ${testesAB.length}
${testesAB.length > 0 ? `\nAPRENDIZADOS DOS TESTES:\n${testesAB.map(t => 
    `- Variante ${t.variante_vencedora_letra} venceu por ${t.diferenca_percentual}%`).join('\n')}` : ''}

AUDIÊNCIA:
- Total de contatos: ${respostas.length}
- Promotores: ${respostas.filter(r => r.nota >= 9).length}
- Detratores: ${respostas.filter(r => r.nota <= 6).length}

ANÁLISE REQUERIDA:

1. PADRÕES DESCOBERTOS: Identifique padrões ocultos nos dados que revelam o que funciona
2. SEGMENTAÇÃO INTELIGENTE: Sugira segmentações estratégicas baseadas em comportamento
3. OTIMIZAÇÕES CONCRETAS: Forneça ações específicas, não genéricas
4. ESTRATÉGIA FUTURA: Crie um plano de ação para próximas campanhas
5. OPORTUNIDADES PERDIDAS: O que ainda não foi explorado?
6. PREVISÕES: Com base nos padrões, o que esperar daqui pra frente?

Responda em JSON:
{
  "resumo_executivo": "análise em 2-3 linhas",
  "score_saude_email_marketing": 0-100,
  "padroes_descobertos": [
    {
      "padrao": "nome do padrão",
      "evidencia": "dados que comprovam",
      "acao_recomendada": "o que fazer com isso",
      "impacto_potencial": "alto|medio|baixo"
    }
  ],
  "segmentacoes_sugeridas": [
    {
      "nome_segmento": "nome do segmento",
      "criterios": "como criar este segmento",
      "tipo_conteudo_ideal": "que tipo de email enviar",
      "frequencia_sugerida": "com que frequência",
      "resultado_esperado": "o que esperar"
    }
  ],
  "otimizacoes_concretas": [
    {
      "area": "assunto|conteudo|timing|frequencia|segmentacao",
      "problema_identificado": "o que está errado",
      "solucao_especifica": "o que fazer exatamente",
      "como_implementar": "passo a passo",
      "ganho_estimado": "impacto esperado"
    }
  ],
  "estrategia_90_dias": {
    "objetivo_principal": "meta clara",
    "kpis": ["kpi 1", "kpi 2"],
    "acoes_mensais": {
      "mes_1": ["ação 1", "ação 2"],
      "mes_2": ["ação 1", "ação 2"],
      "mes_3": ["ação 1", "ação 2"]
    }
  },
  "oportunidades_nao_exploradas": [
    {
      "oportunidade": "o que fazer",
      "por_que_funciona": "justificativa",
      "como_testar": "como começar"
    }
  ],
  "previsoes_proximos_meses": {
    "tendencia": "crescimento|estavel|declinio",
    "taxa_abertura_prevista": "X-Y%",
    "taxa_cliques_prevista": "X-Y%",
    "fatores_risco": ["risco 1", "risco 2"],
    "fatores_oportunidade": ["oportunidade 1", "oportunidade 2"]
  },
  "comparacao_mercado": {
    "posicao": "acima|na_media|abaixo",
    "gap_lider": "X%",
    "o_que_fazer_para_chegar_la": "estratégia"
  }
}`;

        const aiResponse = await base44.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    resumo_executivo: { type: "string" },
                    score_saude_email_marketing: { type: "number" },
                    padroes_descobertos: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                padrao: { type: "string" },
                                evidencia: { type: "string" },
                                acao_recomendada: { type: "string" },
                                impacto_potencial: { type: "string" }
                            }
                        }
                    },
                    segmentacoes_sugeridas: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                nome_segmento: { type: "string" },
                                criterios: { type: "string" },
                                tipo_conteudo_ideal: { type: "string" },
                                frequencia_sugerida: { type: "string" },
                                resultado_esperado: { type: "string" }
                            }
                        }
                    },
                    otimizacoes_concretas: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                area: { type: "string" },
                                problema_identificado: { type: "string" },
                                solucao_especifica: { type: "string" },
                                como_implementar: { type: "string" },
                                ganho_estimado: { type: "string" }
                            }
                        }
                    },
                    estrategia_90_dias: {
                        type: "object",
                        properties: {
                            objetivo_principal: { type: "string" },
                            kpis: {
                                type: "array",
                                items: { type: "string" }
                            },
                            acoes_mensais: {
                                type: "object",
                                properties: {
                                    mes_1: {
                                        type: "array",
                                        items: { type: "string" }
                                    },
                                    mes_2: {
                                        type: "array",
                                        items: { type: "string" }
                                    },
                                    mes_3: {
                                        type: "array",
                                        items: { type: "string" }
                                    }
                                }
                            }
                        }
                    },
                    oportunidades_nao_exploradas: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                oportunidade: { type: "string" },
                                por_que_funciona: { type: "string" },
                                como_testar: { type: "string" }
                            }
                        }
                    },
                    previsoes_proximos_meses: {
                        type: "object",
                        properties: {
                            tendencia: { type: "string" },
                            taxa_abertura_prevista: { type: "string" },
                            taxa_cliques_prevista: { type: "string" },
                            fatores_risco: {
                                type: "array",
                                items: { type: "string" }
                            },
                            fatores_oportunidade: {
                                type: "array",
                                items: { type: "string" }
                            }
                        }
                    },
                    comparacao_mercado: {
                        type: "object",
                        properties: {
                            posicao: { type: "string" },
                            gap_lider: { type: "string" },
                            o_que_fazer_para_chegar_la: { type: "string" }
                        }
                    }
                }
            }
        });

        return Response.json({
            success: true,
            analise: aiResponse,
            dados_base: {
                total_campanhas: campanhas.length,
                total_testes_ab: testesAB.length,
                total_audiencia: respostas.length
            }
        });

    } catch (error) {
        console.error('Erro na análise profunda:', error);
        return Response.json({ 
            error: 'Erro interno do servidor', 
            details: error.message 
        }, { status: 500 });
    }
});