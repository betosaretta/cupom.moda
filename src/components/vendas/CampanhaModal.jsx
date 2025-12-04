import React, { useState } from 'react';
import { X, Send, Users } from 'lucide-react';

export default function CampanhaModal({ onClose, selectedCount, leads }) {
  const [campanha, setCampanha] = useState({
    nome: '',
    mensagem: 'Olá {nome}! Temos uma oferta especial para você!'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simular envio de campanha
    leads.forEach(lead => {
      if (lead.whatsapp) {
        const mensagemPersonalizada = campanha.mensagem.replace('{nome}', lead.nome_cliente);
        const cleanedWhatsapp = lead.whatsapp.replace(/\D/g, '');
        const encodedMessage = encodeURIComponent(mensagemPersonalizada);
        const whatsappUrl = `https://wa.me/55${cleanedWhatsapp}?text=${encodedMessage}`;
        
        // Abrir em nova aba com delay para não sobrecarregar
        setTimeout(() => {
          window.open(whatsappUrl, '_blank');
        }, leads.indexOf(lead) * 1000);
      }
    });

    alert(`Campanha iniciada para ${selectedCount} leads!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="neuro-card p-8 max-w-lg w-full">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="neuro-button p-2">
              <Send className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Nova Campanha</h2>
              <p className="text-sm text-gray-600">{selectedCount} leads selecionados</p>
            </div>
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
              Nome da Campanha
            </label>
            <input
              type="text"
              required
              value={campanha.nome}
              onChange={(e) => setCampanha({...campanha, nome: e.target.value})}
              className="neuro-input w-full p-3 text-gray-800"
              placeholder="Ex: Promoção de Final de Ano"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensagem
            </label>
            <textarea
              required
              value={campanha.mensagem}
              onChange={(e) => setCampanha({...campanha, mensagem: e.target.value})}
              className="neuro-input w-full p-3 text-gray-800 h-24 resize-none"
              placeholder="Use {nome} para personalizar"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use {'{nome}'} para personalizar com o nome do cliente
            </p>
          </div>

          <div className="neuro-card p-4">
            <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Leads Selecionados
            </h4>
            <div className="max-h-32 overflow-y-auto text-sm text-gray-600">
              {leads.slice(0, 5).map(lead => (
                <div key={lead.id} className="flex justify-between py-1">
                  <span>{lead.nome_cliente}</span>
                  <span className="text-xs">{lead.whatsapp || 'Sem WhatsApp'}</span>
                </div>
              ))}
              {leads.length > 5 && (
                <p className="text-xs text-center mt-2">... e mais {leads.length - 5} leads</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="neuro-button pressed flex-1 py-3 text-gray-800 font-medium"
            >
              Enviar Campanha
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