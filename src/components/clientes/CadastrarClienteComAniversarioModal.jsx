import React, { useState } from "react";
import { X, UserPlus } from "lucide-react";

export default function CadastrarClienteComAniversarioModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    nome_cliente: '',
    whatsapp: '',
    email_cliente: '',
    dia_aniversario: '',
    mes_aniversario: '',
    preferencias: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.nome_cliente.trim()) {
      setError('Nome é obrigatório.');
      return;
    }

    if (!formData.whatsapp.trim()) {
      setError('WhatsApp é obrigatório.');
      return;
    }

    const whatsappLimpo = formData.whatsapp.replace(/\D/g, '');
    if (whatsappLimpo.length < 10) {
      setError('WhatsApp deve ter pelo menos 10 dígitos.');
      return;
    }

    // Converter para formato de data usando ano fixo 2000
    let dataAniversario = '';
    if (formData.dia_aniversario && formData.mes_aniversario) {
      const dia = formData.dia_aniversario.padStart(2, '0');
      const mes = formData.mes_aniversario.padStart(2, '0');
      dataAniversario = `2000-${mes}-${dia}`;
    }

    const dadosParaSalvar = {
      nome_cliente: formData.nome_cliente.trim(),
      whatsapp: whatsappLimpo,
      email_cliente: formData.email_cliente.trim(),
      preferencias: formData.preferencias.trim(),
      data_aniversario: dataAniversario
    };

    onSave(dadosParaSalvar);
  };

  const diasDoMes = Array.from({ length: 31 }, (_, i) => i + 1);
  const meses = [
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="neuro-card p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="neuro-button p-3">
              <UserPlus className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Cadastrar Cliente</h2>
              <p className="text-gray-600">Adicione um novo cliente ao sistema</p>
            </div>
          </div>
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
              Nome Completo *
            </label>
            <input
              type="text"
              value={formData.nome_cliente}
              onChange={(e) => setFormData({ ...formData, nome_cliente: e.target.value })}
              className="neuro-input w-full p-3"
              placeholder="Nome completo do cliente"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp *
            </label>
            <input
              type="text"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              className="neuro-input w-full p-3"
              placeholder="(11) 99999-9999"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email_cliente}
              onChange={(e) => setFormData({ ...formData, email_cliente: e.target.value })}
              className="neuro-input w-full p-3"
              placeholder="cliente@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data de Aniversário
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <select
                  value={formData.dia_aniversario}
                  onChange={(e) => setFormData({ ...formData, dia_aniversario: e.target.value })}
                  className="neuro-input w-full p-3"
                >
                  <option value="">Dia</option>
                  {diasDoMes.map(dia => (
                    <option key={dia} value={dia}>{dia}</option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={formData.mes_aniversario}
                  onChange={(e) => setFormData({ ...formData, mes_aniversario: e.target.value })}
                  className="neuro-input w-full p-3"
                >
                  <option value="">Mês</option>
                  {meses.map(mes => (
                    <option key={mes.value} value={mes.value}>{mes.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Usado para campanhas de aniversário personalizadas
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferências / Observações
            </label>
            <textarea
              value={formData.preferencias}
              onChange={(e) => setFormData({ ...formData, preferencias: e.target.value })}
              className="neuro-input w-full p-3 h-20 resize-none"
              placeholder="Tamanhos preferenciais, produtos de interesse, etc."
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="neuro-button w-full py-3"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="neuro-button pressed w-full py-3 text-gray-800 font-medium"
            >
              Cadastrar Cliente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}