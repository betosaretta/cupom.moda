import React, { useState, useEffect } from 'react';
import { X, Trophy, Sparkles, Send, BarChart3 } from 'lucide-react';
import { analyzeABTest } from '@/functions/analyzeABTest';
import { sendWinningVariant } from '@/functions/sendWinningVariant';

export default function ResultadoTesteABModal({ campanha, onClose, onRefresh }) {
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enviandoVencedora, setEnviandoVencedora] = useState(false);

  useEffect(() => {
    if (campanha.status === 'teste_ab_concluido') {
      loadResultado();
    } else {
      analisarTeste();
    }
  }, []);

  const loadResultado = async () => {
    // Buscar resultado existente
    setLoading(true);
    try {
      // Simular busca do resultado
      // Em produção, você buscaria da entidade EmailABTestResult
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar resultado:', error);
      setLoading(false);
    }
  };

  const analisarTeste = async () => {
    setLoading(true);
    try {
      const { data } = await analyzeABTest({ campanhaId: campanha.id });
      setResultado(data.resultado);
      await onRefresh();
    } catch (error) {
      console.error('Erro ao analisar teste:', error);
      alert('Erro ao analisar teste A/B.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarVencedora = async () => {
    if (!confirm('Deseja enviar a variante vencedora para o restante da audiência?')) {
      return;
    }

    setEnviandoVencedora(true);
    try {
      const { data } = await sendWinningVariant({ campanhaId: campanha.id });
      alert(`Variante ${data.resumo.variante_enviada} enviada para ${data.resumo.destinatarios} destinatários!`);
      await onRefresh();
      onClose();
    } catch (error) {
      console.error('Erro ao enviar variante:', error);
      alert('Erro ao enviar variante vencedora.');
    } finally {
      setEnviandoVencedora(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="neuro-card p-8 max-w-4xl w-full">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Analisando resultados do teste A/B...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!resultado) return null;

  const { vencedora, diferenca_percentual, confianca_estatistica, analise_ia, variantes_completo } = resultado;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="neuro-card p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Resultados do Teste A/B</h2>
            <p className="text-gray-600">{campanha.titulo}</p>
          </div>
          <button onClick={onClose} className="neuro-button p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vencedora */}
        <div className="neuro-card p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-yellow-600" />
            <div>
              <h3 className="text-xl font-bold text-yellow-900">Variante Vencedora: {vencedora.letra}</h3>
              <p className="text-yellow-700">Assunto: "{vencedora.assunto}"</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="neuro-card p-3 bg-white text-center">
              <p className="text-xs text-gray-600">Score</p>
              <p className="text-2xl font-bold text-yellow-600">{vencedora.score.toFixed(1)}</p>
            </div>
            <div className="neuro-card p-3 bg-white text-center">
              <p className="text-xs text-gray-600">Diferença</p>
              <p className="text-2xl font-bold text-green-600">+{diferenca_percentual}%</p>
            </div>
            <div className="neuro-card p-3 bg-white text-center">
              <p className="text-xs text-gray-600">Confiança</p>
              <p className="text-2xl font-bold text-blue-600">{confianca_estatistica.toFixed(0)}%</p>
            </div>
          </div>
        </div>

        {/* Comparação de Variantes */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Comparação de Performance
          </h4>
          <div className="space-y-3">
            {variantes_completo.map((variante, index) => (
              <div key={variante.id} className={`neuro-card p-4 ${index === 0 ? 'border-2 border-yellow-300' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`neuro-button px-3 py-1 font-bold ${index === 0 ? 'text-yellow-600' : 'text-gray-600'}`}>
                      {variante.letra_variante}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{variante.assunto}</p>
                      <p className="text-xs text-gray-500">
                        {variante.metricas?.enviados || 0} enviados
                      </p>
                    </div>
                  </div>
                  {index === 0 && (
                    <Trophy className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
                
                <div className="grid grid-cols-4 gap-3 mt-3">
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Score</p>
                    <p className="text-lg font-bold text-gray-800">{variante.score.toFixed(1)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Abertos</p>
                    <p className="text-lg font-bold text-blue-600">{variante.metricas?.abertos || 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Taxa Abertura</p>
                    <p className="text-lg font-bold text-green-600">{variante.taxaAbertura}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Taxa Cliques</p>
                    <p className="text-lg font-bold text-purple-600">{variante.taxaCliques}%</p>
                  </div>
                </div>

                {/* Barra de progresso comparativa */}
                <div className="mt-3">
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${index === 0 ? 'bg-yellow-500' : 'bg-gray-400'} transition-all duration-500`}
                      style={{ width: `${Math.min(100, variante.score)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Análise da IA */}
        {analise_ia && (
          <div className="space-y-4 mb-6">
            <div className="neuro-card p-6 bg-purple-50 border-2 border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Por que a Variante {vencedora.letra} Venceu?
              </h4>
              <p className="text-purple-800">{analise_ia.motivo_vitoria}</p>
            </div>

            {analise_ia.insights && analise_ia.insights.length > 0 && (
              <div className="neuro-card p-6 bg-blue-50">
                <h4 className="font-semibold text-blue-800 mb-3">💡 Insights Principais</h4>
                <ul className="space-y-2">
                  {analise_ia.insights.map((insight, idx) => (
                    <li key={idx} className="text-sm text-blue-700 flex items-start gap-2">
                      <span className="text-blue-500 font-bold">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analise_ia.recomendacoes && analise_ia.recomendacoes.length > 0 && (
              <div className="neuro-card p-6 bg-green-50">
                <h4 className="font-semibold text-green-800 mb-3">🎯 Recomendações</h4>
                <ul className="space-y-2">
                  {analise_ia.recomendacoes.map((rec, idx) => (
                    <li key={idx} className="text-sm text-green-700 flex items-start gap-2">
                      <span className="text-green-500 font-bold">→</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="neuro-button px-6 py-3"
          >
            Fechar
          </button>
          <button
            onClick={handleEnviarVencedora}
            disabled={enviandoVencedora || campanha.status === 'enviada'}
            className="neuro-button pressed flex-1 py-3 text-gray-800 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {enviandoVencedora ? (
              'Enviando...'
            ) : campanha.status === 'enviada' ? (
              'Já Enviada'
            ) : (
              <>
                <Send className="w-5 h-5" />
                Enviar Vencedora para Restante da Audiência
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}