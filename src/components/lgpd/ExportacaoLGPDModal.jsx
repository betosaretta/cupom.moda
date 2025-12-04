import React, { useState } from "react";
import { Shield, Download, AlertTriangle } from "lucide-react";

export default function ExportacaoLGPDModal({ onAccept, onCancel }) {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    if (!accepted) {
      alert("Por favor, marque a caixa de aceite para continuar com a exportação.");
      return;
    }
    onAccept();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="neuro-card w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header fixo */}
        <div className="p-6 pb-4 border-b border-gray-200 flex-shrink-0">
          <div className="text-center">
            <div className="neuro-button p-4 inline-flex mb-4">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Exportação de Dados de Clientes</h2>
            <p className="text-sm sm:text-base text-gray-600">Confirmação necessária para exportar dados pessoais</p>
          </div>
        </div>

        {/* Conteúdo com scroll */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="neuro-card p-4 sm:p-6 bg-orange-50 border-2 border-orange-200 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-orange-800 mb-2">⚠️ Importante - LGPD</h3>
                <div className="text-sm text-orange-700 space-y-2">
                  <p>Você está prestes a exportar dados pessoais de seus clientes, incluindo:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Nomes completos</li>
                    <li>Números de telefone/WhatsApp</li>
                    <li>Endereços de e-mail</li>
                    <li>Informações de cupons e interações</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="neuro-card p-4 bg-blue-50 mb-6">
            <h4 className="font-semibold text-blue-800 mb-2">📋 Suas Responsabilidades:</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Manter os dados seguros e protegidos</p>
              <p>• Usar apenas para finalidades legítimas do seu negócio</p>
              <p>• Não compartilhar com terceiros sem consentimento</p>
              <p>• Excluir quando não precisar mais dos dados</p>
              <p>• Respeitar os direitos dos titulares dos dados</p>
            </div>
          </div>

          <div className="flex items-start gap-3 mb-6">
            <input
              type="checkbox"
              id="export-accept"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded mt-1 flex-shrink-0"
            />
            <label htmlFor="export-accept" className="text-sm text-gray-700">
              <strong>Declaro que:</strong> Tenho CNPJ válido cadastrado, entendo minhas responsabilidades sobre o tratamento destes dados pessoais conforme a LGPD (Lei 13.709/2018), e me comprometo a utilizá-los apenas para finalidades legítimas do meu negócio, mantendo-os seguros e respeitando os direitos dos titulares.
            </label>
          </div>
        </div>

        {/* Footer fixo com botões */}
        <div className="p-6 pt-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={onCancel}
              className="neuro-button px-6 py-3 text-gray-700 order-2 sm:order-1"
            >
              Cancelar
            </button>
            <button
              onClick={handleAccept}
              disabled={!accepted}
              className="neuro-button pressed px-6 py-3 text-gray-800 font-medium disabled:opacity-50 flex items-center justify-center gap-2 order-1 sm:order-2"
            >
              <Download className="w-4 h-4" />
              Exportar Dados
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}