import React, { useState } from 'react';
import { X, ShieldCheck } from 'lucide-react';

export default function BaixarCupomModal({ onClose, onConfirm }) {
  const [cupomCode, setCupomCode] = useState('');
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cupomCode || !cpf) {
      alert("Por favor, preencha o código do cupom e o CPF.");
      return;
    }
    setLoading(true);
    await onConfirm(cupomCode, cpf);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="neuro-card p-8 max-w-lg w-full">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="neuro-button p-2">
              <ShieldCheck className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Baixar Cupom Manualmente</h2>
          </div>
          <button
            onClick={onClose}
            className="neuro-button p-2 text-gray-600 hover:text-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-gray-600 mb-6">
          Insira o código do cupom e o CPF do cliente para registrar o uso e evitar reutilização.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código do Cupom *
            </label>
            <input
              type="text"
              value={cupomCode}
              onChange={(e) => setCupomCode(e.target.value.toUpperCase())}
              className="neuro-input w-full p-3 text-gray-800 font-mono"
              placeholder="OFERTA-XXXXX"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CPF do Cliente *
            </label>
            <input
              type="text"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              className="neuro-input w-full p-3 text-gray-800"
              placeholder="000.000.000-00"
              required
            />
          </div>
          
          <div className="flex gap-3 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="neuro-button pressed flex-1 py-3 text-gray-800 font-medium disabled:opacity-50"
            >
              {loading ? "Validando..." : "Confirmar Baixa"}
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