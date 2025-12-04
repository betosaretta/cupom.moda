import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Target } from 'lucide-react';
import { Cupom } from '@/entities/all';

export default function CriarTesteABModal({ onClose, onSave, currentUser }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cupons, setCupons] = useState([]);
  
  const [formData, setFormData] = useState({
    titulo: '',
    tipo_campanha: 'promocional',
    segmento_alvo: {
      todos: true,
      promotores: false,
      detratores: false,
      inativos: false
    },
    cupom_vinculado: '',
    percentual_teste: 20,
    duracao_teste_horas: 24,
    metrica_decisao: 'taxa_abertura'
  });

  const [variantes, setVariantes] = useState([
    {
      letra: 'A',
      nome: 'Variante A',
      assunto: '',
      conteudo_html: '',
      call_to_action: ''
    },
    {
      letra: 'B',
      nome: 'Variante B',
      assunto: '',
      conteudo_html: '',
      call_to_action: ''
    }
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const cuponsData = await Cupom.filter({ loja_id: currentUser.loja_id, ativo: true });
      setCupons(cuponsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleAddVariante = () => {
    const letras = ['C', 'D', 'E', 'F'];
    const proximaLetra = letras[variantes.length - 2];
    
    if (!proximaLetra) {
      alert('Máximo de 4 variantes permitido');
      return;
    }

    setVariantes([
      ...variantes,
      {
        letra: proximaLetra,
        nome: `Variante ${proximaLetra}`,
        assunto: '',
        conteudo_html: '',
        call_to_action: ''
      }
    ]);
  };

  const handleRemoveVariante = (index) => {
    if (variantes.length <= 2) {
      alert('Teste A/B precisa de pelo menos 2 variantes');
      return;
    }
    setVariantes(variantes.filter((_, i) => i !== index));
  };

  const handleUpdateVariante = (index, field, value) => {
    const updated = [...variantes];
    updated[index][field] = value;
    setVariantes(updated);
  };

  const handleSubmit = () => {
    // Validar
    if (!formData.titulo) {
      alert('Preencha o título da campanha');
      return;
    }

    const variantesValidas = variantes.filter(v => v.assunto && v.conteudo_html);
    if (variantesValidas.length < 2) {
      alert('Configure pelo menos 2 variantes completas (assunto e conteúdo)');
      return;
    }

    const campanhaData = {
      ...formData,
      is_teste_ab: true,
      status: 'teste_ab_ativo',
      teste_ab_config: {
        percentual_teste: formData.percentual_teste,
        duracao_teste_horas: formData.duracao_teste_horas,
        metrica_decisao: formData.metrica_decisao,
        status_teste: 'aguardando',
        data_inicio_teste: new Date().toISOString()
      },
      // Usar primeira variante como conteúdo base
      assunto: variantes[0].assunto,
      conteudo_html: variantes[0].conteudo_html
    };

    onSave(campanhaData, variantes);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="neuro-card p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Criar Teste A/B</h2>
            <p className="text-gray-600">Teste diferentes versões e descubra o que funciona melhor</p>
          </div>
          <button onClick={onClose} className="neuro-button p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Configuração Básica */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="neuro-card p-6 bg-blue-50 border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <Target className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold text-blue-900">O que é Teste A/B?</h3>
              </div>
              <p className="text-sm text-blue-700">
                Teste A/B permite enviar diferentes versões do seu email para uma pequena parte 
                da sua audiência. O sistema analisa qual versão performa melhor e envia 
                automaticamente a vencedora para o restante dos destinatários.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título da Campanha *
              </label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                className="neuro-input w-full p-3"
                placeholder="Ex: Teste A/B Promoção Black Friday"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Campanha *
                </label>
                <select
                  value={formData.tipo_campanha}
                  onChange={(e) => setFormData({ ...formData, tipo_campanha: e.target.value })}
                  className="neuro-input w-full p-3"
                >
                  <option value="promocional">🎁 Promocional</option>
                  <option value="aniversario">🎂 Aniversário</option>
                  <option value="reengajamento">🔄 Reengajamento</option>
                  <option value="informativo">📰 Informativo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cupom Vinculado (opcional)
                </label>
                <select
                  value={formData.cupom_vinculado}
                  onChange={(e) => setFormData({ ...formData, cupom_vinculado: e.target.value })}
                  className="neuro-input w-full p-3"
                >
                  <option value="">Nenhum cupom</option>
                  {cupons.map(cupom => (
                    <option key={cupom.id} value={cupom.id}>
                      {cupom.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  % para Teste Inicial
                </label>
                <input
                  type="number"
                  min="10"
                  max="50"
                  value={formData.percentual_teste}
                  onChange={(e) => setFormData({ ...formData, percentual_teste: parseInt(e.target.value) })}
                  className="neuro-input w-full p-3"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recomendado: 20-30%
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duração do Teste (horas)
                </label>
                <input
                  type="number"
                  min="2"
                  max="72"
                  value={formData.duracao_teste_horas}
                  onChange={(e) => setFormData({ ...formData, duracao_teste_horas: parseInt(e.target.value) })}
                  className="neuro-input w-full p-3"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recomendado: 24h
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Métrica de Decisão
                </label>
                <select
                  value={formData.metrica_decisao}
                  onChange={(e) => setFormData({ ...formData, metrica_decisao: e.target.value })}
                  className="neuro-input w-full p-3"
                >
                  <option value="taxa_abertura">Taxa de Abertura</option>
                  <option value="taxa_cliques">Taxa de Cliques</option>
                  <option value="conversao">Conversão</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Segmento de Público
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'todos', label: 'Todos os clientes' },
                  { key: 'promotores', label: 'Promotores (NPS 9-10)' },
                  { key: 'detratores', label: 'Detratores (NPS 0-6)' },
                  { key: 'inativos', label: 'Clientes Inativos' }
                ].map(item => (
                  <label key={item.key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.segmento_alvo[item.key]}
                      onChange={(e) => setFormData({
                        ...formData,
                        segmento_alvo: {
                          ...formData.segmento_alvo,
                          [item.key]: e.target.checked
                        }
                      })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="neuro-button pressed px-6 py-3 text-gray-800 font-medium"
              >
                Próximo: Criar Variantes
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Variantes */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Configure suas Variantes</h3>
              <button
                onClick={handleAddVariante}
                disabled={variantes.length >= 4}
                className="neuro-button px-4 py-2 flex items-center gap-2 text-sm disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Adicionar Variante
              </button>
            </div>

            <div className="space-y-4">
              {variantes.map((variante, index) => (
                <div key={variante.letra} className="neuro-card p-6 border-2 border-purple-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="neuro-button px-4 py-2 font-bold text-purple-600">
                        {variante.letra}
                      </div>
                      <h4 className="font-semibold text-gray-800">{variante.nome}</h4>
                    </div>
                    {variantes.length > 2 && (
                      <button
                        onClick={() => handleRemoveVariante(index)}
                        className="neuro-button p-2 text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assunto do Email *
                      </label>
                      <input
                        type="text"
                        value={variante.assunto}
                        onChange={(e) => handleUpdateVariante(index, 'assunto', e.target.value)}
                        className="neuro-input w-full p-3"
                        placeholder="Digite o assunto desta variante"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Call-to-Action (CTA)
                      </label>
                      <input
                        type="text"
                        value={variante.call_to_action}
                        onChange={(e) => handleUpdateVariante(index, 'call_to_action', e.target.value)}
                        className="neuro-input w-full p-3"
                        placeholder="Ex: Compre Agora, Aproveite, Garanta o Seu"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Conteúdo HTML *
                      </label>
                      <textarea
                        value={variante.conteudo_html}
                        onChange={(e) => handleUpdateVariante(index, 'conteudo_html', e.target.value)}
                        className="neuro-input w-full p-3 h-32 resize-none font-mono text-sm"
                        placeholder="Cole o HTML do email aqui"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="neuro-card p-4 bg-yellow-50 border-2 border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>💡 Dica:</strong> Para um teste A/B eficaz, altere apenas UM elemento por vez 
                (assunto OU conteúdo OU CTA). Assim você saberá exatamente o que funcionou melhor.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="neuro-button px-6 py-3"
              >
                Voltar
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="neuro-button pressed flex-1 py-3 text-gray-800 font-medium"
              >
                {loading ? 'Criando...' : 'Criar Teste A/B'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}