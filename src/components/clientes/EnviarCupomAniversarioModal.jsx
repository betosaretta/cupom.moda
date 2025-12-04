
import React, { useState } from "react";
import { X, Gift, Cake } from "lucide-react";

export default function EnviarCupomAniversarioModal({ cliente, onClose, onConfirm }) {
  const [cupomData, setCupomData] = useState({
    tipo_desconto: 'percentual',
    valor_desconto: 15,
    observacao: ''
  });
  const [mensagemPersonalizada, setMensagemPersonalizada] = useState('');

  const handleConfirm = (e) => {
    e.preventDefault();
    onConfirm({
      ...cupomData,
      mensagem_personalizada: mensagemPersonalizada
    });
  };

  const mensagemPadrao = `🎉 Parabéns, ${cliente?.nome_cliente?.split(' ')[0]}! 

Hoje é seu dia especial e temos um presente para você! 🎁

Use o cupom: *[CÓDIGO_CUPOM]*
${cupomData.tipo_desconto === 'percentual' ? cupomData.valor_desconto + '% de desconto' : 'R$ ' + cupomData.valor_desconto + ' de desconto'}

Válido por 30 dias. Venha nos visitar! ✨`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="neuro-card p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="neuro-button p-3">
              <Cake className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Cupom de Aniversário</h2>
              <p className="text-gray-600">Para {cliente?.nome_cliente}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="neuro-button p-2 text-gray-600 hover:text-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleConfirm} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Desconto
            </label>
            <select
              value={cupomData.tipo_desconto}
              onChange={(e) => setCupomData({ ...cupomData, tipo_desconto: e.target.value })}
              className="neuro-input w-full p-3"
            >
              <option value="percentual">Percentual (%)</option>
              <option value="valor_fixo">Valor Fixo (R$)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor do Desconto
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                {cupomData.tipo_desconto === 'percentual' ? '%' : 'R$'}
              </span>
              <input
                type="number"
                min="1"
                max={cupomData.tipo_desconto === 'percentual' ? "100" : "1000"}
                value={cupomData.valor_desconto}
                onChange={(e) => setCupomData({ ...cupomData, valor_desconto: parseFloat(e.target.value) || 0 })}
                className="neuro-input w-full p-3 pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensagem de Aniversário
            </label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="mensagem-padrao"
                  name="tipo-mensagem"
                  checked={!mensagemPersonalizada}
                  onChange={() => setMensagemPersonalizada('')}
                  className="w-4 h-4 text-blue-600"
                />
                <label htmlFor="mensagem-padrao" className="text-sm text-gray-700">
                  Usar mensagem padrão
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="mensagem-personalizada"
                  name="tipo-mensagem"
                  checked={!!mensagemPersonalizada}
                  onChange={() => setMensagemPersonalizada('Digite sua mensagem personalizada aqui...')}
                  className="w-4 h-4 text-blue-600"
                />
                <label htmlFor="mensagem-personalizada" className="text-sm text-gray-700">
                  Criar mensagem personalizada
                </label>
              </div>

              {mensagemPersonalizada ? (
                <textarea
                  value={mensagemPersonalizada}
                  onChange={(e) => setMensagemPersonalizada(e.target.value)}
                  className="neuro-input w-full p-3 h-32 resize-none text-sm"
                  placeholder="Digite sua mensagem personalizada..."
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-2">Prévia da mensagem padrão:</p>
                  <div className="text-xs text-gray-700 whitespace-pre-line bg-white p-2 rounded border">
                    {mensagemPadrao}
                  </div>
                </div>
              )}

              <p className="text-xs text-blue-600">
                💡 Use <strong>[CÓDIGO_CUPOM]</strong> na sua mensagem personalizada - será substituído pelo código real
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observação Interna (opcional)
            </label>
            <textarea
              value={cupomData.observacao}
              onChange={(e) => setCupomData({ ...cupomData, observacao: e.target.value })}
              className="neuro-input w-full p-3 h-20 resize-none"
              placeholder="Anotação interna sobre este cupom..."
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Detalhes do Cupom</span>
            </div>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Prefixo automático: PARABENS</li>
              <li>• Válido por 30 dias</li>
              <li>• Código será gerado automaticamente</li>
              <li>• WhatsApp será aberto para envio</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="neuro-button w-full py-3"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="neuro-button pressed w-full py-3 text-gray-800 font-medium flex items-center justify-center gap-2"
            >
              <Gift className="w-4 h-4" />
              Gerar e Enviar Cupom
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
