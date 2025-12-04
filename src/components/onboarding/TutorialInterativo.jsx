import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle, Gift, Smile, QrCode, Users, Sparkles, Target, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function TutorialInterativo({ currentStep, onClose, onComplete }) {
  const [activeStep, setActiveStep] = useState(currentStep || 0);
  const navigate = useNavigate();

  const tutorialSteps = [
    {
      id: 'welcome',
      title: '🎉 Bem-vindo ao Cupom.Moda!',
      description: 'Vamos te guiar em uma jornada rápida para configurar tudo e começar a capturar clientes hoje mesmo!',
      icon: Sparkles,
      color: 'blue',
      content: (
        <div className="space-y-4">
          <div className="neuro-card p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h4 className="font-bold text-blue-900 mb-3">🎯 O que você vai conseguir fazer:</h4>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 mt-0.5 text-blue-600 flex-shrink-0" />
                <span>Capturar dados de clientes (WhatsApp, email, aniversário)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 mt-0.5 text-blue-600 flex-shrink-0" />
                <span>Entregar cupons de desconto automaticamente</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 mt-0.5 text-blue-600 flex-shrink-0" />
                <span>Medir satisfação dos clientes (NPS)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 mt-0.5 text-blue-600 flex-shrink-0" />
                <span>Acompanhar resultados em tempo real</span>
              </li>
            </ul>
          </div>

          <div className="neuro-card p-4 bg-green-50 border-2 border-green-200">
            <p className="text-green-800 font-medium">
              ⏱️ Leva apenas 5 minutos para configurar tudo!
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="neuro-card p-4 text-center">
              <div className="neuro-button p-3 mx-auto mb-2 w-fit">
                <Gift className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-sm font-medium text-gray-800">Criar Cupom</p>
              <p className="text-xs text-gray-600 mt-1">1 min</p>
            </div>
            <div className="neuro-card p-4 text-center">
              <div className="neuro-button p-3 mx-auto mb-2 w-fit">
                <Smile className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-800">Criar Pesquisa</p>
              <p className="text-xs text-gray-600 mt-1">2 min</p>
            </div>
            <div className="neuro-card p-4 text-center">
              <div className="neuro-button p-3 mx-auto mb-2 w-fit">
                <QrCode className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-800">Baixar QR Code</p>
              <p className="text-xs text-gray-600 mt-1">1 min</p>
            </div>
          </div>
        </div>
      ),
      action: null
    },
    {
      id: 'cupom',
      title: '🎁 Passo 1: Criar seu Primeiro Cupom',
      description: 'O cupom é a recompensa que seus clientes ganham ao responderem a pesquisa. Isso aumenta muito a taxa de resposta!',
      icon: Gift,
      color: 'purple',
      content: (
        <div className="space-y-4">
          <div className="neuro-card p-4 bg-purple-50">
            <h4 className="font-bold text-purple-900 mb-2">💡 Dica Importante:</h4>
            <p className="text-purple-800 text-sm">
              Cupons mais atrativos geram mais respostas! Recomendamos começar com pelo menos 10% de desconto.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800">Exemplo de cupom eficaz:</h4>
            
            <div className="neuro-card p-4 border-2 border-purple-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-lg text-gray-800">Cupom de Boas-Vindas</p>
                  <p className="text-sm text-gray-600">15% de desconto na próxima compra</p>
                </div>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                  15% OFF
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-600">Validade:</span>
                  <span className="font-medium">30 dias</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Compra mínima:</span>
                  <span className="font-medium">R$ 50,00</span>
                </div>
              </div>
            </div>

            <div className="neuro-card p-4 bg-yellow-50 border-2 border-yellow-200">
              <h5 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Sugestões de Cupons por Segmento:
              </h5>
              <ul className="space-y-2 text-sm text-yellow-800">
                <li className="flex items-start gap-2">
                  <span className="font-medium">👗 Moda:</span>
                  <span>15-20% de desconto ou Frete Grátis</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium">🍔 Alimentação:</span>
                  <span>R$ 10 OFF ou Bebida Grátis</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium">💆 Beleza:</span>
                  <span>20% OFF ou Serviço Extra Grátis</span>
                </li>
              </ul>
            </div>
          </div>

          <button
            onClick={() => navigate(createPageUrl('Cupons'))}
            className="neuro-button pressed w-full py-4 text-gray-800 font-medium text-lg flex items-center justify-center gap-2"
          >
            <Gift className="w-5 h-5" />
            Criar Meu Primeiro Cupom Agora
          </button>
        </div>
      ),
      action: () => navigate(createPageUrl('Cupons'))
    },
    {
      id: 'pesquisa',
      title: '📊 Passo 2: Criar sua Primeira Pesquisa NPS',
      description: 'A pesquisa captura dados dos clientes e mede a satisfação. É aqui que a mágica acontece!',
      icon: Smile,
      color: 'blue',
      content: (
        <div className="space-y-4">
          <div className="neuro-card p-4 bg-blue-50">
            <h4 className="font-bold text-blue-900 mb-2">🎯 Como funciona:</h4>
            <ol className="space-y-2 text-blue-800 text-sm">
              <li className="flex items-start gap-2">
                <span className="font-bold">1.</span>
                <span>Cliente escaneia o QR Code na sua loja</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">2.</span>
                <span>Avalia sua experiência de 0 a 10</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">3.</span>
                <span>Preenche dados (WhatsApp, email, aniversário)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">4.</span>
                <span>Recebe o cupom automaticamente no WhatsApp</span>
              </li>
            </ol>
          </div>

          <div className="neuro-card p-4 border-2 border-blue-200">
            <h5 className="font-semibold text-gray-800 mb-3">Exemplo de Pesquisa:</h5>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pergunta Principal:</p>
                <p className="font-medium text-gray-800">"De 0 a 10, quanto você recomendaria nossa loja?"</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Pergunta Adicional:</p>
                <p className="font-medium text-gray-800">"O que podemos melhorar?"</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Dados Capturados:</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs">Nome</span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs">WhatsApp</span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs">Email</span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs">Aniversário</span>
                </div>
              </div>
            </div>
          </div>

          <div className="neuro-card p-4 bg-green-50">
            <p className="text-green-800 text-sm font-medium">
              ✨ <strong>Bônus:</strong> Você pode vincular o cupom que acabou de criar à pesquisa!
            </p>
          </div>

          <button
            onClick={() => navigate(createPageUrl('Pesquisas'))}
            className="neuro-button pressed w-full py-4 text-gray-800 font-medium text-lg flex items-center justify-center gap-2"
          >
            <Smile className="w-5 h-5" />
            Criar Minha Primeira Pesquisa Agora
          </button>
        </div>
      ),
      action: () => navigate(createPageUrl('Pesquisas'))
    },
    {
      id: 'qrcode',
      title: '📱 Passo 3: Baixar e Divulgar o QR Code',
      description: 'O QR Code é a ponte entre sua loja física e o sistema. Vamos te mostrar onde colocá-lo!',
      icon: QrCode,
      color: 'green',
      content: (
        <div className="space-y-4">
          <div className="neuro-card p-4 bg-green-50">
            <h4 className="font-bold text-green-900 mb-2">📍 Onde colocar o QR Code:</h4>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">🛒</div>
                <p className="text-sm font-medium text-gray-800">No caixa</p>
                <p className="text-xs text-gray-600">Ao finalizar compra</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">🪟</div>
                <p className="text-sm font-medium text-gray-800">Na vitrine</p>
                <p className="text-xs text-gray-600">Bem visível</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">🚪</div>
                <p className="text-sm font-medium text-gray-800">Na entrada</p>
                <p className="text-xs text-gray-600">Primeiro contato</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">🧾</div>
                <p className="text-sm font-medium text-gray-800">Na nota fiscal</p>
                <p className="text-xs text-gray-600">Pós-compra</p>
              </div>
            </div>
          </div>

          <div className="neuro-card p-4 bg-blue-50 border-2 border-blue-200">
            <h5 className="font-semibold text-blue-900 mb-2">💬 Frases que funcionam:</h5>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="bg-white rounded p-2">
                "Escaneie e ganhe 15% de desconto na próxima compra!"
              </li>
              <li className="bg-white rounded p-2">
                "Sua opinião vale um cupom! Responda em 30 segundos"
              </li>
              <li className="bg-white rounded p-2">
                "QR Code da economia! Escaneie e ganhe desconto"
              </li>
            </ul>
          </div>

          <div className="neuro-card p-4 bg-yellow-50">
            <h5 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Dica PRO:
            </h5>
            <p className="text-sm text-yellow-800">
              Imprima o QR Code em tamanho A4 para melhor visualização. Nosso sistema já gera o arquivo pronto para impressão!
            </p>
          </div>

          <button
            onClick={() => navigate(createPageUrl('Pesquisas'))}
            className="neuro-button pressed w-full py-4 text-gray-800 font-medium text-lg flex items-center justify-center gap-2"
          >
            <QrCode className="w-5 h-5" />
            Ir para Pesquisas e Baixar QR Code
          </button>
        </div>
      ),
      action: () => navigate(createPageUrl('Pesquisas'))
    },
    {
      id: 'complete',
      title: '🎊 Parabéns! Você está Pronto!',
      description: 'Tudo configurado! Agora é só divulgar e começar a capturar clientes.',
      icon: CheckCircle,
      color: 'green',
      content: (
        <div className="space-y-4">
          <div className="neuro-card p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
            <h4 className="font-bold text-green-900 mb-3 text-lg flex items-center gap-2">
              <CheckCircle className="w-6 h-6" />
              Sistema Configurado com Sucesso!
            </h4>
            <p className="text-green-800">
              Seu sistema está pronto para capturar clientes e entregar cupons automaticamente. 
              Agora basta divulgar o QR Code!
            </p>
          </div>

          <div className="space-y-3">
            <h5 className="font-semibold text-gray-800">📊 Próximos Passos:</h5>
            
            <div className="neuro-card p-4 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate(createPageUrl('Dashboard'))}>
              <div className="flex items-center gap-3">
                <div className="neuro-button p-3">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">Acompanhe seus Resultados</p>
                  <p className="text-sm text-gray-600">Veja quantos clientes já capturou no Dashboard</p>
                </div>
              </div>
            </div>

            <div className="neuro-card p-4 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate(createPageUrl('CadastroClientes'))}>
              <div className="flex items-center gap-3">
                <div className="neuro-button p-3">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">Gerencie seus Clientes</p>
                  <p className="text-sm text-gray-600">Veja todos os leads capturados e cupons entregues</p>
                </div>
              </div>
            </div>

            <div className="neuro-card p-4 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate(createPageUrl('Vendas'))}>
              <div className="flex items-center gap-3">
                <div className="neuro-button p-3">
                  <Gift className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">Dê Baixa nos Cupons</p>
                  <p className="text-sm text-gray-600">Quando um cliente usar o cupom, registre aqui</p>
                </div>
              </div>
            </div>
          </div>

          <div className="neuro-card p-4 bg-purple-50 border-2 border-purple-200">
            <h5 className="font-semibold text-purple-900 mb-2">💡 Dica Final:</h5>
            <p className="text-sm text-purple-800">
              <strong>Primeira Semana:</strong> Incentive sua equipe a pedir para cada cliente escanear o QR Code. 
              Uma abordagem amigável aumenta muito a taxa de adesão!
            </p>
          </div>

          <button
            onClick={() => {
              onComplete();
              navigate(createPageUrl('Dashboard'));
            }}
            className="neuro-button pressed w-full py-4 text-gray-800 font-medium text-lg flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Concluir Tutorial e Ver Dashboard
          </button>
        </div>
      ),
      action: () => {
        onComplete();
        navigate(createPageUrl('Dashboard'));
      }
    }
  ];

  const currentTutorial = tutorialSteps[activeStep];

  const handleNext = () => {
    if (activeStep < tutorialSteps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handlePrevious = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleSkip = () => {
    if (window.confirm('Tem certeza que deseja pular o tutorial? Você pode acessá-lo novamente depois.')) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-60 z-[100]" onClick={handleSkip} />
      
      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[110] w-full max-w-3xl px-4 max-h-[90vh] overflow-y-auto">
        <div className="neuro-card p-8 bg-white">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`neuro-button p-4 text-${currentTutorial.color}-600`}>
                <currentTutorial.icon className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{currentTutorial.title}</h2>
                <p className="text-gray-600 mt-1">{currentTutorial.description}</p>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="neuro-button p-2 text-gray-500 hover:text-gray-700"
              title="Pular Tutorial"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Passo {activeStep + 1} de {tutorialSteps.length}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(((activeStep + 1) / tutorialSteps.length) * 100)}% completo
              </span>
            </div>
            <div className="flex gap-1">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 flex-1 rounded-full transition-all ${
                    index <= activeStep 
                      ? `bg-${currentTutorial.color}-600` 
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="mb-8">
            {currentTutorial.content}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <div>
              {activeStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="neuro-button px-6 py-3 text-gray-700 font-medium flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSkip}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium px-4"
              >
                Pular Tutorial
              </button>
              
              {activeStep < tutorialSteps.length - 1 && (
                <button
                  onClick={handleNext}
                  className="neuro-button pressed px-6 py-3 text-gray-800 font-medium flex items-center gap-2"
                >
                  Próximo
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}