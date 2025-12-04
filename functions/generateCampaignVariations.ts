import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Não autenticado' }, { status: 401 });
        }

        const { tipo_campanha, objetivo, cupom_info, loja_info, num_variantes = 4 } = await req.json();
        
        if (!tipo_campanha) {
            return Response.json({ error: 'tipo_campanha é obrigatório' }, { status: 400 });
        }

        // Buscar dados da loja
        let lojaData = loja_info;
        if (!lojaData && user.loja_id) {
            const lojas = await base44.entities.Loja.filter({ id: user.loja_id });
            if (lojas && lojas.length > 0) {
                lojaData = lojas[0];
            }
        }

        // Buscar dados históricos de campanhas para aprender
        const campanhasAnteriores = await base44.entities.EmailCampanha.filter({ 
            loja_id: user.loja_id,
            status: 'enviada'
        });

        // Buscar perfil de clientes
        const respostas = await base44.entities.Resposta.filter({ loja_id: user.loja_id });
        
        const promotores = respostas.filter(r => r.nota >= 9).length;
        const detratores = respostas.filter(r => r.nota <= 6).length;
        const totalClientes = respostas.length;

        // Preparar contexto
        const contexto = {
            nome_loja: lojaData?.nome || 'sua loja',
            setor: lojaData?.setor || 'moda',
            tipo_campanha,
            objetivo: objetivo || 'aumentar vendas',
            cupom: cupom_info,
            num_variantes,
            perfil_clientes: {
                total: totalClientes,
                promotores_percentual: totalClientes > 0 ? (promotores / totalClientes * 100).toFixed(1) : 0,
                detratores_percentual: totalClientes > 0 ? (detratores / totalClientes * 100).toFixed(1) : 0
            },
            historico: campanhasAnteriores.length > 0 ? {
                campanhas_anteriores: campanhasAnteriores.length,
                media_abertura: (campanhasAnteriores.reduce((acc, c) => acc + (c.metricas?.taxa_abertura || 0), 0) / campanhasAnteriores.length).toFixed(1),
                assuntos_anteriores: campanhasAnteriores.map(c => c.assunto).slice(0, 5)
            } : null
        };

        const prompt = `Você é um especialista em email marketing e copywriting persuasivo.

Crie ${num_variantes} variações DIFERENTES de email para testar qual performa melhor.

CONTEXTO:
- Loja: ${contexto.nome_loja}
- Setor: ${contexto.setor}
- Tipo: ${contexto.tipo_campanha}
- Objetivo: ${contexto.objetivo}
${contexto.cupom ? `- Cupom: ${contexto.cupom.nome} - ${contexto.cupom.tipo_desconto === 'percentual' ? contexto.cupom.valor_desconto + '%' : 'R$ ' + contexto.cupom.valor_desconto} OFF` : ''}
- Total de clientes: ${contexto.perfil_clientes.total}
- Promotores: ${contexto.perfil_clientes.promotores_percentual}%
${contexto.historico ? `\n- Média de abertura anterior: ${contexto.historico.media_abertura}%` : ''}

CADA VARIAÇÃO DEVE TESTAR UMA ABORDAGEM DIFERENTE:
- Variação A: Foco em urgência e escassez
- Variação B: Foco em benefícios e valor
- Variação C: Abordagem emocional/storytelling
- Variação D: Foco em prova social e exclusividade

IMPORTANTE:
- Assuntos com máximo 50 caracteres
- CTAs diferentes e fortes
- Conteúdo HTML simples e mobile-friendly
- Cada variação deve ter personalidade única
${contexto.historico?.assuntos_anteriores ? `- Evite repetir estes assuntos: ${contexto.historico.assuntos_anteriores.join(', ')}` : ''}

Responda em JSON:
{
  "variacoes": [
    {
      "letra": "A",
      "nome": "Urgência e Escassez",
      "assunto": "assunto max 50 chars",
      "preview_text": "texto preview",
      "conteudo_html": "HTML do email",
      "call_to_action": "texto CTA",
      "estrategia": "explicação da abordagem",
      "previsao_performance": {
        "taxa_abertura_estimada": 0-100,
        "taxa_cliques_estimada": 0-100,
        "publico_alvo_ideal": "descrição"
      }
    }
  ],
  "recomendacao_teste": "qual elemento testar (assunto, CTA ou conteúdo)",
  "insights_geracao": ["insight 1", "insight 2"]
}`;

        const aiResponse = await base44.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    variacoes: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                letra: { type: "string" },
                                nome: { type: "string" },
                                assunto: { type: "string" },
                                preview_text: { type: "string" },
                                conteudo_html: { type: "string" },
                                call_to_action: { type: "string" },
                                estrategia: { type: "string" },
                                previsao_performance: {
                                    type: "object",
                                    properties: {
                                        taxa_abertura_estimada: { type: "number" },
                                        taxa_cliques_estimada: { type: "number" },
                                        publico_alvo_ideal: { type: "string" }
                                    }
                                }
                            }
                        }
                    },
                    recomendacao_teste: { type: "string" },
                    insights_geracao: {
                        type: "array",
                        items: { type: "string" }
                    }
                }
            }
        });

        return Response.json({
            success: true,
            variacoes: aiResponse.variacoes,
            recomendacao_teste: aiResponse.recomendacao_teste,
            insights: aiResponse.insights_geracao
        });

    } catch (error) {
        console.error('Erro ao gerar variações:', error);
        return Response.json({ 
            error: 'Erro interno do servidor', 
            details: error.message 
        }, { status: 500 });
    }
});