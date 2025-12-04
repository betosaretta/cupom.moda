import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Smile, Gift, LayoutDashboard, DollarSign } from "lucide-react";

export default function GuiaPassoAPasso() {
  const topics = [
    {
      id: "dashboard",
      title: "Entendendo a Tela Inicial (Início)",
      icon: LayoutDashboard,
      content: (
        <div className="space-y-2 text-gray-700">
          <p>A tela de <strong>Início</strong> é seu painel de controle. Aqui você vê um resumo de tudo que está acontecendo:</p>
          <ul className="list-disc list-inside space-y-1 pl-4">
            <li><strong>Clientes Capturados:</strong> Quantas pessoas novas deixaram o contato.</li>
            <li><strong>Cupons Entregues:</strong> O número de cupons que você já distribuiu.</li>
            <li><strong>Vendas com Cupom:</strong> Quantos cupons foram realmente usados na sua loja.</li>
            <li><strong>Índice de Satisfação (NPS):</strong> Uma nota de 0 a 100 que mostra se seus clientes estão felizes.</li>
          </ul>
        </div>
      ),
    },
    {
      id: "pesquisas",
      title: "Como Criar uma Pesquisa de Satisfação?",
      icon: Smile,
      content: (
        <div className="space-y-2 text-gray-700">
          <p>Pesquisas são ótimas para ouvir seu cliente e ainda dar um cupom de presente.</p>
          <ol className="list-decimal list-inside space-y-1 pl-4">
            <li>Vá para a tela de <strong>Pesquisas</strong> no menu.</li>
            <li>Clique no botão <strong>"Criar Pesquisa"</strong>.</li>
            <li>Preencha o título, a pergunta (ex: "O que você achou do nosso atendimento?") e escolha um cupom para dar de recompensa.</li>
            <li>Clique em <strong>"Salvar"</strong>. Pronto!</li>
            <li>Agora você pode imprimir o QR Code da pesquisa e colocar na sua loja.</li>
          </ol>
        </div>
      ),
    },
    {
      id: "cupons",
      title: "Como Criar um Cupom de Desconto?",
      icon: Gift,
      content: (
        <div className="space-y-2 text-gray-700">
          <p>Cupons atraem clientes e incentivam as vendas. É muito fácil criar um:</p>
          <ol className="list-decimal list-inside space-y-1 pl-4">
            <li>Vá para a tela de <strong>Cupons</strong> no menu.</li>
            <li>Clique em <strong>"Criar Cupom"</strong>.</li>
            <li>Dê um nome para a promoção (ex: "Desconto Dia das Mães").</li>
            <li>Escolha o tipo de desconto: <strong>Percentual (%)</strong> ou <strong>Valor Fixo (R$)</strong>.</li>
            <li>Defina o valor (ex: 10 para 10% ou 20 para R$20).</li>
            <li>Defina por quantos dias o cupom será válido após o cliente pegar.</li>
            <li>Clique em <strong>"Salvar Cupom"</strong>.</li>
          </ol>
        </div>
      ),
    },
    {
      id: "vendas",
      title: "Como Validar um Cupom na Hora da Venda?",
      icon: DollarSign,
      content: (
        <div className="space-y-2 text-gray-700">
          <p>Quando um cliente chegar com um cupom no celular, siga estes passos:</p>
          <ol className="list-decimal list-inside space-y-1 pl-4">
            <li>Vá para a tela de <strong>Vendas</strong> no menu.</li>
            <li>Clique no botão <strong>"Resgatar Cupom"</strong>.</li>
            <li>Peça ao cliente o código do cupom e digite no campo que aparecer.</li>
            <li>Clique em <strong>"Validar Cupom"</strong>. O sistema vai confirmar se o cupom é válido e dar a baixa.</li>
            <li>Pronto! Agora é só aplicar o desconto na venda.</li>
          </ol>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible className="w-full">
        {topics.map((topic) => {
          const Icon = topic.icon;
          return (
            <AccordionItem key={topic.id} value={topic.id} className="neuro-button mb-3 !rounded-xl overflow-hidden">
              <AccordionTrigger className="px-6 py-4 text-left font-semibold text-lg text-gray-800 hover:no-underline">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-blue-600" />
                  {topic.title}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                {topic.content}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}