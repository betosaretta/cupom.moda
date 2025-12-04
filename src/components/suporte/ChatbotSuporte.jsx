import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

const FAQ_RESPOSTAS = {
  'como criar cupom': {
    resposta: 'Para criar um cupom, vá ao menu "Cupons" e clique em "Criar Cupom". Defina o tipo de desconto (percentual ou valor fixo), o valor, validade e outras configurações.',
    links: [{ texto: 'Ir para Cupons', url: 'Cupons' }]
  },
  'como criar pesquisa': {
    resposta: 'Para criar uma pesquisa NPS, acesse o menu "Pesquisas" e clique em "Criar Pesquisa". Você pode vincular um cupom como recompensa para incentivar respostas.',
    links: [{ texto: 'Ir para Pesquisas', url: 'Pesquisas' }]
  },
  'qr code': {
    resposta: 'O QR Code é gerado automaticamente ao criar uma pesquisa. Clique no botão "QR Code" na pesquisa desejada para visualizar, baixar ou imprimir material A4 para divulgação.',
    links: [{ texto: 'Ver Pesquisas', url: 'Pesquisas' }]
  },
  'como funciona nps': {
    resposta: 'O NPS (Net Promoter Score) mede a satisfação do cliente. Notas 9-10 são Promotores, 7-8 são Neutros e 0-6 são Detratores. O cálculo é: (% Promotores - % Detratores).',
    links: []
  },
  'cancelar assinatura': {
    resposta: 'Para cancelar sua assinatura, vá em "Minha Conta" > "Assinatura" e clique em "Gerenciar Assinatura". Você será redirecionado ao portal de pagamentos.',
    links: [{ texto: 'Ir para Minha Conta', url: 'Configuracoes' }]
  },
  'alterar plano': {
    resposta: 'Para alterar seu plano, acesse "Minha Conta" > "Assinatura". Você pode fazer upgrade ou downgrade a qualquer momento.',
    links: [{ texto: 'Ir para Minha Conta', url: 'Configuracoes' }]
  },
  'exportar dados': {
    resposta: 'Você pode exportar seus dados de clientes em "Vendas" clicando no botão "Exportar". Os dados são baixados em formato compatível com Excel.',
    links: [{ texto: 'Ir para Vendas', url: 'Vendas' }]
  },
  'cupom não funciona': {
    resposta: 'Se o cupom não está funcionando, verifique: 1) Se está ativo, 2) Se está dentro da validade, 3) Se atinge o valor mínimo de compra. Se o problema persistir, abra um chamado.',
    links: [{ texto: 'Abrir Chamado', url: 'Suporte' }]
  }
};

