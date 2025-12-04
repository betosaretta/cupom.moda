import React, { useState } from "react";
import { X, Clock, Save } from "lucide-react";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function TrialManagementModal({ user, onClose, onSave }) {
  const [formData, setFormData] = useState({
    trial_ends_at: user.trial_ends_at || format(addDays(new Date(), 14), 'yyyy-MM-dd'),
    subscription_status: user.subscription_status || 'trial',
    phone_number: user.phone_number || '',
    trial_notifications_sent: user.trial_notifications_sent || []
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(user.id, formData);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar alterações.");
    } finally {
      setSaving(false);
    }
  };

  const getDaysRemaining = () => {
    if (!formData.trial_ends_at) return 0;
    const today = new Date();
    const endDate = new Date(formData.trial_ends_at);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const extendTrial = (days) => {
    const currentEnd = new Date(formData.trial_ends_at);
    const newEnd = addDays(currentEnd, days);
    setFormData({
      ...formData,
      trial_ends_at: format(newEnd, 'yyyy-MM-dd')
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="neuro-card p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="neuro-button p-2">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Gerenciar Trial</h2>
              <p className="text-sm text-gray-600">{user.full_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="neuro-button p-2 text-gray-600 hover:text-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Status Atual */}
          <div className="neuro-card p-4 bg-blue-50">
            <h3 className="font-semibold text-blue-800 mb-2">Status Atual</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Status:</span>
                <span className="ml-2 font-semibold">{formData.subscription_status}</span>
              </div>
              <div>
                <span className="text-blue-700">Dias Restantes:</span>
                <span className="ml-2 font-semibold">{getDaysRemaining()} dias</span>
              </div>
            </div>
          </div>

          {/* Configuração do Trial */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data de Fim do Trial
            </label>
            <input
              type="date"
              value={formData.trial_ends_at}
              onChange={(e) => setFormData({...formData, trial_ends_at: e.target.value})}
              className="neuro-input w-full p-3"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => extendTrial(7)}
                className="neuro-button px-3 py-1 text-sm text-gray-700"
              >
                +7 dias
              </button>
              <button
                onClick={() => extendTrial(14)}
                className="neuro-button px-3 py-1 text-sm text-gray-700"
              >
                +14 dias
              </button>
              <button
                onClick={() => extendTrial(30)}
                className="neuro-button px-3 py-1 text-sm text-gray-700"
              >
                +30 dias
              </button>
            </div>
          </div>

          {/* Status da Assinatura */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status da Assinatura
            </label>
            <select
              value={formData.subscription_status}
              onChange={(e) => setFormData({...formData, subscription_status: e.target.value})}
              className="neuro-input w-full p-3"
            >
              <option value="trial">Trial</option>
              <option value="active">Ativo</option>
              <option value="past_due">Pagamento Atrasado</option>
              <option value="canceled">Cancelado</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp para Notificações
            </label>
            <input
              type="text"
              value={formData.phone_number}
              onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
              className="neuro-input w-full p-3"
              placeholder="5511999999999"
            />
            <p className="text-xs text-gray-500 mt-1">
              Formato: código do país + DDD + número (ex: 5511999999999)
            </p>
          </div>

          {/* Histórico de Notificações */}
          {formData.trial_notifications_sent && formData.trial_notifications_sent.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Notificações Enviadas</h3>
              <div className="neuro-card p-4 bg-gray-50">
                {formData.trial_notifications_sent.map((notification, index) => (
                  <div key={index} className="text-sm text-gray-600 mb-1">
                    📱 {format(new Date(notification.date), 'dd/MM/yyyy HH:mm', { locale: ptBR })} - {notification.type}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="neuro-button pressed flex-1 py-3 text-gray-800 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? "Salvando..." : "Salvar Alterações"}
            </button>
            <button
              onClick={onClose}
              className="neuro-button flex-1 py-3 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}