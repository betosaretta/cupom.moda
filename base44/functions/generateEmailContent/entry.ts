import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Não autenticado' }, { status: 401 });
        }

        const { tipo_campanha, objetivo, cupom_info, loja_info } = await req.json();
        
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

        // Buscar dados de engajamento dos clientes
        const respostas = await base44.entities.Resposta.filter({ loja_id: user.loja_id });
        
        const totalClientes = respostas.length;
        const promotores = respostas.filter(r => r.nota >= 9).length;
        const detratores = respostas.filter(r => r.nota <= 6).length;

        // Preparar contexto para a IA
        const contexto = {
            nome_loja: lojaData?.nome || 'sua loja',
            setor: lojaData?.setor || 'moda',
            total_clientes: totalClientes,
            promotores,
            detratores,
            tipo_campanha,
            objetivo: objetivo || 'aumentar vendas',
            cupom: cupom_info || null
        };

        // Templates de prompt baseados no tipo de campanha
        const promptTemplates = {
            promocional: `Crie um email promocional atrativo para ${contexto.nome_loja}, uma loja de ${contexto.setor}.
            
Objetivo: ${contexto.objetivo}
${contexto.cupom ? `\nCupom: ${contexto.cupom.nome} - ${contexto.cupom.tipo_desconto === 'percentual' ? contexto.cupom.valor_desconto + '%' : 'R$ ' + contexto.cupom.valor_desconto} de desconto` : ''}

Crie um email que:
- Tenha um assunto irresistível (máximo 50 caracteres)
- Seja visualmente organizado com HTML simples
- Destaque a oferta de forma clara
- Crie senso de urgência
- Inclua call-to-action forte
- Seja mobile-friendly

Responda em JSON:
{
  "assunto": "assunto do email",
  "conteudo_html": "HTML completo do email",
  "preview_text": "texto de preview",
  "dicas": ["dica 1", "dica 2"]
}`,

            aniversario: `Crie um email de aniversário caloroso e personalizado para ${contexto.nome_loja}.

Objetivo: Celebrar o aniversário do cliente e oferecer presente especial
${contexto.cupom ? `\nPresente: ${contexto.cupom.nome} - ${contexto.cupom.tipo_desconto === 'percentual' ? contexto.cupom.valor_desconto + '%' : 'R$ ' + contexto.cupom.valor_desconto} de desconto` : ''}

Crie um email que:
- Seja emocionante e celebratório
- Personalize com [NOME_CLIENTE]
- Destaque o presente de aniversário
- Seja caloroso e genuíno
- Inclua emojis de celebração apropriados

Responda em JSON:
{
  "assunto": "assunto do email",
  "conteudo_html": "HTML completo do email",
  "preview_text": "texto de preview",
  "dicas": ["dica 1", "dica 2"]
}`,

            reengajamento: `Crie um email de reengajamento para recuperar clientes inativos de ${contexto.nome_loja}.

Objetivo: Reconquistar clientes que não compram há tempo
${contexto.cupom ? `\nIncentivo: ${contexto.cupom.nome} - ${contexto.cupom.tipo_desconto === 'percentual' ? contexto.cupom.valor_desconto + '%' : 'R$ ' + contexto.cupom.valor_desconto} de desconto` : ''}

Crie um email que:
- Mostre que sentimos falta do cliente
- Destaque novidades ou mudanças
- Ofereça incentivo especial para voltar
- Seja genuíno, não desesperado
- Facilite o retorno

Responda em JSON:
{
  "assunto": "assunto do email",
  "conteudo_html": "HTML completo do email",
  "preview_text": "texto de preview",
  "dicas": ["dica 1", "dica 2"]
}`,

            informativo: `Crie um email informativo valioso para os clientes de ${contexto.nome_loja}.

Objetivo: ${contexto.objetivo}

Crie um email que:
- Agregue valor real ao cliente
- Não seja apenas vendas
- Eduque ou informe
- Mantenha o relacionamento
- Inclua soft CTA (call to action suave)

Responda em JSON:
{
  "assunto": "assunto do email",
  "conteudo_html": "HTML completo do email",
  "preview_text": "texto de preview",
  "dicas": ["dica 1", "dica 2"]
}`
        };

        const prompt = promptTemplates[tipo_campanha] || promptTemplates.promocional;

        const aiResponse = await base44.integrations.Core.InvokeLLM({
            prompt,
            response_json_schema: {
                type: "object",
                properties: {
                    assunto: { type: "string" },
                    conteudo_html: { type: "string" },
                    preview_text: { type: "string" },
                    dicas: {
                        type: "array",
                        items: { type: "string" }
                    }
                }
            }
        });

        return Response.json({
            success: true,
            email: aiResponse
        });

    } catch (error) {
        console.error('Erro ao gerar conteúdo de email:', error);
        return Response.json({ 
            error: 'Erro interno do servidor', 
            details: error.message 
        }, { status: 500 });
    }
});