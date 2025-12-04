import React, { useState } from "react";
import { X, Save, AlertTriangle } from "lucide-react";

export default function EditarUsuarioModal({ user, lojas, onClose, onSave }) {
  const [formData, setFormData] = useState({
    full_name: user.full_name || '',
    app_role: user.app_role || 'loja_admin',
    loja_id: user.loja_id || '',
    subscription_status: user.subscription_status || 'trial',
    trial_ends_at: user.trial_ends_at ? new Date(user.trial_ends_at).toISOString().split('T')[0] : ''
  });
  const [error, setError] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    setError('');

    if (formData.app_role !== 'super_admin' && !formData.loja_id) {
      setError('É obrigatório associar uma loja para usuários do tipo "Admin da Loja" ou "Operador".');
      return;
    }

    // Prepara os dados para salvar, garantindo que a data seja enviada corretamente
    const dataToSave = {
        ...formData,
        trial_ends_at: formData.trial_ends_at ? new Date(formData.trial_ends_at).toISOString() : null
    };

    onSave(user.id, dataToSave);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="neuro-card p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Editar Usuário</h2>
          <button
            onClick={onClose}
            className="neuro-button p-2 text-gray-600 hover:text-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* ... outros campos ... */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
            <input type="text" disabled value={formData.full_name} className="neuro-input w-full p-3 bg-gray-100" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Loja Associada</label>
            <select
              value={formData.loja_id}
              onChange={(e) => setFormData({ ...formData, loja_id: e.target.value })}
              className={`neuro-input w-full p-3 ${formData.app_role !== 'super_admin' && !formData.loja_id ? 'border-red-500' : ''}`}
            >
              <option value="">Selecione uma loja</option>
              {lojas.map(loja => (
                <option key={loja.id} value={loja.id}>{loja.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nível de Acesso</label>
            <select
              value={formData.app_role}
              onChange={(e) => setFormData({ ...formData, app_role: e.target.value })}
              className="neuro-input w-full p-3"
            >
              <option value="loja_admin">Admin da Loja</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status da Assinatura</label>
            <select
              value={formData.subscription_status}
              onChange={(e) => setFormData({ ...formData, subscription_status: e.target.value })}
              className="neuro-input w-full p-3"
            >
              <option value="trial">Trial</option>
              <option value="active">Ativo</option>
              <option value="past_due">Pagamento Atrasado</option>
              <option value="canceled">Cancelado</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fim do Trial</label>
            <input
              type="date"
              value={formData.trial_ends_at}
              onChange={(e) => setFormData({ ...formData, trial_ends_at: e.target.value })}
              className="neuro-input w-full p-3"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-100 p-3 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="neuro-button flex-1 py-3"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="neuro-button pressed flex-1 py-3 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}