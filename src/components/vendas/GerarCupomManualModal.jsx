import React, { useState } from 'react';
import { X, Gift } from 'lucide-react';

export default function GerarCupomManualModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    nome_cliente: '',
    whatsapp: '',
    email_cliente: '',
    nome: 'Cupom Manual',
    tipo_desconto: 'valor_fixo',
    valor_desconto: '',
    validade_dias: '30',
    codigo_prefixo: 'MANUAL',
    texto_cupom: 'Cupom gerado manualmente',
    observacao: ''
  });
  const [loading, setLoading] = useState(false);

  const validateWhatsApp = (whatsapp) => {
    const cleaned = whatsapp.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateWhatsApp(formData.whatsapp)) {
      alert('Por favor, insira um número de WhatsApp válido (apenas números, 10-15 dígitos).');
      return;
    }

    if (!formData.valor_desconto || parseFloat(formData.valor_desconto) <= 0) {
      alert('Por favor, insira um valor de desconto válido.');
      return;
    }

    setLoading(true);
    try {
      const cupomData = {
        ...formData,
        valor_desconto: parseFloat(formData.valor_desconto),
        validade_dias: parseInt(formData.validade_dias),
        minimo_compra: 0
      };
      await onSave(cupomData);
    } catch (error) {
      console.error('Erro ao gerar cupom:', error);
      alert('Erro ao gerar cupom. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="neuro-card p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="neuro-button p-2">
              <Gift className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Gerar Cupom Manual</h2>
          </div>
          <button
            onClick={onClose}
            className="neuro-button p-2 text-gray-600 hover:text-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados do Cliente */}
          <div className="neuro-card p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Dados do Cliente</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome_cliente}
                  onChange={(e) => setFormData({...formData, nome_cliente: e.target.value})}
                  className="neuro-input w-full p-3 text-gray-800"
                  placeholder="Ex: João Silva"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({...formData, whatsapp: e.target.value.replace(/\D/g, '')})}
                  className="neuro-input w-full p-3 text-gray-800"
                  placeholder="11999999999"
                />
                <p className="text-xs text-gray-500 mt-1">Apenas números, com DDD</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail (opcional)
                </label>
                <input
                  type="email"
                  value={formData.email_cliente}
                  onChange={(e) => setFormData({...formData, email_cliente: e.target.value})}
                  className="neuro-input w-full p-3 text-gray-800"
                  placeholder="joao@email.com"
                />
              </div>
            </div>
          </div>

          {/* Configurações do Cupom */}
          <div className="neuro-card p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Configurações do Cupom</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Desconto *
                  </label>
                  <select
                    required
                    value={formData.tipo_desconto}
                    onChange={(e) => setFormData({...formData, tipo_desconto: e.target.value})}
                    className="neuro-input w-full p-3 text-gray-800"
                  >
                    <option value="valor_fixo">Valor Fixo (R$)</option>
                    <option value="percentual">Percentual (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor do Desconto *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.valor_desconto}
                    onChange={(e) => setFormData({...formData, valor_desconto: e.target.value})}
                    className="neuro-input w-full p-3 text-gray-800"
                    placeholder={formData.tipo_desconto === 'percentual' ? '10' : '50'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Validade (dias) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    required
                    value={formData.validade_dias}
                    onChange={(e) => setFormData({...formData, validade_dias: e.target.value})}
                    className="neuro-input w-full p-3 text-gray-800"
                    placeholder="30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prefixo do Código *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.codigo_prefixo}
                    onChange={(e) => setFormData({...formData, codigo_prefixo: e.target.value.toUpperCase()})}
                    className="neuro-input w-full p-3 text-gray-800"
                    placeholder="MANUAL"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texto do Cupom
                </label>
                <textarea
                  value={formData.texto_cupom}
                  onChange={(e) => setFormData({...formData, texto_cupom: e.target.value})}
                  className="neuro-input w-full p-3 text-gray-800 h-16 resize-none"
                  placeholder="Mensagem que aparecerá no cupom"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observação Interna
                </label>
                <textarea
                  value={formData.observacao}
                  onChange={(e) => setFormData({...formData, observacao: e.target.value})}
                  className="neuro-input w-full p-3 text-gray-800 h-16 resize-none"
                  placeholder="Motivo da criação manual, contexto, etc."
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="neuro-button pressed flex-1 py-3 text-gray-800 font-medium disabled:opacity-50"
            >
              {loading ? "Gerando..." : "Gerar Cupom"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="neuro-button flex-1 py-3 text-gray-700"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}