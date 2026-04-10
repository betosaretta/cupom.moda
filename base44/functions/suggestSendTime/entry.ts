import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Não autenticado' }, { status: 401 });
        }

        const { tipo_campanha, segmento_alvo } = await req.json();

        // Buscar campanhas anteriores para análise
        const campanhasAnteriores = await base44.entities.EmailCampanha.filter({ 
            loja_id: user.loja_id,
            status: 'enviada'
        });

        // Buscar dados dos clientes
        const respostas = await base44.entities.Resposta.filter({ loja_id: user.loja_id });

        // Análise baseada em dados históricos
        let melhoresHorarios = [];
        if (campanhasAnteriores.length > 0) {
            // Analisar performance por horário
            campanhasAnteriores.forEach(campanha => {
                if (campanha.data_envio && campanha.metricas) {
                    const hora = new Date(campanha.data_envio).getHours();
                    const dia_semana = new Date(campanha.data_envio).getDay();
                    
                    melhoresHorarios.push({
                        hora,
                        dia_semana,
                        taxa_abertura: campanha.metricas.taxa_abertura || 0,
                        taxa_cliques: campanha.metricas.taxa_cliques || 0
                    });
                }
            });
        }

        // Preparar contexto para IA
        const contexto = {
            tipo_campanha,
            segmento_alvo: segmento_alvo || {},
            total_clientes: respostas.length,
            tem_historico: campanhasAnteriores.length > 0,
            melhores_horarios: melhoresHorarios.slice(0, 5)
        };

        const prompt = `Você é um especialista em email marketing e timing de campanhas.

Analise o contexto e sugira o melhor horário para enviar esta campanha:

Tipo de campanha: ${contexto.tipo_campanha}
Segmento: ${JSON.stringify(contexto.segmento_alvo)}
Total de clientes: ${contexto.total_clientes}
${contexto.tem_historico ? `\nDados históricos:\n${JSON.stringify(contexto.melhores_horarios, null, 2)}` : 'Sem histórico anterior'}

Baseado em:
1. Melhores práticas de email marketing
2. Comportamento do setor de moda/varejo
3. Dados históricos (se disponíveis)
4. Tipo de campanha e urgência

Recomende:
- Dia da semana ideal
- Horário específico
- Justificativa da escolha
- Alternativas (2º e 3º melhor horário)

Responda em JSON:
{
  "recomendacao_principal": {
    "dia_semana": "nome do dia",
    "dia_numero": 0-6,
    "horario": "HH:00",
    "hora_numero": 0-23,
    "motivo": "explicação"
  },
  "alternativas": [
    {
      "dia_semana": "nome",
      "horario": "HH:00",
      "motivo": "explicação"
    }
  ],
  "insights": [
    "insight 1",
    "insight 2"
  ],
  "horarios_evitar": [
    "horário e motivo"
  ]
}`;

        const aiResponse = await base44.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    recomendacao_principal: {
                        type: "object",
                        properties: {
                            dia_semana: { type: "string" },
                            dia_numero: { type: "number" },
                            horario: { type: "string" },
                            hora_numero: { type: "number" },
                            motivo: { type: "string" }
                        }
                    },
                    alternativas: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                dia_semana: { type: "string" },
                                horario: { type: "string" },
                                motivo: { type: "string" }
                            }
                        }
                    },
                    insights: {
                        type: "array",
                        items: { type: "string" }
                    },
                    horarios_evitar: {
                        type: "array",
                        items: { type: "string" }
                    }
                }
            }
        });

        return Response.json({
            success: true,
            sugestao: aiResponse
        });

    } catch (error) {
        console.error('Erro ao sugerir horário:', error);
        return Response.json({ 
            error: 'Erro interno do servidor', 
            details: error.message 
        }, { status: 500 });
    }
});