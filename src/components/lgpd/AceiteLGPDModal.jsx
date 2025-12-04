import React, { useState } from "react";
import { Shield, ExternalLink, Check } from "lucide-react";
import { User } from "@/entities/all";

export default function AceiteLGPDModal({ onAccept }) {
  const [accepted, setAccepted] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleAccept = async () => {
    if (!accepted) {
      alert("Por favor, marque a caixa de aceite para continuar.");
      return;
    }
    
    setProcessing(true);
    try {
      await User.updateMyUserData({
        lgpd_aceito: true,
        lgpd_aceito_em: new Date().toISOString(),
        lgpd_versao_aceita: "1.0"
      });
      onAccept();
    } catch (error) {
      console.error("Erro ao registrar aceite:", error);
      alert("Erro ao processar aceite. Tente novamente.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="neuro-card w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header fixo */}
        <div className="p-6 pb-4 border-b border-gray-200 flex-shrink-0">
          <div className="text-center">
            <div className="neuro-button p-4 inline-flex mb-4">
              <Shield className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Bem-vindo ao Cupom.Moda!</h2>
            <p className="text-sm sm:text-base text-gray-600">Para continuar, precisamos do seu consentimento para o tratamento de dados.</p>
          </div>
        </div>

        {/* Conteúdo com scroll */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="neuro-card p-4 sm:p-6 bg-blue-50 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">📋 Resumo - Política de Privacidade</h3>
            <div className="text-sm text-gray-700 space-y-2">
              <p>• <strong>Dados coletados:</strong> Nome, e-mail, CNPJ, telefone e dados de navegação</p>
              <p>• <strong>Finalidade:</strong> Prestação dos serviços, melhorias na plataforma e comunicação</p>
              <p>• <strong>Compartilhamento:</strong> Apenas quando necessário para prestação do serviço ou exigido por lei</p>
              <p>• <strong>Seus direitos:</strong> Acesso, correção, exclusão e portabilidade dos seus dados</p>
              <p>• <strong>Segurança:</strong> Utilizamos medidas técnicas para proteger seus dados</p>
            </div>
          </div>

          <div className="flex items-start gap-3 mb-6">
            <input
              type="checkbox"
              id="lgpd-accept"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded mt-1 flex-shrink-0"
            />
            <label htmlFor="lgpd-accept" className="text-sm text-gray-700">
              Declaro que li e aceito a{" "}
              <a 
                href="/LGPD" 
                target="_blank" 
                className="text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                Política de Privacidade completa
                <ExternalLink className="w-3 h-3" />
              </a>
              {" "}e autorizo o tratamento dos meus dados pessoais conforme descrito.
            </label>
          </div>
        </div>

        {/* Footer fixo com botão */}
        <div className="p-6 pt-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex justify-center mb-4">
            <button
              onClick={handleAccept}
              disabled={!accepted || processing}
              className="neuro-button pressed px-6 sm:px-8 py-3 text-gray-800 font-medium disabled:opacity-50 flex items-center gap-2 text-sm sm:text-base"
            >
              <Check className="w-4 h-4 sm:w-5 sm:h-5" />
              {processing ? "Processando..." : "Aceitar e Continuar"}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Ao aceitar, você confirma que tem mais de 18 anos e autoridade para tomar essa decisão.
          </p>
        </div>
      </div>
    </div>
  );
}