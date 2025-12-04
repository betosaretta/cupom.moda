import React, { useState } from 'react';
import { X, Send, Users, MessageSquare } from 'lucide-react';

export default function CampanhaModal({ onClose, onSave, selectedLeads, leadsData }) {
  const [formData, setFormData] = useState({
    nome: '',
    mensagem: '',
    agendarPara: '',
    incluirNome: true,
    incluirCupom: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      leads: selectedLeads,
      dataEnvio: formData.agendarPara || new Date().toISOString()
    });
  };

  const previewMessage = () => {
    let msg = formData.mensagem;
    if (formData.incluirNome && leadsData[0]) {
      msg = msg.replace(/\{nome\}/g, leadsData[0].nome_cliente || 'Cliente');
    }
    if (formData.incluirCupom && leadsData[0]?.cupom_gerado) {
      msg = msg.replace(/\{cupom\}/g, leadsData[0].cupom_gerado);
    }
    return msg;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="neuro-card p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="neuro-button p-2">
              <Send className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Nova Campanha WhatsApp</h2>
              <p className="text-sm text-gray-600">{selectedLeads} leads selecionados</p>
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
              Nome da Campanha *
            </label>
            <input
              type="text"
              required
              value={formData.nome}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
              className="neuro-input w-full p-3 text-gray-800"
              placeholder="Ex: Promoção de Verão 2024"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensagem *
            </label>
            <textarea
              required
              value={formData.mensagem}
              onChange={(e) => setFormData({...formData, mensagem: e.target.value})}
              className="neuro-input w-full p-3 text-gray-800 h-32 resize-none"
              placeholder="Olá {nome}! Temos uma oferta especial para você..."
            />
            <div className="flex flex-wrap gap-4 mt-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formData.incluirNome}
                  onChange={(e) => setFormData({...formData, incluirNome: e.target.checked})}
                  className="w-4 h-4"
                />
                Personalizar com {'{nome}'}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formData.incluirCupom}
                  onChange={(e) => setFormData({...formData, incluirCupom: e.target.checked})}
                  className="w-4 h-4"
                />
                Incluir {'{cupom}'} se disponível
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Agendar Envio (Opcional)
            </label>
            <input
              type="datetime-local"
              value={formData.agendarPara}
              onChange={(e) => setFormData({...formData, agendarPara: e.target.value})}
              className="neuro-input w-full p-3 text-gray-800"
              min={new Date().toISOString().slice(0, 16)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Deixe em branco para enviar imediatamente
            </p>
          </div>

          {/* Preview */}
          {formData.mensagem && (
            <div className="neuro-card p-4 bg-green-50">
              <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Pré-visualização da Mensagem
              </h4>
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {previewMessage()}
                </p>
              </div>
            </div>
          )}

          {/* Resumo dos leads */}
          <div className="neuro-card p-4">
            <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Leads Selecionados ({selectedLeads})
            </h4>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {leadsData.slice(0, 10).map((lead, index) => (
                <div key={lead.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{lead.nome_cliente}</span>
                  <div className="flex items-center gap-2">
                    {lead.whatsapp ? (
                      <span className="text-green-600 text-xs">{lead.whatsapp}</span>
                    ) : (
                      <span className="text-red-500 text-xs">Sem WhatsApp</span>
                    )}
                  </div>
                </div>
              ))}
              {leadsData.length > 10 && (
                <p className="text-xs text-gray-500 text-center pt-2">
                  ... e mais {leadsData.length - 10} leads
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="submit"
              className="neuro-button pressed flex-1 py-3 text-gray-800 font-medium"
            >
              {formData.agendarPara ? 'Agendar Campanha' : 'Enviar Agora'}
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