import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import CriarLojaModal from './CriarLojaModal';
import GuidedTour from './GuidedTour';

export default function OnboardingManager({ currentUser, currentLoja, onLojaCreated }) {
  const [onboardingState, setOnboardingState] = useState(null);
  const [showCreateLoja, setShowCreateLoja] = useState(false);
  const [showMainTour, setShowMainTour] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadOnboardingState();
    }
  }, [currentUser]);

  const loadOnboardingState = async () => {
    try {
      const states = await base44.entities.UserOnboarding.filter({ 
        user_id: currentUser.id 
      });
      
      if (states.length > 0) {
        setOnboardingState(states[0]);
        checkAndTriggerOnboarding(states[0]);
      } else {
        // Criar estado inicial
        const newState = await base44.entities.UserOnboarding.create({
          user_id: currentUser.id,
          etapa_atual: 'inicio',
          checklist: {
            loja_criada: false,
            primeira_pesquisa_criada: false,
            primeiro_cupom_criado: false,
            primeiro_lead_capturado: false,
            qr_code_baixado: false,
            visitou_dashboard: false,
            visitou_ajuda: false
          }
        });
        setOnboardingState(newState);
        checkAndTriggerOnboarding(newState);
      }
    } catch (error) {
      console.error('Erro ao carregar onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAndTriggerOnboarding = (state) => {
    // Etapa 1: Criar Loja (Bloqueante)
    if (!currentLoja && !state.checklist?.loja_criada) {
      setShowCreateLoja(true);
      return;
    }

    // Etapa 2: Tour Principal (Após criar loja)
    if (currentLoja && state.checklist?.loja_criada && !state.tours_completados?.includes('main-tour')) {
      // Aguardar um pouco para não sobrecarregar o usuário
      setTimeout(() => {
        setShowMainTour(true);
      }, 1000);
    }
  };

  const handleLojaCreated = async (loja) => {
    try {
      await base44.entities.UserOnboarding.update(onboardingState.id, {
        etapa_atual: 'loja_criada',
        'checklist.loja_criada': true
      });
      
      setShowCreateLoja(false);
      
      if (onLojaCreated) {
        await onLojaCreated(loja);
      }
      
      // Recarregar estado e iniciar tour
      await loadOnboardingState();
    } catch (error) {
      console.error('Erro ao atualizar onboarding:', error);
    }
  };

  const handleTourComplete = async () => {
    try {
      const completedTours = onboardingState.tours_completados || [];
      await base44.entities.UserOnboarding.update(onboardingState.id, {
        tours_completados: [...completedTours, 'main-tour']
      });
      setShowMainTour(false);
    } catch (error) {
      console.error('Erro ao atualizar tour:', error);
    }
  };

  const mainTourSteps = [
    {
      title: '🎉 Bem-vindo ao Cupom.Moda!',
      description: 'Sua loja foi criada com sucesso! Vamos te mostrar como capturar leads e fidelizar clientes em 3 passos simples. Este tour leva apenas 2 minutos.',
      tips: [
        'Você pode pular e acessar novamente na seção "Como Usar"',
        'Siga os passos para aproveitar ao máximo a plataforma'
      ]
    },
    {
      title: '🎁 Passo 1: Crie seu Primeiro Cupom',
      description: 'Cupons atraem clientes e incentivam compras! Vá em "Cupons" no menu e crie uma oferta com desconto em percentual ou valor fixo.',
      tips: [
        'Comece com 10-15% de desconto',
        'Defina validade de 7-14 dias para criar urgência',
        'Você pode definir valor mínimo de compra'
      ]
    },
    {
      title: '😊 Passo 2: Crie uma Pesquisa NPS',
      description: 'Pesquisas capturam leads e medem satisfação! Vá em "Pesquisas", crie uma pesquisa e vincule o cupom que você criou como recompensa.',
      tips: [
        'Clientes que respondem ganham o cupom automaticamente',
        'Você coleta nome, email e WhatsApp do cliente',
        'Notas 9-10 são promotores, 0-6 são detratores'
      ]
    },
    {
      title: '📱 Passo 3: Divulgue o QR Code',
      description: 'Na pesquisa criada, clique em "QR Code" e imprima o material. Coloque na vitrine, no caixa ou nas sacolas. Clientes escaneiam e respondem!',
      tips: [
        'Use o botão "Imprimir A4" para material pronto',
        'Coloque em locais visíveis na loja',
        'Acompanhe os resultados no Dashboard'
      ]
    },
    {
      title: '🚀 Tudo Pronto!',
      description: 'Agora é só seguir os 3 passos: Cupom → Pesquisa → QR Code. Seus clientes vão escanear, responder e você terá leads qualificados!',
      tips: [
        'Menu "Cupons" → Criar cupom de desconto',
        'Menu "Pesquisas" → Criar pesquisa e vincular cupom',
        'Imprimir QR Code e divulgar na loja',
        'Acompanhar resultados em "Início"'
      ]
    }
  ];

  if (loading) {
    return null;
  }

  return (
    <>
      {showCreateLoja && (
        <CriarLojaModal
          onClose={() => {}}
          onSave={handleLojaCreated}
          isBlocker={true}
        />
      )}

      {showMainTour && (
        <GuidedTour
          tourId="main-tour"
          steps={mainTourSteps}
          onComplete={handleTourComplete}
          onSkip={handleTourComplete}
        />
      )}
    </>
  );
}