import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';

export default function CadastrarClienteModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    nome_cliente: '',
    whatsapp: '',
    email_cliente: '',
    comentario: ''
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

    setLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Erro ao cadastrar cliente:', error);
      alert('Erro ao cadastrar cliente. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="neuro-card p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="neuro-button p-2">
              <UserPlus className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Cadastrar Cliente</h2>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações (opcional)
            </label>
            <textarea
              value={formData.comentario}
              onChange={(e) => setFormData({...formData, comentario: e.target.value})}
              className="neuro-input w-full p-3 text-gray-800 h-20 resize-none"
              placeholder="Observações sobre o cliente..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="neuro-button pressed flex-1 py-3 text-gray-800 font-medium disabled:opacity-50"
            >
              {loading ? "Cadastrando..." : "Cadastrar Cliente"}
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