export default function ChatbotSuporte({ isOpen, onClose, currentUser }) {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: 'Olá! 👋 Sou o assistente virtual do Cupom.Moda. Como posso ajudar você hoje?',
      options: [
        'Como criar um cupom?',
        'Como criar uma pesquisa?',
        'Como funciona o QR Code?',
        'Preciso de ajuda com pagamento',
        'Falar com suporte humano'
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const findAnswer = (pergunta) => {
    const perguntaLower = pergunta.toLowerCase();
    
    for (const [chave, valor] of Object.entries(FAQ_RESPOSTAS)) {
      if (perguntaLower.includes(chave)) {
        return valor;
      }
    }
    
    // Palavras-chave específicas
    if (perguntaLower.includes('cupom') || perguntaLower.includes('desconto')) {
      return FAQ_RESPOSTAS['como criar cupom'];
    }
    if (perguntaLower.includes('pesquisa') || perguntaLower.includes('nps')) {
      return FAQ_RESPOSTAS['como criar pesquisa'];
    }
    if (perguntaLower.includes('pagamento') || perguntaLower.includes('assinatura') || perguntaLower.includes('plano')) {
      return FAQ_RESPOSTAS['cancelar assinatura'];
    }
    if (perguntaLower.includes('qr') || perguntaLower.includes('código')) {
      return FAQ_RESPOSTAS['qr code'];
    }
    
    return null;
  };

  const handleSend = async (text = inputValue) => {
    if (!text.trim()) return;

    const userMessage = { type: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simular delay de digitação
    await new Promise(resolve => setTimeout(resolve, 1000));

    let botResponse;
    
    if (text.toLowerCase().includes('suporte humano') || text.toLowerCase().includes('falar com')) {
      botResponse = {
        type: 'bot',
        content: 'Claro! Você pode abrir um chamado de suporte e nossa equipe responderá em até 24 horas úteis.',
        links: [{ texto: 'Abrir Chamado de Suporte', url: 'Suporte' }],
        options: ['Voltar ao início']
      };
    } else {
      const resposta = findAnswer(text);
      
      if (resposta) {
        botResponse = {
          type: 'bot',
          content: resposta.resposta,
          links: resposta.links,
          options: ['Isso resolveu minha dúvida', 'Tenho outra pergunta', 'Falar com suporte humano']
        };
      } else {
        // Usar IA para perguntas não mapeadas
        try {
          const iaResponse = await base44.integrations.Core.InvokeLLM({
            prompt: `Você é um assistente de suporte do Cupom.Moda, uma plataforma de fidelização de clientes para lojistas.
            
A plataforma permite:
- Criar cupons de desconto
- Criar pesquisas NPS para capturar feedback e leads
- Gerar QR Codes para divulgação
- Gerenciar clientes e vendas
- Enviar cupons de aniversário

O usuário perguntou: "${text}"

Responda de forma clara, breve e amigável. Se não souber responder, sugira abrir um chamado de suporte.`,
            response_json_schema: {
              type: 'object',
              properties: {
                resposta: { type: 'string' }
              }
            }
          });
          
          botResponse = {
            type: 'bot',
            content: iaResponse.resposta || 'Desculpe, não entendi sua pergunta. Posso te ajudar de outra forma?',
            options: ['Isso resolveu minha dúvida', 'Falar com suporte humano']
          };
        } catch (error) {
          botResponse = {
            type: 'bot',
            content: 'Não encontrei uma resposta específica para sua pergunta. Gostaria de abrir um chamado para nossa equipe de suporte?',
            links: [{ texto: 'Abrir Chamado', url: 'Suporte' }],
            options: ['Sim, abrir chamado', 'Tenho outra pergunta']
          };
        }
      }
    }

    if (text.toLowerCase().includes('voltar ao início')) {
      botResponse = {
        type: 'bot',
        content: 'Como posso ajudar você?',
        options: [
          'Como criar um cupom?',
          'Como criar uma pesquisa?',
          'Como funciona o QR Code?',
          'Preciso de ajuda com pagamento',
          'Falar com suporte humano'
        ]
      };
    }

    if (text.toLowerCase().includes('resolveu')) {
      botResponse = {
        type: 'bot',
        content: 'Que ótimo! 🎉 Fico feliz em ajudar. Precisa de mais alguma coisa?',
        options: ['Tenho outra pergunta', 'Não, obrigado!']
      };
    }

    if (text.toLowerCase().includes('não, obrigado')) {
      botResponse = {
        type: 'bot',
        content: 'Perfeito! Estou sempre aqui se precisar. Boas vendas! 🚀',
        options: ['Voltar ao início']
      };
    }

    setIsTyping(false);
    setMessages(prev => [...prev, botResponse]);
  };

  const handleOptionClick = (option) => {
    handleSend(option);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <div className="neuro-card overflow-hidden flex flex-col h-[500px] max-h-[80vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold">Suporte Cupom.Moda</h3>
              <p className="text-xs text-blue-100">Online agora</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${msg.type === 'user' ? 'order-1' : 'order-2'}`}>
                <div className={`p-3 rounded-2xl ${
                  msg.type === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-md' 
                    : 'bg-white shadow-sm rounded-bl-md'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  
                  {msg.links && msg.links.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {msg.links.map((link, i) => (
                        <Link
                          key={i}
                          to={createPageUrl(link.url)}
                          onClick={onClose}
                          className="block text-sm text-blue-600 hover:underline bg-blue-50 px-3 py-2 rounded-lg"
                        >
                          → {link.texto}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                
                {msg.options && msg.options.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {msg.options.map((option, i) => (
                      <button
                        key={i}
                        onClick={() => handleOptionClick(option)}
                        className="block w-full text-left text-sm text-gray-700 bg-white hover:bg-gray-100 px-3 py-2 rounded-lg border border-gray-200 transition-colors"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white shadow-sm rounded-2xl rounded-bl-md p-3">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Digite sua mensagem..."
              className="flex-1 neuro-input p-3 text-sm"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || isTyping}
              className="neuro-button pressed p-3 text-blue-600 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}