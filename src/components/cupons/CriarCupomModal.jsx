
import React, { useState } from "react";
import { X, Save } from "lucide-react"; // Added Save import

export default function CriarCupomModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    nome: "",
    tipo_desconto: "valor_fixo", // Changed default from "percentual" to "valor_fixo"
    valor_desconto: "",
    validade_dias: "30",
    codigo_prefixo: "OFERTA",
    minimo_compra: "",
    texto_cupom: "Aproveite seu cupom de desconto exclusivo!",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const cupomData = {
        nome: formData.nome,
        tipo_desconto: formData.tipo_desconto,
        valor_desconto: formData.valor_desconto ? parseFloat(formData.valor_desconto) : 0, 
        validade_dias: parseInt(formData.validade_dias),
        codigo_prefixo: formData.codigo_prefixo,
        minimo_compra: formData.minimo_compra ? parseFloat(formData.minimo_compra) : 0,
        texto_cupom: formData.texto_cupom,
        ativo: true
      };

      await onSave(cupomData);
    } catch (error) {
      console.error("Erro no formulário:", error);
      alert("Erro ao criar cupom: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="neuro-card p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Novo Cupom de Desconto</h2>
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
              Nome do Cupom *
            </label>
            <input
              type="text"
              required
              value={formData.nome}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
              className="neuro-input w-full p-3 text-gray-800 placeholder-gray-500"
              placeholder="Ex: 10% OFF na Primeira Compra" /* Updated placeholder */
            />
            <p className="text-xs text-gray-500 mt-1">
              Este é o nome que você usará para identificar o cupom. {/* Added description */}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Desconto *
              </label>
              <select
                required
                value={formData.tipo_desconto}
                onChange={(e) => setFormData({...formData, tipo_desconto: e.target.value})}
                className="neuro-input w-full p-3 text-gray-800"
              >
                <option value="valor_fixo">Valor Fixo (R$)</option> {/* Reordered option */}
                <option value="percentual">Percentual (%)</option> {/* Reordered option */}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor do Desconto *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.valor_desconto}
                onChange={(e) => setFormData({...formData, valor_desconto: e.target.value})}
                className="neuro-input w-full p-3 text-gray-800"
                placeholder="10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Validade (dias) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.validade_dias}
                onChange={(e) => setFormData({...formData, validade_dias: e.target.value})}
                className="neuro-input w-full p-3 text-gray-800"
                placeholder="30"
              />
               <p className="text-xs text-gray-500 mt-1">
                Por quantos dias o cliente pode usar o cupom. {/* Updated description */}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código do Cupom (Prefixo) * {/* Updated label text */}
              </label>
              <input
                type="text"
                required
                value={formData.codigo_prefixo}
                onChange={(e) => setFormData({...formData, codigo_prefixo: e.target.value.toUpperCase()})}
                className="neuro-input w-full p-3 text-gray-800"
                placeholder="BEMVINDO" /* Updated placeholder */
              />
              <p className="text-xs text-gray-500 mt-1">
                O sistema criará códigos únicos. Ex: BEMVINDO-123. {/* Added description */}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Compra Mínima (opcional)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.minimo_compra}
              onChange={(e) => setFormData({...formData, minimo_compra: e.target.value})}
              className="neuro-input w-full p-3 text-gray-800"
              placeholder="100.00" /* Updated placeholder */
            />
             <p className="text-xs text-gray-500 mt-1">
              Deixe em branco se não houver valor mínimo de compra. {/* Added description */}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Texto Personalizado do Cupom
            </label>
            <textarea
              value={formData.texto_cupom}
              onChange={(e) => setFormData({...formData, texto_cupom: e.target.value})}
              className="neuro-input w-full p-3 text-gray-800 h-20 resize-none"
              placeholder="Ex: Volte sempre!"
            />
            <p className="text-xs text-gray-500 mt-1">
              Este texto aparecerá para o cliente quando ele receber o cupom.
            </p>
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="neuro-button pressed flex-1 py-3 text-gray-800 font-medium disabled:opacity-50 flex items-center justify-center gap-2" /* Modified className */
            >
              <Save className="w-4 h-4"/> {/* Added Save icon */}
              {loading ? "Salvando..." : "Salvar Cupom"} /* Updated button text */
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
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
