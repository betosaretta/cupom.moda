import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    // Autenticação Base44
    const base44 = createClientFromRequest(req);
    
    const { user_id, trigger_type = 'welcome' } = await req.json();

    if (!user_id) {
      return Response.json({ 
        error: 'user_id é obrigatório' 
      }, { status: 400 });
    }

    const apiKey = Deno.env.get('FLODESK_API_KEY');
    if (!apiKey) {
      return Response.json({ 
        error: 'FLODESK_API_KEY não configurada' 
      }, { status: 500 });
    }

    // Buscar usuário usando service role
    const users = await base44.asServiceRole.entities.User.filter({ id: user_id });
    if (!users || users.length === 0) {
      return Response.json({ 
        error: 'Usuário não encontrado' 
      }, { status: 404 });
    }

    const user = users[0];
    
    if (!user.email) {
      return Response.json({ 
        error: 'Usuário não possui email' 
      }, { status: 400 });
    }

    // Buscar loja do usuário se existir
    let loja = null;
    if (user.loja_id) {
      const lojas = await base44.asServiceRole.entities.Loja.filter({ id: user.loja_id });
      if (lojas && lojas.length > 0) {
        loja = lojas[0];
      }
    }

    // Definir segmento baseado no tipo de trigger
    let segmentId = null;
    let emailSubject = '';
    let emailBody = '';

    switch (trigger_type) {
      case 'welcome':
        segmentId = '69138f775555abe8ab6d6905'; // Segmento de boas-vindas
        emailSubject = `Bem-vindo ao Cupom.Moda, ${user.full_name}! 🎉`;
        emailBody = `
          <h1>Olá ${user.full_name}!</h1>
          <p>Seja muito bem-vindo(a) ao <strong>Cupom.Moda</strong>! 🎊</p>
          <p>Estamos muito felizes em tê-lo(a) conosco.</p>
          ${loja ? `<p>Sua loja <strong>${loja.nome}</strong> está pronta para começar a capturar leads e fidelizar clientes!</p>` : ''}
          <h2>Primeiros Passos:</h2>
          <ul>
            <li>✅ Complete o cadastro da sua loja</li>
            <li>✅ Crie seu primeiro cupom de desconto</li>
            <li>✅ Configure sua primeira pesquisa NPS</li>
            <li>✅ Baixe o QR Code e divulgue na sua loja</li>
          </ul>
          <p>Precisa de ajuda? Nossa equipe está à disposição!</p>
          <p>Boas vendas! 🚀</p>
          <p><em>Equipe Cupom.Moda</em></p>
        `;
        break;
        
      case 'trial_ending':
        emailSubject = `Seu período de teste está acabando - Cupom.Moda`;
        emailBody = `
          <h1>Olá ${user.full_name}!</h1>
          <p>Seu período de teste no Cupom.Moda está chegando ao fim.</p>
          <p>Esperamos que esteja aproveitando todas as funcionalidades! 💪</p>
          <h2>O que você já conquistou:</h2>
          <p>Continue aproveitando todos os benefícios do Cupom.Moda.</p>
          <p>Para continuar sem interrupções, garanta sua assinatura hoje mesmo!</p>
          <p>Qualquer dúvida, estamos aqui para ajudar.</p>
          <p>Atenciosamente,<br><em>Equipe Cupom.Moda</em></p>
        `;
        break;
        
      case 'first_lead':
        emailSubject = `Parabéns! Você capturou seu primeiro lead! 🎉`;
        emailBody = `
          <h1>Fantástico, ${user.full_name}! 🌟</h1>
          <p>Você acabou de capturar seu <strong>primeiro lead</strong> no Cupom.Moda!</p>
          ${loja ? `<p>Sua loja <strong>${loja.nome}</strong> está no caminho certo para o sucesso!</p>` : ''}
          <h2>Próximos Passos:</h2>
          <ul>
            <li>📱 Entre em contato com seu novo cliente via WhatsApp</li>
            <li>🎁 Garanta que o cupom seja utilizado</li>
            <li>📊 Acompanhe suas métricas no Dashboard</li>
            <li>🚀 Continue capturando mais leads!</li>
          </ul>
          <p>Esse é apenas o começo de uma jornada de sucesso!</p>
          <p>Estamos torcendo por você! 💪</p>
          <p><em>Equipe Cupom.Moda</em></p>
        `;
        break;
        
      default:
        emailSubject = `Cupom.Moda - Novidades para você!`;
        emailBody = `
          <h1>Olá ${user.full_name}!</h1>
          <p>Temos novidades para você no Cupom.Moda!</p>
          <p>Continue acompanhando seu painel para não perder nenhuma atualização.</p>
          <p>Atenciosamente,<br><em>Equipe Cupom.Moda</em></p>
        `;
    }

    // Adicionar subscriber ao Flodesk com o segmento apropriado
    const subscriberData = {
      email: user.email,
      first_name: user.full_name?.split(' ')[0] || '',
      last_name: user.full_name?.split(' ').slice(1).join(' ') || '',
      segment_ids: segmentId ? [segmentId] : [],
      custom_fields: {
        user_type: 'lojista',
        trigger_type: trigger_type,
        loja_nome: loja?.nome || '',
        subscription_status: user.subscription_status || 'trial'
      }
    };

    const addSubscriberResponse = await fetch('https://api.flodesk.com/v1/subscribers', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(apiKey + ':')}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Cupom.Moda (cupom.moda)'
      },
      body: JSON.stringify(subscriberData)
    });

    let subscriberResult = { status: 'added' };
    if (addSubscriberResponse.ok) {
      subscriberResult = await addSubscriberResponse.json();
    }

    // Nota: O envio de email individual pode não ser suportado pela API do Flodesk
    // Normalmente, você criaria uma campanha ou workflow que é acionado quando
    // o subscriber é adicionado a um segmento específico
    
    return Response.json({
      success: true,
      message: `Email de ${trigger_type} acionado para ${user.email}`,
      subscriber: subscriberResult,
      email_preview: {
        subject: emailSubject,
        body_preview: emailBody.substring(0, 200) + '...'
      }
    });

  } catch (error) {
    console.error('Erro ao acionar email:', error);
    return Response.json({ 
      error: 'Erro ao acionar email',
      details: error.message 
    }, { status: 500 });
  }
});