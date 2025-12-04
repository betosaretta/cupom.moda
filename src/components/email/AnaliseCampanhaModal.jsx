import React, { useState, useEffect } from 'react';
import { X, Sparkles, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { analyzeEmailPerformance } from '@/functions/analyzeEmailPerformance';

export default function AnaliseCampanhaModal({ campanha, onClose, onRefresh }) {
  const [analise, setAnalise] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalise();
  }, []);

  const loadAnalise = async () => {
    setLoading(true);
    try {
      const { data } = await analyzeEmailPerformance({ campanhaId: campanha.id });
      setAnalise(data.analise);
      await onRefresh();
    } catch (error) {
      console.error('Erro ao carregar análise:', error);
      alert('Erro ao analisar campanha.');
    } finally {
      setLoading(false);
    }
  };

  const getAvaliacaoColor = (avaliacao) => {
    switch (avaliacao) {
      case 'excelente': return 'text-green-700 bg-green-100';
      case 'boa': return 'text-blue-700 bg-blue-100';
      case 'regular': return 'text-yellow-700 bg-yellow-100';
      case 'ruim': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getImpactoIcon = (impacto) => {
    switch (impacto) {
      case 'alto': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'medio': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'baixo': return <TrendingDown className="w-4 h-4 text-gray-600" />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="neuro-card p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Análise da Campanha com IA</h2>
            <p className="text-gray-600">{campanha.titulo}</p>
          </div>
          <button onClick={onClose} className="neuro-button p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Analisando campanha com IA...</p>
          </div>
        ) : analise && (
          <div className="space-y-6">
            {/* Score e Avaliação */}
            <div className="grid grid-cols-2 gap-6">
              <div className="neuro-card p-6 text-center">
                <p className="text-sm text-gray-600 mb-2">Score de Qualidade</p>
                <p className="text-5xl font-bold text-purple-600">{analise.score_qualidade}</p>
                <p className="text-xs text-gray-500 mt-1">de 100</p>
              </div>
              <div className="neuro-card p-6 text-center">
                <p className="text-sm text-gray-600 mb-2">Avaliação Geral</p>
                <span className={`inline-block px-4 py-2 rounded-full text-lg font-bold ${getAvaliacaoColor(analise.avaliacao_geral)}`}>
                  {analise.avaliacao_geral.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Resumo */}
            <div className="neuro-card p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200">
              <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Resumo da Análise
              </h3>
              <p className="text-purple-800">{analise.resumo}</p>
            </div>

            {/* Pontos Fortes */}
            {analise.pontos_fortes && analise.pontos_fortes.length > 0 && (
              <div className="neuro-card p-6 bg-green-50">
                <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Pontos Fortes
                </h3>
                <ul className="space-y-2">
                  {analise.pontos_fortes.map((ponto, idx) => (
                    <li key={idx} className="text-sm text-green-700 flex items-start gap-2">
                      <span className="text-green-500 font-bold">✓</span>
                      {ponto}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Áreas de Melhoria */}
            {analise.areas_melhoria && analise.areas_melhoria.length > 0 && (
              <div className="neuro-card p-6 bg-orange-50">
                <h3 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Áreas de Melhoria
                </h3>
                <ul className="space-y-2">
                  {analise.areas_melhoria.map((area, idx) => (
                    <li key={idx} className="text-sm text-orange-700 flex items-start gap-2">
                      <span className="text-orange-500 font-bold">⚠</span>
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recomendações */}
            {analise.recomendacoes && analise.recomendacoes.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-4">Recomendações Práticas</h3>
                <div className="space-y-3">
                  {analise.recomendacoes.map((rec, idx) => (
                    <div key={idx} className="neuro-card p-4 hover:shadow-lg transition-all">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getImpactoIcon(rec.impacto_esperado)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-gray-500 uppercase">{rec.categoria}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              rec.impacto_esperado === 'alto' ? 'bg-green-100 text-green-700' :
                              rec.impacto_esperado === 'medio' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              Impacto {rec.impacto_esperado}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{rec.recomendacao}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Próximos Testes */}
            {analise.proximos_testes && analise.proximos_testes.length > 0 && (
              <div className="neuro-card p-6 bg-blue-50">
                <h3 className="font-semibold text-blue-800 mb-3">🧪 Testes Sugeridos para Próxima Campanha</h3>
                <ul className="space-y-2">
                  {analise.proximos_testes.map((teste, idx) => (
                    <li key={idx} className="text-sm text-blue-700 flex items-start gap-2">
                      <span className="text-blue-500">→</span>
                      {teste}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Insights Adicionais */}
            {analise.insights && analise.insights.length > 0 && (
              <div className="neuro-card p-6 bg-purple-50">
                <h3 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Insights Adicionais
                </h3>
                <ul className="space-y-2">
                  {analise.insights.map((insight, idx) => (
                    <li key={idx} className="text-sm text-purple-700 flex items-start gap-2">
                      <span className="text-purple-500">💡</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}