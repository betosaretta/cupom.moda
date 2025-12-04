import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";

export default function EditarCupomModal({ cupom, onClose, onSave }) {
  const [formData, setFormData] = useState({ ...cupom });

  useEffect(() => {
    setFormData({ ...cupom });
  }, [cupom]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSave = {
      ...formData,
      valor_desconto: parseFloat(formData.valor_desconto),
      validade_dias: parseInt(formData.validade_dias),
      minimo_compra: formData.minimo_compra ? parseFloat(formData.minimo_compra) : null
    };
    delete dataToSave.id; 
    delete dataToSave.created_date;
    delete dataToSave.updated_date;
    delete dataToSave.created_by;
    
    onSave(cupom.id, dataToSave);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="neuro-card p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Editar Cupom</h2>
          <button
            onClick={onClose}
            className="neuro-button p-2 text-gray-600 hover:text-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Cupom
            </label>
            <input
              type="text"
              required
              value={formData.nome || ''}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
              className="neuro-input w-full p-3 text-gray-800 placeholder-gray-500"
              placeholder="Ex: Desconto Pesquisa de Satisfação"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Desconto
              </label>
              <select
                value={formData.tipo_desconto || 'percentual'}
                onChange={(e) => setFormData({...formData, tipo_desconto: e.target.value})}
                className="neuro-input w-full p-3 text-gray-800"
              >
                <option value="percentual">Percentual (%)</option>
                <option value="valor_fixo">Valor Fixo (R$)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.valor_desconto || ''}
                onChange={(e) => setFormData({...formData, valor_desconto: e.target.value})}
                className="neuro-input w-full p-3 text-gray-800"
                placeholder={formData.tipo_desconto === 'percentual' ? '10' : '50'}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Validade (dias)
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.validade_dias || ''}
                onChange={(e) => setFormData({...formData, validade_dias: e.target.value})}
                className="neuro-input w-full p-3 text-gray-800"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ativo
              </label>
              <select
                value={formData.ativo ? 'true' : 'false'}
                onChange={(e) => setFormData({...formData, ativo: e.target.value === 'true'})}
                className="neuro-input w-full p-3 text-gray-800"
              >
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Texto do Cupom
            </label>
            <textarea
              value={formData.texto_cupom || ''}
              onChange={(e) => setFormData({...formData, texto_cupom: e.target.value})}
              className="neuro-input w-full p-3 text-gray-800 h-20 resize-none"
              placeholder="Mensagem que aparecerá no cupom"
            />
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="neuro-button flex-1 py-3 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="neuro-button pressed flex-1 py-3 text-gray-800 font-medium flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}