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

        // Buscar dados de atividade
        const [pesquisas, cupons, respostas] = await Promise.all([
            base44.asServiceRole.entities.Pesquisa.filter({ loja_id: userData.loja_id }),
            base44.asServiceRole.entities.Cupom.filter({ loja_id: userData.loja_id }),
            base44.asServiceRole.entities.Resposta.filter({ loja_id: userData.loja_id })
        ]);

        // Calcular métricas
        const metricas = {
            pesquisas_criadas: pesquisas.length,
            cupons_criados: cupons.length,
            leads_capturados: respostas.length,
            dias_desde_ultima_acao: 0 // Pode ser calculado baseado nas datas
        };

        // Calcular score de engajamento (0-100)
        let score = 0;
        
        // Peso: criação de recursos
        if (metricas.cupons_criados > 0) score += 25;
        if (metricas.pesquisas_criadas > 0) score += 25;
        if (metricas.leads_capturados > 0) score += 30;
        if (metricas.cupons_criados >= 2) score += 10;
        if (metricas.pesquisas_criadas >= 2) score += 10;

        // Determinar nível de risco
        let nivel_risco = 'baixo';
        if (score < 25) nivel_risco = 'critico';
        else if (score < 50) nivel_risco = 'alto';
        else if (score < 75) nivel_risco = 'medio';

        // Gerar insights com IA
        const problemas = [];
        const acoes = [];
        let mensagem = '';
        let prioridade = 'baixa';

        if (metricas.cupons_criados === 0) {
            problemas.push('Usuário ainda não criou nenhum cupom');
            acoes.push('Enviar tutorial de criação de cupons');
            acoes.push('Oferecer consultoria rápida de 15 minutos');
        }

        if (metricas.pesquisas_criadas === 0) {
            problemas.push('Usuário não criou pesquisas NPS');
            acoes.push('Mostrar casos de sucesso com pesquisas');
            acoes.push('Enviar template pronto de pesquisa');
        }

        if (metricas.leads_capturados === 0) {
            problemas.push('Nenhum lead capturado até o momento');
            acoes.push('Verificar se o QR Code foi divulgado');
            acoes.push('Sugerir estratégias de divulgação');
        }

        // Gerar mensagem sugerida pela IA
        const userName = userData.full_name?.split(' ')[0] || 'Cliente';
        
        if (nivel_risco === 'critico') {
            prioridade = 'urgente';
            mensagem = `Olá ${userName}! 👋 Notei que você iniciou o teste mas ainda não explorou muito a plataforma. Que tal uma chamada rápida de 15 minutos para eu te mostrar como capturar seus primeiros clientes? Posso te ajudar agora! 🚀`;
        } else if (nivel_risco === 'alto') {
            prioridade = 'alta';
            mensagem = `Oi ${userName}! Vi que você começou a usar o Cupom.Moda. Precisa de ajuda para ${metricas.cupons_criados === 0 ? 'criar seu primeiro cupom' : 'aumentar suas capturas'}? Estou à disposição para uma consultoria gratuita! 💡`;
        } else if (nivel_risco === 'medio') {
            prioridade = 'media';
            mensagem = `Olá ${userName}! Você está indo bem! 🎉 ${metricas.leads_capturados > 0 ? `Já capturou ${metricas.leads_capturados} leads!` : 'Continue explorando os recursos.'} Quer dicas para otimizar ainda mais seus resultados?`;
        } else {
            prioridade = 'baixa';
            mensagem = `Parabéns ${userName}! 🌟 Você está aproveitando muito bem a plataforma! Continue assim e não hesite em me chamar se precisar de algo.`;
        }

        // Salvar ou atualizar o engagement score
        const existingScores = await base44.asServiceRole.entities.UserEngagementScore.filter({ user_id: userId });
        
        const engagementData = {
            user_id: userId,
            score_total: score,
            nivel_risco,
            metricas,
            insights_ia: {
                problemas_identificados: problemas,
                acoes_recomendadas: acoes,
                mensagem_sugerida: mensagem,
                prioridade_contato: prioridade
            },
            historico_scores: existingScores.length > 0 ? [
                ...(existingScores[0].historico_scores || []),
                { data: new Date().toISOString(), score }
            ] : [{ data: new Date().toISOString(), score }],
            ultima_analise: new Date().toISOString()
        };

        if (existingScores.length > 0) {
            await base44.asServiceRole.entities.UserEngagementScore.update(existingScores[0].id, engagementData);
        } else {
            await base44.asServiceRole.entities.UserEngagementScore.create(engagementData);
        }

        return Response.json({
            success: true,
            engagement: engagementData
        });

    } catch (error) {
        console.error('Erro na análise de engajamento:', error);
        return Response.json({ 
            error: 'Erro interno do servidor', 
            details: error.message 
        }, { status: 500 });
    }
});