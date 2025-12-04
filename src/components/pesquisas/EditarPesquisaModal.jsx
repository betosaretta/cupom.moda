import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Save } from "lucide-react";

export default function EditarPesquisaModal({ pesquisa, onClose, onSave, cupons = [] }) {
  const [formData, setFormData] = useState({
    titulo: "",
    pergunta_principal: "",
    pergunta_adicional: "",
    cupom_id: "",
    ativa: true,
    oferecer_cupom: false,
    perguntas_extras: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pesquisa) {
      setFormData({
        titulo: pesquisa.titulo || "",
        pergunta_principal: pesquisa.pergunta_principal || "",
        pergunta_adicional: pesquisa.pergunta_adicional || "",
        cupom_id: pesquisa.cupom_id || "",
        ativa: pesquisa.ativa ?? true,
        oferecer_cupom: pesquisa.oferecer_cupom || false,
        perguntas_extras: pesquisa.perguntas_extras || []
      });
    }
  }, [pesquisa]);

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
    
    setLoading(true);
    try {
      const dataToSave = { 
        ...formData,
        cupom_id: formData.oferecer_cupom ? formData.cupom_id : null
      };
      await onSave(pesquisa.id, dataToSave);
    } catch (error) {
      console.error("Erro ao salvar pesquisa:", error);
      alert("Erro ao atualizar pesquisa. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="neuro-card p-8 max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-800">Editar Pesquisa</h2>
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
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pergunta Principal (NPS) *
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
              Pergunta de Feedback (Opcional)
            </label>
            <input
              type="text"
              value={formData.pergunta_adicional}
              onChange={(e) => setFormData({...formData, pergunta_adicional: e.target.value})}
              className="neuro-input w-full p-3 text-gray-800"
            />
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
                  Cupom de Recompensa
                </label>
                <select
                  value={formData.cupom_id}
                  onChange={(e) => setFormData({...formData, cupom_id: e.target.value})}
                  className="neuro-input w-full p-3 text-gray-800"
                >
                  <option value="">Selecione um cupom para vincular</option>
                  {cupons.map((cupom) => (
                    <option key={cupom.id} value={cupom.id}>
                      {cupom.nome}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="ativa"
              checked={formData.ativa}
              onChange={(e) => setFormData({...formData, ativa: e.target.checked})}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="ativa" className="text-sm font-medium text-gray-700">
              Pesquisa ativa
            </label>
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
                {loading ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}