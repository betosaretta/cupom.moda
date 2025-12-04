import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, User, Bot } from 'lucide-react';

export default function AssistenteIA() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Olá! Sou seu assistente virtual. Como posso ajudar você a usar o Cupom.Moda hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === '' || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const systemPrompt = `
        Você é um assistente virtual especialista na plataforma "Cupom.Moda".
        Seu objetivo é ajudar lojistas a usar o sistema de forma simples e clara.
        Responda sempre em português do Brasil.
        
        Contexto sobre a plataforma Cupom.Moda:
        - O sistema ajuda lojas de moda a capturar contatos (leads) de clientes.
        - Funcionalidades principais:
          1. Pesquisas de Satisfação (NPS): O lojista cria uma pesquisa, imprime um QR Code e coloca na loja. O cliente responde e ganha um cupom.
          2. Cupons de Desconto: O lojista pode criar cupons de percentual (%) ou valor fixo (R$) para usar nas pesquisas ou em campanhas.
          3. Cadastro de Clientes: O sistema salva o contato de quem responde a pesquisa ou pega um cupom, criando uma lista de clientes.
          4. Vendas: O lojista pode validar o cupom que o cliente apresenta na hora da compra.

        Use um tom amigável e prestativo. Se não souber a resposta, diga que vai verificar com a equipe de suporte.
        Seja direto e use exemplos práticos.
      `;

      const fullPrompt = `${systemPrompt}\n\nO usuário pergunta: "${input}"`;

      const response = await base44.integrations.Core.InvokeLLM({ prompt: fullPrompt });
      
      const assistantMessage = { role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error("Erro ao chamar a IA:", error);
      const errorMessage = { role: 'assistant', content: 'Desculpe, tive um problema para me conectar. Por favor, tente novamente em alguns instantes.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[60vh]">
      <div className="flex-1 overflow-y-auto pr-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="neuro-button p-2 text-blue-600 self-start">
                <Bot className="w-5 h-5" />
              </div>
            )}
            <div
              className={`max-w-lg p-4 rounded-xl ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}
            >
              {msg.content}
            </div>
             {msg.role === 'user' && (
              <div className="neuro-button p-2 text-gray-600 self-start">
                <User className="w-5 h-5" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
             <div className="neuro-button p-2 text-blue-600 self-start">
                <Bot className="w-5 h-5" />
              </div>
            <div className="bg-gray-100 text-gray-800 rounded-xl rounded-bl-none p-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-300"></div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="mt-6 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite sua pergunta..."
          disabled={isLoading}
          className="neuro-input flex-1 p-4 text-gray-800 placeholder-gray-500"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="neuro-button pressed p-4 text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}