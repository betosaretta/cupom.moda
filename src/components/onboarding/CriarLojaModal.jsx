import React, { useState } from "react";
import { X, Store } from "lucide-react";

export default function CriarLojaModal({ onClose, onSave, isBlocker = false }) {
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    cnpj: "",
    logo_url: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Gerar slug automaticamente a partir do nome da loja
    const baseSlug = formData.nome
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // remove caracteres especiais
      .replace(/\s+/g, '-'); // troca espaços por hífens
    
    // Adiciona um identificador único para evitar colisões
    const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-5)}`;
    
    const finalLojaData = {
      ...formData,
      slug: uniqueSlug
    };
    
    onSave(finalLojaData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="neuro-card p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="neuro-button p-3">
              <Store className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Criar Sua Loja</h2>
              <p className="text-gray-600">Configure sua loja para começar a usar o Cupom.Moda</p>
            </div>
          </div>
          {!isBlocker && (
            <button
              onClick={onClose}
              className="neuro-button p-2 text-gray-600 hover:text-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div>
          <div className="neuro-card p-6 bg-blue-50 mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">🎉 Período de Teste Gratuito</h3>
            <p className="text-blue-700 text-sm">
              Comece com 14 dias grátis para testar todas as funcionalidades. 
              Após o período, apenas R$ 149,00/mês para continuar usando. Você pode adicionar seus dados de pagamento a qualquer momento.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Sua Loja *
              </label>
              <input
                type="text"
                required
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                className="neuro-input w-full p-4 text-gray-800 placeholder-gray-500"
                placeholder="Ex: Moda Center, Loja da Maria..."
              />
              <p className="text-xs text-gray-500 mt-1">
                A URL da sua loja será gerada automaticamente a partir deste nome.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição da Loja
              </label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                className="neuro-input w-full p-4 text-gray-800 h-24 resize-none"
                placeholder="Descreva sua loja em poucas palavras..."
              />
            </div>
            
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                className="neuro-button pressed flex-1 py-4 text-gray-800 font-medium text-lg"
              >
                Criar Loja e Começar Teste Grátis
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}