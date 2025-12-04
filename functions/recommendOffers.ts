import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Verificar se é admin
        const user = await base44.auth.me();
        if (!user || !["super_admin"].includes(user.app_role) && user.email !== "robertosaretta@gmail.com") {
            return Response.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const { userId } = await req.json();
        if (!userId) {
            return Response.json({ error: 'userId é obrigatório' }, { status: 400 });
        }

        // Buscar dados do usuário usando service role
        const userData = await base44.asServiceRole.entities.User.get(userId);
        if (!userData) {
            return Response.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        // Buscar loja do usuário
        let lojaData = null;
        if (userData.loja_id) {
            const lojas = await base44.asServiceRole.entities.Loja.filter({ id: userData.loja_id });
            if (lojas && lojas.length > 0) {
                lojaData = lojas[0];
            }
        }

        // Buscar engagement score
        const engagementScores = await base44.asServiceRole.entities.UserEngagementScore.filter({ user_id: userId });
        const engagementData = engagementScores.length > 0 ? engagementScores[0] : null;

        // Buscar todas as ofertas ativas
        const ofertas = await base44.asServiceRole.entities.Parceria.filter({ ativa: true });

        // Preparar contexto para a IA
        const contexto = {
            setor: lojaData?.setor || 'não especificado',
            porte: lojaData?.porte || 'não especificado',
            nivel_risco: engagementData?.nivel_risco || 'desconhecido',
            score_engajamento: engagementData?.score_total || 0,
            metricas: engagementData?.metricas || {},
            ofertas_disponiveis: ofertas.map(o => ({
                id: o.id,
                titulo: o.titulo,
                categoria: o.categoria,
                descricao: o.descricao,
                destaque: o.destaque
            }))
        };

        // Usar IA para recomendar ofertas
        const prompt = `Você é um consultor especializado em recomendar ofertas de parceiros para negócios.

Analise o perfil do cliente:
- Setor: ${contexto.setor}
- Porte da empresa: ${contexto.porte}
- Nível de engajamento na plataforma: ${contexto.score_engajamento}/100
- Nível de risco de churn: ${contexto.nivel_risco}
- Métricas de uso:
  * Pesquisas criadas: ${contexto.metricas.pesquisas_criadas || 0}
  * Cupons criados: ${contexto.metricas.cupons_criados || 0}
  * Leads capturados: ${contexto.metricas.leads_capturados || 0}

Ofertas disponíveis:
${contexto.ofertas_disponiveis.map((o, i) => `${i + 1}. [${o.categoria}] ${o.titulo} - ${o.descricao}`).join('\n')}

Baseado no perfil do cliente, recomende as 3 melhores ofertas (IDs) que sejam mais relevantes e explique o motivo de cada recomendação. 
Considere:
1. Relevância para o setor do negócio
2. Adequação ao porte da empresa
3. Potencial de resolver problemas de engajamento (se score baixo)
4. Ofertas que podem ajudar a reduzir risco de churn

Responda APENAS com um JSON válido no formato:
{
  "recomendacoes": [
    {
      "oferta_id": "id_da_oferta",
      "score_relevancia": 0-100,
      "motivo": "explicação de por que esta oferta é relevante",
      "prioridade": "alta|media|baixa"
    }
  ],
  "insights": "insights gerais sobre o perfil do cliente e como as ofertas podem ajudar"
}`;

        const aiResponse = await base44.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    recomendacoes: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                oferta_id: { type: "string" },
                                score_relevancia: { type: "number" },
                                motivo: { type: "string" },
                                prioridade: { type: "string" }
                            }
                        }
                    },
                    insights: { type: "string" }
                }
            }
        });

        // Enriquecer recomendações com dados completos das ofertas
        const recomendacoesEnriquecidas = aiResponse.recomendacoes.map(rec => {
            const oferta = ofertas.find(o => o.id === rec.oferta_id);
            return {
                ...rec,
                oferta: oferta || null
            };
        }).filter(rec => rec.oferta !== null); // Remover recomendações de ofertas não encontradas

        return Response.json({
            success: true,
            user_profile: {
                setor: contexto.setor,
                porte: contexto.porte,
                engagement_score: contexto.score_engajamento,
                nivel_risco: contexto.nivel_risco
            },
            recomendacoes: recomendacoesEnriquecidas,
            insights: aiResponse.insights
        });

    } catch (error) {
        console.error('Erro ao recomendar ofertas:', error);
        return Response.json({ 
            error: 'Erro interno do servidor', 
            details: error.message 
        }, { status: 500 });
    }
});