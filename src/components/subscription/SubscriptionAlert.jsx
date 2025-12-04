import React, { useState } from "react";
import { AlertCircle, CreditCard } from "lucide-react";
import { createCheckoutSession } from "@/functions/createCheckoutSession";
import { createPortalSession } from "@/functions/createPortalSession";

export default function SubscriptionAlert({ user }) {
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    setLoading(true);
    try {
      // Se o status for trial, cancelado, inativo, o usuário precisa assinar.
      const isSubscribing = ['trial', 'trialing', 'inactive', 'canceled'].includes(user.subscription_status);
      
      // Se o status for ativo ou com pagamento atrasado, ele gerencia a assinatura existente.
      const isManaging = ['active', 'past_due'].includes(user.subscription_status);

      let response;
      if (isSubscribing) {
        response = await createCheckoutSession();
      } else if (isManaging) {
        response = await createPortalSession();
      }

      if (response && response.data && response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error("Erro ao processar ação de assinatura:", error);
      alert("Não foi possível processar sua solicitação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const getAlertContent = () => {
    switch (user.subscription_status) {
      case 'past_due':
        return {
          title: 'Pagamento em Atraso',
          message: 'Seu pagamento falhou. Atualize sua forma de pagamento para manter o acesso.',
          action: 'Atualizar Pagamento'
        };
      case 'canceled':
      case 'inactive':
        return {
          title: 'Assinatura Inativa',
          message: 'Seu período de teste acabou ou sua assinatura foi cancelada. Assine agora para continuar.',
          action: 'Assinar Agora'
        };
      case 'trial':
      case 'trialing':
         const trialEndDate = user.trial_ends_at ? new Date(user.trial_ends_at) : null;
         const today = new Date();
         const daysLeft = trialEndDate ? Math.ceil((trialEndDate - today) / (1000 * 60 * 60 * 24)) : 0;
        return {
          title: 'Você está no Período de Teste Gratuito!',
          message: `Você tem ${daysLeft > 0 ? daysLeft : 0} dias restantes. Insira seus dados de pagamento para garantir o acesso após o teste.`,
          action: 'Adicionar Pagamento'
        };
      default:
        return null;
    }
  };

  const alertContent = getAlertContent();
  if (!alertContent) return null;

  return (
    <div className="neuro-card p-6 border-2 border-yellow-200 bg-yellow-50 mb-6">
      <div className="flex items-start gap-4">
        <div className="neuro-button p-2">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 mb-2">{alertContent.title}</h3>
          <p className="text-gray-700 mb-4">{alertContent.message}</p>
          <button 
            onClick={handleAction}
            disabled={loading}
            className="neuro-button pressed px-6 py-2 text-gray-800 font-medium flex items-center gap-2 disabled:opacity-50"
          >
            <CreditCard className="w-4 h-4" />
            {loading ? "Aguarde..." : alertContent.action}
          </button>
        </div>
      </div>
    </div>
  );
}