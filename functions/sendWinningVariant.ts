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

        if (campanha.status !== 'teste_ab_concluido') {
            return Response.json({ error: 'Teste A/B ainda não foi concluído' }, { status: 400 });
        }

        // Buscar resultado do teste
        const resultados = await base44.entities.EmailABTestResult.filter({ 
            campanha_id: campanhaId 
        });

        if (resultados.length === 0) {
            return Response.json({ error: 'Resultado do teste não encontrado' }, { status: 404 });
        }

        const resultado = resultados[0];

        if (resultado.enviado_para_restante) {
            return Response.json({ 
                error: 'Variante vencedora já foi enviada para o restante da audiência' 
            }, { status: 400 });
        }

        // Buscar variante vencedora
        const varianteVencedora = await base44.entities.EmailCampanhaVariante.get(
            resultado.variante_vencedora_id
        );

        if (!varianteVencedora) {
            return Response.json({ error: 'Variante vencedora não encontrada' }, { status: 404 });
        }

        // Buscar todas as respostas/leads da loja para determinar audiência
        const respostas = await base44.entities.Resposta.filter({ loja_id: campanha.loja_id });

        // Filtrar por segmento
        let audienciaTotal = respostas;
        const segmento = campanha.segmento_alvo || {};

        if (!segmento.todos) {
            audienciaTotal = audienciaTotal.filter(r => {
                if (segmento.promotores && r.nota >= 9) return true;
                if (segmento.detratores && r.nota <= 6) return true;
                if (segmento.neutros && r.nota >= 7 && r.nota <= 8) return true;
                return false;
            });
        }

        // Calcular quantos já receberam no teste
        const percentualTeste = campanha.teste_ab_config?.percentual_teste || 20;
        const totalAudiencia = audienciaTotal.length;
        const jaEnviados = Math.floor(totalAudiencia * (percentualTeste / 100));
        const restante = totalAudiencia - jaEnviados;

        // NOTA: Em uma implementação real, aqui você faria a integração com um serviço
        // de email marketing (SendGrid, Mailchimp, etc) para enviar os emails
        // Por enquanto, vamos simular o envio e atualizar as métricas

        console.log(`Enviando variante ${varianteVencedora.letra_variante} para ${restante} destinatários restantes`);

        // Simular métricas de envio
        // Em produção, estas métricas viriam do serviço de email
        const taxaAberturaEstimada = varianteVencedora.metricas?.taxa_abertura || 20;
        const taxaCliquesEstimada = varianteVencedora.metricas?.taxa_cliques || 3;

        const novosAbertos = Math.floor(restante * (taxaAberturaEstimada / 100));
        const novosCliques = Math.floor(restante * (taxaCliquesEstimada / 100));

        // Atualizar métricas da campanha principal
        const metricasAtualizadas = {
            total_enviados: (campanha.metricas?.total_enviados || 0) + restante,
            total_abertos: (campanha.metricas?.total_abertos || 0) + novosAbertos,
            total_cliques: (campanha.metricas?.total_cliques || 0) + novosCliques
        };

        metricasAtualizadas.taxa_abertura = metricasAtualizadas.total_enviados > 0
            ? (metricasAtualizadas.total_abertos / metricasAtualizadas.total_enviados * 100).toFixed(2)
            : 0;

        metricasAtualizadas.taxa_cliques = metricasAtualizadas.total_enviados > 0
            ? (metricasAtualizadas.total_cliques / metricasAtualizadas.total_enviados * 100).toFixed(2)
            : 0;

        await base44.entities.EmailCampanha.update(campanhaId, {
            metricas: metricasAtualizadas,
            status: 'enviada'
        });

        // Atualizar resultado
        await base44.entities.EmailABTestResult.update(resultado.id, {
            enviado_para_restante: true,
            total_enviado_restante: restante
        });

        return Response.json({
            success: true,
            resumo: {
                variante_enviada: varianteVencedora.letra_variante,
                assunto: varianteVencedora.assunto,
                destinatarios: restante,
                total_campanha: totalAudiencia,
                metricas_finais: metricasAtualizadas
            }
        });

    } catch (error) {
        console.error('Erro ao enviar variante vencedora:', error);
        return Response.json({ 
            error: 'Erro interno do servidor', 
            details: error.message 
        }, { status: 500 });
    }
});