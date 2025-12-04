import React, { useState, useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';

export default function BaixarCupomModal({ onClose, onConfirm, lead }) {
  const [codigo, setCodigo] = useState('');

  useEffect(() => {
    if (lead && lead.cupom_gerado) {
      setCodigo(lead.cupom_gerado);
    }
  }, [lead]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!codigo) {
      alert('O código do cupom é obrigatório.');
      return;
    }
    // Apenas o código é necessário para a confirmação
    onConfirm(codigo);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="neuro-card p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="neuro-button p-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Dar Baixa no Cupom</h2>
          </div>
          <button
            onClick={onClose}
            className="neuro-button p-2 text-gray-600 hover:text-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código do Cupom *
            </label>
            <input
              type="text"
              required
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              className="neuro-input w-full p-3 text-gray-800 font-mono"
              placeholder="OFERTA-12345"
            />
          </div>

          <div className="neuro-card p-4 bg-yellow-50">
            <p className="text-xs text-yellow-700">
              <strong>Atenção:</strong> Esta ação irá marcar o cupom como utilizado e não pode ser desfeita.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="neuro-button pressed flex-1 py-3 text-gray-800 font-medium"
            >
              Confirmar Baixa
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