
import React, { useState } from "react";
import { X, UserPlus } from "lucide-react";
import { User } from '@/entities/User';

export default function ConvidarUsuarioModal({ onClose, lojas, onRefresh }) {
  const [formData, setFormData] = useState({
    email: "",
    nome_completo: "",
    loja_id: "",
    app_role: "loja_admin"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInvite = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.app_role === 'loja_admin' && !formData.loja_id) {
      setError('É obrigatório selecionar uma loja para o "Admin da Loja".');
      setLoading(false);
      return;
    }

    try {
      await User.invite({
        email: formData.email,
        name: formData.nome_completo,
        role: formData.app_role,
        lojaId: formData.loja_id
      });

      alert('Convite enviado com sucesso!');
      await onRefresh();
      onClose();
    } catch (err) {
      console.error("Erro ao enviar convite:", err);
      setError(err.response?.data?.error || 'Ocorreu um erro. Verifique se o e-mail já existe.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="neuro-card p-8 max-w-lg w-full">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="neuro-button p-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Convidar Novo Cliente</h2>
          </div>
          <button
            onClick={onClose}
            className="neuro-button p-2 text-gray-600 hover:text-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleInvite} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email do Cliente *
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="neuro-input w-full p-3 text-gray-800 placeholder-gray-500"
              placeholder="cliente@exemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo do Cliente *
            </label>
            <input
              type="text"
              name="nome_completo"
              required
              value={formData.nome_completo}
              onChange={handleChange}
              className="neuro-input w-full p-3 text-gray-800 placeholder-gray-500"
              placeholder="Nome Completo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loja Associada
            </label>
            <select
              name="loja_id"
              value={formData.loja_id}
              onChange={handleChange}
              className="neuro-input w-full p-3 text-gray-800"
              required={formData.app_role === 'loja_admin'}
            >
              <option value="">Selecione uma loja (opcional)</option>
              {lojas.map(loja => (
                <option key={loja.id} value={loja.id}>{loja.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nível de Acesso
            </label>
            <select
              name="app_role"
              value={formData.app_role}
              onChange={handleChange}
              className="neuro-input w-full p-3 text-gray-800"
            >
              <option value="loja_admin">Admin da Loja</option>
              <option value="super_admin">Super Administrador</option>
            </select>
            <p className="text-xs text-gray-500 mt-2">
              {formData.app_role === 'loja_admin'
                ? 'O cliente terá acesso total à loja criada para ele.'
                : 'O cliente terá acesso a todas as áreas administrativas do sistema.'
              }
            </p>
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <p className="text-xs text-gray-500 pt-4 border-t border-gray-200">
            <strong>Importante:</strong> Ao clicar em "Enviar Convite", um e-mail será disparado para o cliente com um link seguro. Ele precisará clicar nesse link para confirmar a conta e definir sua senha de acesso.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="neuro-button px-6 py-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="neuro-button pressed px-6 py-2 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Enviar Convite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
