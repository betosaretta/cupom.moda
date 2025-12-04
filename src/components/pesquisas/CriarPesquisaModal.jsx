
import React, { useState } from "react";
import { X, Plus, Trash2, Save } from "lucide-react";

export default function CriarPesquisaModal({ onClose, onSave, cupons = [] }) {
  const [formData, setFormData] = useState({
    titulo: "",
    pergunta_principal: "Em uma escala de 0 a 10, o quanto você recomendaria nossa loja a um amigo?",
    pergunta_adicional: "",
    cupom_id: "",
    ativa: true,
    oferecer_cupom: false,
    perguntas_extras: []
  });
  const [loading, setLoading] = useState(false);

  const handleAddQuestion = () => {
    const newId = Date.now().toString();
    setFormData(prev => ({
      ...prev,
      perguntas_extras: [...prev.perguntas_extras, { 
        id: newId, 
        texto: '', 
        tipo: 'texto_curto' 
      }]
    }));
  };

  const handleRemoveQuestion = (id) => {
    setFormData(prev => ({
      ...prev,
      perguntas_extras: prev.perguntas_extras.filter(q => q.id !== id)
    }));
  };

  const handleQuestionChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      perguntas_extras: prev.perguntas_extras.map(q => 
        q.id === id ? { ...q, [field]: value } : q
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.titulo.trim()) {
      alert("Por favor, insira um título para a pesquisa.");
      return;
    }
    if (formData.oferecer_cupom && !formData.cupom_id) {
      alert("Por favor, selecione um cupom de recompensa ou desmarque a opção de oferecer cupom.");
      return;
    }
    
    setLoading(true);
    try {
      const dataToSave = { 
        ...formData,
        cupom_id: formData.oferecer_cupom ? formData.cupom_id : null
      };
      await onSave(dataToSave);
    } catch (error) {
      console.error("Erro ao salvar pesquisa:", error);
      alert("Erro ao criar pesquisa. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="neuro-card p-8 max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-800">Nova Pesquisa de Satisfação</h2>
          <button
            onClick={onClose}
            className="neuro-button p-2 text-gray-600 hover:text-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto pr-2 -mr-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título da Pesquisa *
            </label>
            <input
              type="text"
              required
              value={formData.titulo}
              onChange={(e) => setFormData({...formData, titulo: e.target.value})}
              className="neuro-input w-full p-3 text-gray-800"
              placeholder="Ex: Pesquisa da Vitrine, Pesquisa Pós-Venda"
            />
             <p className="text-xs text-gray-500 mt-1">
              Um nome para você identificar esta campanha de pesquisa.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pergunta Principal de Satisfação *
            </label>
            <textarea
              required
              value={formData.pergunta_principal}
              onChange={(e) => setFormData({...formData, pergunta_principal: e.target.value})}
              className="neuro-input w-full p-3 text-gray-800 h-20 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pergunta Adicional (opcional)
            </label>
            <input
              type="text"
              value={formData.pergunta_adicional}
              onChange={(e) => setFormData({...formData, pergunta_adicional: e.target.value})}
              className="neuro-input w-full p-3 text-gray-800"
              placeholder="Ex: O que podemos fazer para melhorar?"
            />
             <p className="text-xs text-gray-500 mt-1">
              Uma pergunta aberta para o cliente deixar um comentário.
            </p>
          </div>
          
          <div className="neuro-card p-4 space-y-4">
            <h3 className="font-medium text-gray-800">Perguntas Adicionais</h3>
            {formData.perguntas_extras.map((q, index) => (
              <div key={q.id} className="space-y-2 p-3 bg-gray-50 rounded-lg">
                <label className="text-xs font-medium text-gray-600">Pergunta {index + 1}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Digite sua pergunta aqui"
                    value={q.texto}
                    onChange={(e) => handleQuestionChange(q.id, 'texto', e.target.value)}
                    className="neuro-input w-full p-2 text-sm"
                  />
                  <button 
                    type="button" 
                    onClick={() => handleRemoveQuestion(q.id)} 
                    className="neuro-button text-red-500 hover:text-red-700 p-2"
                  >
                    <Trash2 className="w-4 h-4"/>
                  </button>
                </div>
              </div>
            ))}
            <button 
              type="button" 
              onClick={handleAddQuestion} 
              className="neuro-button text-sm flex items-center gap-2 px-3 py-2"
            >
              <Plus className="w-4 h-4"/> Adicionar Pergunta
            </button>
          </div>

          <div className="neuro-card p-4">
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="oferecer_cupom"
                checked={formData.oferecer_cupom}
                onChange={(e) => setFormData({...formData, oferecer_cupom: e.target.checked})}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="oferecer_cupom" className="text-sm font-medium text-gray-700">
                Oferecer cupom de desconto como recompensa
              </label>
            </div>

            {formData.oferecer_cupom && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cupom de Recompensa *
                </label>
                <select
                  required={formData.oferecer_cupom}
                  value={formData.cupom_id}
                  onChange={(e) => setFormData({...formData, cupom_id: e.target.value})}
                  className="neuro-input w-full p-3 text-gray-800"
                >
                  <option value="">Selecione um cupom para vincular</option>
                  {cupons.length > 0 ? (
                    cupons.map((cupom) => (
                      <option key={cupom.id} value={cupom.id}>
                        {cupom.nome}
                      </option>
                    ))
                  ) : (
                    <option disabled>Nenhum cupom ativo encontrado</option>
                  )}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Este cupom será entregue ao cliente após ele responder a pesquisa.
                </p>
              </div>
            )}
          </div>
          
          <div className="pt-6 flex-shrink-0">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="neuro-button w-full py-3 text-gray-700 hover:text-gray-900"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="neuro-button pressed w-full py-3 text-gray-800 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? "Salvando..." : "Salvar Pesquisa"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
