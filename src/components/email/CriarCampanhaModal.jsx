import React, { useState, useEffect } from 'react';
import { X, Sparkles, Clock, Send, Wand2, TrendingUp as TrendingUpIcon, AlertTriangle } from 'lucide-react';
import { Cupom, Loja } from '@/entities/all';
import { generateEmailContent } from '@/functions/generateEmailContent';
import { suggestSendTime } from '@/functions/suggestSendTime';
import { generateCampaignVariations } from '@/functions/generateCampaignVariations';
import { predictCampaignPerformance } from '@/functions/predictCampaignPerformance';

export default function CriarCampanhaModal({ onClose, onSave, currentUser }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [cupons, setCupons] = useState([]);
  const [lojaData, setLojaData] = useState(null);
  const [sugestaoHorario, setSugestaoHorario] = useState(null);
  const [previsao, setPrevisao] = useState(null);
  const [loadingPrevisao, setLoadingPrevisao] = useState(false);
  
  const [formData, setFormData] = useState({
    titulo: '',
    tipo_campanha: 'promocional',
    segmento_alvo: {
      todos: true,
      promotores: false,
      detratores: false,
      inativos: false,
      aniversariantes: false
    },
    cupom_vinculado: '',
    objetivo: '',
    assunto: '',
    conteudo_html: '',
    data_agendamento: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const cuponsData = await Cupom.filter({ loja_id: currentUser.loja_id, ativo: true });
      const lojasData = await Loja.filter({ id: currentUser.loja_id });
      
      setCupons(cuponsData);
      if (lojasData && lojasData.length > 0) {
        setLojaData(lojasData[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleGerarConteudo = async () => {
    setLoading(true);
    try {
      const cupomSelecionado = cupons.find(c => c.id === formData.cupom_vinculado);
      
      const { data } = await generateEmailContent({
        tipo_campanha: formData.tipo_campanha,
        objetivo: formData.objetivo,
        cupom_info: cupomSelecionado,
        loja_info: lojaData
      });

      setFormData({
        ...formData,
        assunto: data.email.assunto,
        conteudo_html: data.email.conteudo_html
      });

      setStep(2);
    } catch (error) {
      console.error('Erro ao gerar conteúdo:', error);
      alert('Erro ao gerar conteúdo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGerarVariacoes = async () => {
    setLoading(true);
    try {
      const cupomSelecionado = cupons.find(c => c.id === formData.cupom_vinculado);
      
      const { data } = await generateCampaignVariations({
        tipo_campanha: formData.tipo_campanha,
        objetivo: formData.objetivo,
        cupom_info: cupomSelecionado,
        loja_info: lojaData,
        num_variantes: 4
      });

      if (confirm(`IA gerou ${data.variacoes.length} variações diferentes!\n\nRecomendação: ${data.recomendacao_teste}\n\nDeseja usar a primeira variação?`)) {
        const variacao = data.variacoes[0];
        setFormData({
          ...formData,
          assunto: variacao.assunto,
          conteudo_html: variacao.conteudo_html
        });
      }

      setStep(2);
    } catch (error) {
      console.error('Erro ao gerar variações:', error);
      alert('Erro ao gerar variações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreverPerformance = async () => {
    if (!formData.assunto || !formData.conteudo_html) {
      alert('Preencha o assunto e conteúdo antes de prever performance');
      return;
    }

    setLoadingPrevisao(true);
    try {
      const { data } = await predictCampaignPerformance({
        assunto: formData.assunto,
        conteudo_html: formData.conteudo_html,
        tipo_campanha: formData.tipo_campanha,
        segmento_alvo: formData.segmento_alvo
      });

      setPrevisao(data.previsao);
    } catch (error) {
      console.error('Erro ao prever performance:', error);
      alert('Erro ao prever performance. Tente novamente.');
    } finally {
      setLoadingPrevisao(false);
    }
  };

  const handleSugerirHorario = async () => {
    setLoading(true);
    try {
      const { data } = await suggestSendTime({
        tipo_campanha: formData.tipo_campanha,
        segmento_alvo: formData.segmento_alvo
      });

      setSugestaoHorario(data.sugestao);
    } catch (error) {
      console.error('Erro ao sugerir horário:', error);
      alert('Erro ao sugerir horário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!formData.titulo || !formData.assunto) {
      alert('Preencha os campos obrigatórios');
      return;
    }

    const campanhaData = {
      ...formData,
      horario_sugerido_ia: sugestaoHorario?.recomendacao_principal ? 
        `${sugestaoHorario.recomendacao_principal.dia_semana} às ${sugestaoHorario.recomendacao_principal.horario}` : 
        null,
      status: formData.data_agendamento ? 'agendada' : 'rascunho'
    };

    onSave(campanhaData);
  };

  const segmentoOptions = [
    { key: 'todos', label: 'Todos os clientes' },
    { key: 'promotores', label: 'Apenas Promotores (NPS 9-10)' },
    { key: 'detratores', label: 'Apenas Detratores (NPS 0-6)' },
    { key: 'inativos', label: 'Clientes Inativos' },
    { key: 'aniversariantes', label: 'Aniversariantes do Mês' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="neuro-card p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Nova Campanha de Email</h2>
            <p className="text-gray-600">Passo {step} de 3</p>
          </div>
          <button onClick={onClose} className="neuro-button p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= s ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {s}
              </div>
              {s < 3 && <div className={`w-20 h-1 ${step > s ? 'bg-purple-600' : 'bg-gray-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título da Campanha *
              </label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                className="neuro-input w-full p-3"
                placeholder="Ex: Promoção Black Friday"
              />
            </div>

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
                <option value="personalizado">✨ Personalizado</option>
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
                    {cupom.nome} - {cupom.tipo_desconto === 'percentual' ? `${cupom.valor_desconto}%` : `R$ ${cupom.valor_desconto}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Objetivo da Campanha
              </label>
              <textarea
                value={formData.objetivo}
                onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })}
                className="neuro-input w-full p-3 h-24 resize-none"
                placeholder="Ex: Aumentar vendas em 30%, reconquistar clientes inativos..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Segmento de Público
              </label>
              <div className="space-y-2">
                {segmentoOptions.map(item => (
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

            <div className="flex gap-3">
              <button
                onClick={handleGerarConteudo}
                disabled={loading || !formData.titulo}
                className="neuro-button flex-1 px-6 py-3 text-gray-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Gerando...' : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Gerar Conteúdo Simples
                  </>
                )}
              </button>
              
              <button
                onClick={handleGerarVariacoes}
                disabled={loading || !formData.titulo}
                className="neuro-button pressed flex-1 px-6 py-3 text-gray-800 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Gerando...' : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    Gerar 4 Variações IA
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assunto do Email *
              </label>
              <input
                type="text"
                value={formData.assunto}
                onChange={(e) => setFormData({ ...formData, assunto: e.target.value })}
                className="neuro-input w-full p-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conteúdo HTML
              </label>
              <textarea
                value={formData.conteudo_html}
                onChange={(e) => setFormData({ ...formData, conteudo_html: e.target.value })}
                className="neuro-input w-full p-3 h-64 resize-none font-mono text-sm"
              />
            </div>

            <div className="neuro-card p-4 bg-purple-50">
              <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Preview do Email
              </h4>
              <div 
                className="bg-white p-4 rounded border"
                dangerouslySetInnerHTML={{ __html: formData.conteudo_html }}
              />
            </div>

            <div className="neuro-card p-6 bg-yellow-50 border-2 border-yellow-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-yellow-900 flex items-center gap-2">
                    <TrendingUpIcon className="w-5 h-5" />
                    Previsão de Performance com IA
                  </h4>
                  <p className="text-sm text-yellow-700">
                    Veja como sua campanha deve performar antes de enviar
                  </p>
                </div>
                <button
                  onClick={handlePreverPerformance}
                  disabled={loadingPrevisao}
                  className="neuro-button pressed px-4 py-2 text-gray-800 font-medium"
                >
                  {loadingPrevisao ? 'Analisando...' : 'Prever Performance'}
                </button>
              </div>

              {previsao && (
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="neuro-card p-4 bg-white">
                      <p className="text-xs text-gray-600 mb-1">Taxa de Abertura Prevista</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {previsao.taxa_abertura.estimativa.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-500">
                        Range: {previsao.taxa_abertura.range_min}-{previsao.taxa_abertura.range_max}%
                      </p>
                      <div className="mt-2 w-full h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${previsao.taxa_abertura.confianca}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Confiança: {previsao.taxa_abertura.confianca}%
                      </p>
                    </div>

                    <div className="neuro-card p-4 bg-white">
                      <p className="text-xs text-gray-600 mb-1">Taxa de Cliques Prevista</p>
                      <p className="text-2xl font-bold text-green-600">
                        {previsao.taxa_cliques.estimativa.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-500">
                        Range: {previsao.taxa_cliques.range_min}-{previsao.taxa_cliques.range_max}%
                      </p>
                      <div className="mt-2 w-full h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${previsao.taxa_cliques.confianca}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Confiança: {previsao.taxa_cliques.confianca}%
                      </p>
                    </div>
                  </div>

                  <div className="neuro-card p-4 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-gray-800">Score Geral da Campanha</p>
                      <p className="text-3xl font-bold text-purple-600">{previsao.score_geral}/100</p>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full transition-all duration-500"
                        style={{ width: `${previsao.score_geral}%` }}
                      />
                    </div>
                  </div>

                  {previsao.probabilidade_sucesso && (
                    <div className={`neuro-card p-4 border-2 ${
                      previsao.probabilidade_sucesso === 'alta' ? 'bg-green-50 border-green-200' :
                      previsao.probabilidade_sucesso === 'media' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {previsao.probabilidade_sucesso === 'baixa' && (
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        )}
                        <p className="font-semibold">
                          Probabilidade de Sucesso: <span className="uppercase">{previsao.probabilidade_sucesso}</span>
                        </p>
                      </div>
                      <p className="text-sm">{previsao.comparacao_historico}</p>
                      
                      {previsao.recomendacao_envio === 'otimizar_antes' && (
                        <div className="mt-3 p-3 bg-white rounded-lg">
                          <p className="text-sm font-semibold text-orange-800 mb-2">⚠️ Recomendação: Otimizar Antes de Enviar</p>
                          {previsao.otimizacoes_sugeridas && previsao.otimizacoes_sugeridas.length > 0 && (
                            <ul className="space-y-1">
                              {previsao.otimizacoes_sugeridas.slice(0, 3).map((opt, idx) => (
                                <li key={idx} className="text-sm text-gray-700">
                                  • {opt.sugestao} <span className="text-green-600">({opt.impacto_estimado})</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="neuro-button px-6 py-3"
              >
                Voltar
              </button>
              <button
                onClick={() => setStep(3)}
                className="neuro-button pressed flex-1 py-3 text-gray-800 font-medium"
              >
                Próximo: Agendamento
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="neuro-card p-6 bg-blue-50">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold text-blue-800 text-lg">Quando Enviar?</h3>
              </div>
              
              {!sugestaoHorario ? (
                <button
                  onClick={handleSugerirHorario}
                  disabled={loading}
                  className="neuro-button pressed px-6 py-3 text-gray-800 font-medium flex items-center gap-2"
                >
                  {loading ? 'Analisando...' : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Sugerir Melhor Horário com IA
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="neuro-card p-4 bg-white border-2 border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">📅 Recomendação Principal</h4>
                    <p className="text-lg font-bold text-blue-600">
                      {sugestaoHorario.recomendacao_principal.dia_semana} às {sugestaoHorario.recomendacao_principal.horario}
                    </p>
                    <p className="text-sm text-blue-700 mt-2">
                      {sugestaoHorario.recomendacao_principal.motivo}
                    </p>
                  </div>

                  {sugestaoHorario.insights && sugestaoHorario.insights.length > 0 && (
                    <div className="neuro-card p-4 bg-white">
                      <h4 className="font-semibold text-gray-800 mb-2">💡 Insights da IA</h4>
                      <ul className="space-y-1">
                        {sugestaoHorario.insights.map((insight, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-blue-500">•</span>
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agendar Envio (opcional)
              </label>
              <input
                type="datetime-local"
                value={formData.data_agendamento}
                onChange={(e) => setFormData({ ...formData, data_agendamento: e.target.value })}
                className="neuro-input w-full p-3"
              />
              <p className="text-xs text-gray-500 mt-1">
                Deixe em branco para salvar como rascunho
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep(2)}
                className="neuro-button px-6 py-3"
              >
                Voltar
              </button>
              <button
                onClick={handleSubmit}
                className="neuro-button pressed flex-1 py-3 text-gray-800 font-medium flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                {formData.data_agendamento ? 'Agendar Campanha' : 'Salvar como Rascunho'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}