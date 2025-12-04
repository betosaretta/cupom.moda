import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { User, Loja } from "@/entities/all";
import { 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Gift, 
  Target, 
  MessageSquare,
  RefreshCw,
  Mail,
  Calendar,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export default function Relatorios() {
  const [relatorios, setRelatorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentLoja, setCurrentLoja] = useState(null);
  const [expandedReport, setExpandedReport] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      if (user?.loja_id) {
        const [lojas, reports] = await Promise.all([
          Loja.filter({ id: user.loja_id }),
          base44.entities.RelatorioSemanal.filter({ loja_id: user.loja_id }, '-created_date', 10)
        ]);

        if (lojas.length > 0) setCurrentLoja(lojas[0]);
        setRelatorios(reports);
        
        if (reports.length > 0) {
          setExpandedReport(reports[0].id);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleGenerateReport = async (sendEmail = false) => {
    if (!currentUser?.loja_id) {
      alert("Você precisa ter uma loja cadastrada.");
      return;
    }

    setGenerating(true);
    try {
      const { data } = await base44.functions.invoke('generateWeeklyReport', {
        loja_id: currentUser.loja_id,
        send_email: sendEmail
      });

      if (data.success) {
        alert(sendEmail ? 'Relatório gerado e enviado por email!' : 'Relatório gerado com sucesso!');
        await loadData();
      } else {
        alert('Erro ao gerar relatório: ' + (data.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      alert("Erro ao gerar relatório. Tente novamente.");
    } finally {
      setGenerating(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const renderVariacao = (valor, suffix = '%') => {
    if (valor > 0) {
      return (
        <span className="flex items-center gap-1 text-green-600 text-sm">
          <TrendingUp className="w-4 h-4" />
          +{valor}{suffix}
        </span>
      );
    } else if (valor < 0) {
      return (
        <span className="flex items-center gap-1 text-red-600 text-sm">
          <TrendingDown className="w-4 h-4" />
          {valor}{suffix}
        </span>
      );
    }
    return <span className="text-gray-500 text-sm">→ 0{suffix}</span>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  if (!currentLoja) {
    return (
      <div className="neuro-card p-12 text-center">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Configure sua loja primeiro</h3>
        <p className="text-gray-600">Para ver relatórios, você precisa ter uma loja cadastrada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Relatórios Semanais</h1>
          <p className="text-gray-600">Acompanhe a evolução do seu negócio com insights de IA</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleGenerateReport(false)}
            disabled={generating}
            className="neuro-button px-5 py-3 text-gray-700 font-medium flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${generating ? 'animate-spin' : ''}`} />
            Gerar Relatório
          </button>
          <button
            onClick={() => handleGenerateReport(true)}
            disabled={generating}
            className="neuro-button pressed px-5 py-3 text-gray-800 font-medium flex items-center gap-2 disabled:opacity-50"
          >
            <Mail className="w-5 h-5" />
            Gerar e Enviar Email
          </button>
        </div>
      </div>

      {relatorios.length === 0 ? (
        <div className="neuro-card p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhum relatório ainda</h3>
          <p className="text-gray-600 mb-6">
            Gere seu primeiro relatório semanal para acompanhar o desempenho da sua loja.
          </p>
          <button
            onClick={() => handleGenerateReport(false)}
            disabled={generating}
            className="neuro-button pressed px-6 py-3 text-gray-800 font-medium"
          >
            Gerar Primeiro Relatório
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {relatorios.map((relatorio) => (
            <div key={relatorio.id} className="neuro-card overflow-hidden">
              {/* Header do Relatório */}
              <button
                onClick={() => setExpandedReport(expandedReport === relatorio.id ? null : relatorio.id)}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="neuro-button p-3">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-800">
                      Semana de {formatDate(relatorio.semana_inicio)} a {formatDate(relatorio.semana_fim)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {relatorio.metricas?.leads_capturados || 0} leads • NPS {relatorio.metricas?.nps_score || 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {relatorio.enviado_email && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Enviado
                    </span>
                  )}
                  {expandedReport === relatorio.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Conteúdo Expandido */}
              {expandedReport === relatorio.id && (
                <div className="border-t border-gray-100">
                  {/* Resumo IA */}
                  {relatorio.insights_ia?.resumo && (
                    <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-semibold text-indigo-900 mb-2">Resumo da Semana</h4>
                          <p className="text-indigo-800">{relatorio.insights_ia.resumo}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Métricas */}
                  <div className="p-6 border-b border-gray-100">
                    <h4 className="font-semibold text-gray-800 mb-4">📊 Métricas Principais</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="neuro-button p-4 text-center">
                        <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-800">
                          {relatorio.metricas?.leads_capturados || 0}
                        </div>
                        <div className="text-xs text-gray-600">Leads Capturados</div>
                        {renderVariacao(relatorio.comparacao_semana_anterior?.leads_variacao || 0)}
                      </div>

                      <div className="neuro-button p-4 text-center">
                        <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-800">
                          {relatorio.metricas?.nps_score || 0}
                        </div>
                        <div className="text-xs text-gray-600">NPS Score</div>
                        {renderVariacao(relatorio.comparacao_semana_anterior?.nps_variacao || 0, ' pts')}
                      </div>

                      <div className="neuro-button p-4 text-center">
                        <Gift className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-800">
                          {relatorio.metricas?.cupons_gerados || 0}
                        </div>
                        <div className="text-xs text-gray-600">Cupons Gerados</div>
                      </div>

                      <div className="neuro-button p-4 text-center">
                        <Target className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-800">
                          {relatorio.metricas?.taxa_conversao || 0}%
                        </div>
                        <div className="text-xs text-gray-600">Taxa Conversão</div>
                        {renderVariacao(relatorio.comparacao_semana_anterior?.conversao_variacao || 0)}
                      </div>
                    </div>
                  </div>

                  {/* Insights IA */}
                  <div className="p-6 grid md:grid-cols-3 gap-6 border-b border-gray-100">
                    {relatorio.insights_ia?.pontos_positivos?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" /> Pontos Positivos
                        </h4>
                        <ul className="space-y-2">
                          {relatorio.insights_ia.pontos_positivos.map((ponto, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="text-green-500 mt-1">•</span>
                              {ponto}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {relatorio.insights_ia?.pontos_atencao?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-yellow-700 mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5" /> Pontos de Atenção
                        </h4>
                        <ul className="space-y-2">
                          {relatorio.insights_ia.pontos_atencao.map((ponto, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="text-yellow-500 mt-1">•</span>
                              {ponto}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {relatorio.insights_ia?.recomendacoes?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-indigo-700 mb-3 flex items-center gap-2">
                          <Lightbulb className="w-5 h-5" /> Recomendações
                        </h4>
                        <ul className="space-y-2">
                          {relatorio.insights_ia.recomendacoes.map((rec, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="text-indigo-500 mt-1">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Comentários em Destaque */}
                  {relatorio.comentarios_destaque?.length > 0 && (
                    <div className="p-6">
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-gray-600" /> O que seus clientes disseram
                      </h4>
                      <div className="grid gap-3">
                        {relatorio.comentarios_destaque.map((comentario, idx) => (
                          <div 
                            key={idx} 
                            className={`p-4 rounded-lg border-l-4 ${
                              comentario.nota >= 9 ? 'bg-green-50 border-green-500' :
                              comentario.nota >= 7 ? 'bg-yellow-50 border-yellow-500' :
                              'bg-red-50 border-red-500'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-sm font-medium ${
                                comentario.nota >= 9 ? 'text-green-700' :
                                comentario.nota >= 7 ? 'text-yellow-700' :
                                'text-red-700'
                              }`}>
                                Nota: {comentario.nota}/10
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(comentario.data)}
                              </span>
                            </div>
                            <p className="text-gray-700 italic">"{comentario.comentario}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}