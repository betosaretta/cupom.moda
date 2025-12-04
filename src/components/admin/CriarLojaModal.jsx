import React, { useState } from "react";
import { X } from "lucide-react";

export default function CriarLojaModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    nome: "",
    slug: "",
    descricao: "",
    cnpj: "",
    logo_url: "",
    subdominio: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Gerar slug automaticamente se não fornecido
    if (!formData.slug && formData.nome) {
      formData.slug = formData.nome
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-');
    }
    
    onSave(formData);
  };

  const handleNomeChange = (e) => {
    const nome = e.target.value;
    const slug = nome
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-');
    
    setFormData({
      ...formData,
      nome,
      slug
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="neuro-card p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Nova Loja</h2>
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
              Nome da Loja *
            </label>
            <input
              type="text"
              required
              value={formData.nome}
              onChange={handleNomeChange}
              className="neuro-input w-full p-3 text-gray-800 placeholder-gray-500"
              placeholder="Ex: Moda Center"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug (URL) *
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
              className="neuro-input w-full p-3 text-gray-800 placeholder-gray-500"
              placeholder="moda-center"
            />
            <p className="text-xs text-gray-500 mt-1">
              Será usado na URL da loja (apenas letras, números e hífens)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({...formData, descricao: e.target.value})}
              className="neuro-input w-full p-3 text-gray-800 h-20 resize-none"
              placeholder="Descrição da loja..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CNPJ
            </label>
            <input
              type="text"
              value={formData.cnpj}
              onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
              className="neuro-input w-full p-3 text-gray-800 placeholder-gray-500"
              placeholder="00.000.000/0000-00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL do Logo
            </label>
            <input
              type="url"
              value={formData.logo_url}
              onChange={(e) => setFormData({...formData, logo_url: e.target.value})}
              className="neuro-input w-full p-3 text-gray-800 placeholder-gray-500"
              placeholder="https://exemplo.com/logo.png"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subdomínio (opcional)
            </label>
            <input
              type="text"
              value={formData.subdominio}
              onChange={(e) => setFormData({...formData, subdominio: e.target.value.toLowerCase()})}
              className="neuro-input w-full p-3 text-gray-800 placeholder-gray-500"
              placeholder="minhaloja"
            />
            <p className="text-xs text-gray-500 mt-1">
              Se preenchido, criará um subdomínio personalizado
            </p>
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="submit"
              className="neuro-button pressed flex-1 py-3 text-gray-800 font-medium"
            >
              Criar Loja
            </button>
            <button
              type="button"
              onClick={onClose}
              className="neuro-button flex-1 py-3 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}