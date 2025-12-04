
import React, { useState, useEffect } from 'react';
import { User, EmailCampanha, EmailCampanhaVariante } from '@/entities/all';
import { Mail, Plus, Send, TrendingUp, Sparkles, Calendar, BarChart3, FlaskConical, Brain, Lightbulb, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import CriarCampanhaModal from '../components/email/CriarCampanhaModal';
import AnaliseCampanhaModal from '../components/email/AnaliseCampanhaModal';
import CriarTesteABModal from '../components/email/CriarTesteABModal';
import ResultadoTesteABModal from '../components/email/ResultadoTesteABModal';
import { deepAnalyzeCampaigns } from '@/functions/deepAnalyzeCampaigns'; // Corrected import path

export default function EmailMarketing() {
  const [campanhas, setCampanhas] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAnaliseModal, setShowAnaliseModal] = useState(false);
  const [campanhaParaAnalisar, setCampanhaParaAnalisar] = useState(null);
  const [showCreateABTestModal, setShowCreateABTestModal] = useState(false);
  const [showABResultModal, setShowABResultModal] = useState(false);
  const [campanhaABParaAnalisar, setCampanhaABParaAnalisar] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    enviadas: 0,
    agendadas: 0,
    rascunhos: 0,
    media_abertura: 0,
    media_cliques: 0
  });

  const [showDeepInsights, setShowDeepInsights] = useState(false);
  const [deepInsights, setDeepInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      if (user && user.loja_id) {
        const [campanhasData] = await Promise.all([
          EmailCampanha.filter({ loja_id: user.loja_id }, '-created_date')
        ]);

        setCampanhas(campanhasData);

        // Calcular estatísticas
        const enviadas = campanhasData.filter(c => c.status === 'enviada' || c.status === 'teste_ab_concluido');
        const mediaAbertura = enviadas.reduce((acc, c) => 
          acc + (c.metricas?.taxa_abertura || 0), 0) / (enviadas.length || 1);
        const mediaCliques = enviadas.reduce((acc, c) => 
          acc + (c.metricas?.taxa_cliques || 0), 0) / (enviadas.length || 1);

        setStats({
          total: campanhasData.length,
          enviadas: enviadas.length,
          agendadas: campanhasData.filter(c => c.status === 'agendada' || c.status === 'teste_ab_ativo').length,
          rascunhos: campanhasData.filter(c => c.status === 'rascunho').length,
          media_abertura: mediaAbertura.toFixed(1),
          media_cliques: mediaCliques.toFixed(1)
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCriarCampanha = async (campanhaData) => {
    try {
      await EmailCampanha.create({
        ...campanhaData,
        loja_id: currentUser.loja_id
      });
      setShowCreateModal(false);
      await loadData();
      alert('Campanha criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar campanha:', error);
      alert('Erro ao criar campanha. Tente novamente.');
    }
  };

  const handleCriarTesteAB = async (campanhaData, variantes) => {
    try {
      // Criar campanha principal
      const novaCampanha = await EmailCampanha.create({
        ...campanhaData,
        loja_id: currentUser.loja_id,
        is_teste_ab: true,
        status: 'rascunho' // Or 'agendada' if scheduling is part of AB test creation
      });

      // Criar variantes
      await Promise.all(
        variantes.map(variante =>
          EmailCampanhaVariante.create({
            ...variante,
            campanha_id: novaCampanha.id
          })
        )
      );

      setShowCreateABTestModal(false);
      await loadData();
      alert('Teste A/B criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar teste A/B:', error);
      alert('Erro ao criar teste A/B. Tente novamente.');
    }
  };

  const handleAnalisarCampanha = (campanha) => {
    setCampanhaParaAnalisar(campanha);
    setShowAnaliseModal(true);
  };

  const handleVerResultadoAB = (campanha) => {
    setCampanhaABParaAnalisar(campanha);
    setShowABResultModal(true);
  };

  const handleDeepAnalysis = async () => {
    setLoadingInsights(true);
    try {
      const { data } = await deepAnalyzeCampaigns({});
      setDeepInsights(data.analise);
      setShowDeepInsights(true);
    } catch (error) {
      console.error('Erro na análise profunda:', error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Erro ao realizar análise profunda. Tente novamente.');
      }
    } finally {
      setLoadingInsights(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'enviada': return 'bg-green-100 text-green-700';
      case 'agendada': return 'bg-blue-100 text-blue-700';
      case 'rascunho': return 'bg-gray-100 text-gray-700';
      case 'cancelada': return 'bg-red-100 text-red-700';
      case 'teste_ab_ativo': return 'bg-purple-100 text-purple-700';
      case 'teste_ab_concluido': return 'bg-indigo-100 text-indigo-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'enviada': return 'Enviada';
      case 'agendada': return 'Agendada';
      case 'rascunho': return 'Rascunho';
      case 'cancelada': return 'Cancelada';
      case 'teste_ab_ativo': return 'Teste A/B Ativo';
      case 'teste_ab_concluido': return 'Teste A/B Concluído';
      default: return status;
    }
  };

  const getTipoCampanhaLabel = (tipo) => {
    switch (tipo) {
      case 'promocional': return '🎁 Promocional';
      case 'informativo': return '📰 Informativo';
      case 'aniversario': return '🎂 Aniversário';
      case 'reengajamento': return '🔄 Reengajamento';
      case 'personalizado': return '✨ Personalizado';
      default: return tipo;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-xl text-gray-700">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">📧 Email Marketing com IA</h1>
          <p className="text-gray-600">Crie campanhas personalizadas e otimizadas com inteligência artificial</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDeepAnalysis}
            disabled={loadingInsights || stats.enviadas === 0}
            className="neuro-button px-6 py-3 flex items-center gap-2 text-indigo-700 font-medium disabled:opacity-50"
            title={stats.enviadas === 0 ? 'Envie pelo menos 1 campanha para análise profunda.' : ''}
          >
            {loadingInsights ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
            ) : (
              <Brain className="w-5 h-5" />
            )}
            Análise Profunda IA
          </button>
          <button
            onClick={() => setShowCreateABTestModal(true)}
            className="neuro-button px-6 py-3 flex items-center gap-2 text-purple-700 font-medium"
          >
            <FlaskConical className="w-5 h-5" />
            Criar Teste A/B
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="neuro-button pressed px-6 py-3 flex items-center gap-2 text-gray-800 font-medium"
          >
            <Plus className="w-5 h-5" />
            Nova Campanha
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="neuro-card p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total de Campanhas</h3>
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
        </div>

        <div className="neuro-card p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Campanhas Enviadas</h3>
            <Send className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.enviadas}</p>
        </div>

        <div className="neuro-card p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Taxa Média Abertura</h3>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.media_abertura}%</p>
        </div>

        <div className="neuro-card p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Taxa Média Cliques</h3>
            <BarChart3 className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.media_cliques}%</p>
        </div>
      </div>

      {/* Banner com IA */}
      <div className="neuro-card p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200">
        <div className="flex items-center gap-4">
          <div className="neuro-button p-3">
            <Sparkles className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-purple-900 text-lg mb-1">Powered by AI 🤖</h3>
            <p className="text-purple-700 text-sm">
              Nossa IA cria emails personalizados, sugere melhores horários de envio e analisa performance automaticamente
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Campanhas */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Suas Campanhas</h2>
        
        {campanhas.length === 0 ? (
          <div className="text-center py-16">
            <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhuma campanha criada</h3>
            <p className="text-gray-600 mb-6">
              Comece criando sua primeira campanha de email marketing com IA
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="neuro-button pressed px-6 py-3 text-gray-800 font-medium inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Criar Primeira Campanha
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {campanhas.map(campanha => (
              <div key={campanha.id} className={`neuro-card p-6 hover:shadow-lg transition-all ${
                campanha.is_teste_ab ? 'border-2 border-purple-300' : ''
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {campanha.is_teste_ab && (
                        <FlaskConical className="w-5 h-5 text-purple-600" />
                      )}
                      <h3 className="text-lg font-semibold text-gray-800">{campanha.titulo}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campanha.status)}`}>
                        {getStatusLabel(campanha.status)}
                      </span>
                      <span className="text-sm text-gray-600">
                        {getTipoCampanhaLabel(campanha.tipo_campanha)}
                      </span>
                    </div>
                    
                    {campanha.is_teste_ab && (
                      <div className="mb-2 flex items-center gap-2">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                          Teste A/B
                        </span>
                        {campanha.teste_ab_config?.status_teste && (
                          <span className="text-xs text-gray-600">
                            Status: {campanha.teste_ab_config.status_teste}
                          </span>
                        )}
                      </div>
                    )}
                    
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Assunto:</strong> {campanha.assunto}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Criada em {format(new Date(campanha.created_date), 'dd/MM/yy', { locale: ptBR })}</span>
                      {campanha.data_agendamento && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Agendada: {format(new Date(campanha.data_agendamento), 'dd/MM/yy HH:mm', { locale: ptBR })}
                        </span>
                      )}
                      {campanha.horario_sugerido_ia && (
                        <span className="flex items-center gap-1 text-purple-600">
                          <Sparkles className="w-3 h-3" />
                          Sugestão IA: {campanha.horario_sugerido_ia}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Métricas */}
                {(campanha.status === 'enviada' || campanha.status === 'teste_ab_concluido') && campanha.metricas && (
                  <div className="grid grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Enviados</p>
                      <p className="text-lg font-bold text-gray-800">{campanha.metricas.total_enviados || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Abertos</p>
                      <p className="text-lg font-bold text-blue-600">{campanha.metricas.total_abertos || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Taxa Abertura</p>
                      <p className="text-lg font-bold text-green-600">{campanha.metricas.taxa_abertura || 0}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Taxa Cliques</p>
                      <p className="text-lg font-bold text-purple-600">{campanha.metricas.taxa_cliques || 0}%</p>
                    </div>
                  </div>
                )}

                {/* Análise IA */}
                {campanha.analise_ia && (
                  <div className="neuro-card p-4 bg-purple-50 border-2 border-purple-200 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-semibold text-purple-800">Análise da IA</span>
                      <span className="ml-auto px-2 py-1 bg-purple-200 text-purple-800 rounded-full text-xs font-bold">
                        Score: {campanha.analise_ia.score_qualidade}/100
                      </span>
                    </div>
                    <p className="text-sm text-purple-700">{campanha.analise_ia.previsao_desempenho}</p>
                  </div>
                )}

                {/* Ações */}
                <div className="flex gap-2">
                  {campanha.is_teste_ab && ['teste_ab_ativo', 'teste_ab_concluido'].includes(campanha.status) && (
                    <button
                      onClick={() => handleVerResultadoAB(campanha)}
                      className="neuro-button px-4 py-2 text-sm font-medium flex items-center gap-2 text-purple-700"
                    >
                      <FlaskConical className="w-4 h-4" />
                      {campanha.status === 'teste_ab_concluido' ? 'Ver Resultados' : 'Analisar Teste'}
                    </button>
                  )}
                  {campanha.status === 'enviada' && !campanha.is_teste_ab && (
                    <button
                      onClick={() => handleAnalisarCampanha(campanha)}
                      className="neuro-button px-4 py-2 text-sm font-medium flex items-center gap-2 text-purple-700"
                    >
                      <Sparkles className="w-4 h-4" />
                      Analisar com IA
                    </button>
                  )}
                  {campanha.status === 'rascunho' && !campanha.is_teste_ab && (
                    <>
                      <button className="neuro-button px-4 py-2 text-sm font-medium">
                        Editar
                      </button>
                      <button className="neuro-button pressed px-4 py-2 text-sm font-medium text-gray-800">
                        <Send className="w-4 h-4 mr-1" />
                        Enviar
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Deep Insights Modal */}
      {showDeepInsights && deepInsights && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="neuro-card p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Brain className="w-7 h-7 text-indigo-600" />
                  Análise Estratégica Profunda com IA
                </h2>
                <p className="text-gray-600">Insights acionáveis baseados em todos os seus dados</p>
              </div>
              <button onClick={() => setShowDeepInsights(false)} className="neuro-button p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score de Saúde */}
            <div className="neuro-card p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-indigo-900">Score de Saúde do Email Marketing</h3>
                  <p className="text-sm text-indigo-700">{deepInsights.resumo_executivo}</p>
                </div>
                <div className="text-center">
                  <p className="text-5xl font-bold text-indigo-600">{deepInsights.score_saude_email_marketing}</p>
                  <p className="text-sm text-indigo-700">de 100</p>
                </div>
              </div>
              <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-1000"
                  style={{ width: `${deepInsights.score_saude_email_marketing}%` }}
                />
              </div>
            </div>

            {/* Padrões Descobertos */}
            {deepInsights.padroes_descobertos && deepInsights.padroes_descobertos.length > 0 && (
              <div className="neuro-card p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Padrões Descobertos nos Seus Dados
                </h3>
                <div className="space-y-4">
                  {deepInsights.padroes_descobertos.map((padrao, idx) => (
                    <div key={idx} className="neuro-card p-4 border-l-4 border-yellow-400">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-800">{padrao.padrao}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          padrao.impacto_potencial === 'alto' ? 'bg-green-100 text-green-700' :
                          padrao.impacto_potencial === 'medio' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          Impacto {padrao.impacto_potencial}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">📊 <strong>Evidência:</strong> {padrao.evidencia}</p>
                      <p className="text-sm text-indigo-700">✅ <strong>Ação:</strong> {padrao.acao_recomendada}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Otimizações Concretas */}
            {deepInsights.otimizacoes_concretas && deepInsights.otimizacoes_concretas.length > 0 && (
              <div className="neuro-card p-6 mb-6 bg-green-50">
                <h3 className="text-lg font-semibold text-green-900 mb-4">🎯 Otimizações Concretas</h3>
                <div className="space-y-4">
                  {deepInsights.otimizacoes_concretas.map((opt, idx) => (
                    <div key={idx} className="neuro-card p-4 bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium uppercase">
                          {opt.area}
                        </span>
                        <span className="text-green-600 font-semibold text-sm">{opt.ganho_estimado}</span>
                      </div>
                      <p className="text-sm text-red-700 mb-2">❌ <strong>Problema:</strong> {opt.problema_identificado}</p>
                      <p className="text-sm text-green-700 mb-2">✅ <strong>Solução:</strong> {opt.solucao_especifica}</p>
                      <details className="mt-2">
                        <summary className="text-sm font-medium text-gray-700 cursor-pointer">Como implementar</summary>
                        <p className="text-sm text-gray-600 mt-2 pl-4">{opt.como_implementar}</p>
                      </details>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Estratégia 90 Dias */}
            {deepInsights.estrategia_90_dias && (
              <div className="neuro-card p-6 mb-6 bg-blue-50">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">📅 Plano Estratégico para 90 Dias</h3>
                <div className="mb-4">
                  <p className="text-blue-800 font-semibold mb-2">🎯 Objetivo Principal:</p>
                  <p className="text-blue-700">{deepInsights.estrategia_90_dias.objetivo_principal}</p>
                </div>
                <div className="mb-4">
                  <p className="text-blue-800 font-semibold mb-2">📊 KPIs a Acompanhar:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {deepInsights.estrategia_90_dias.kpis.map((kpi, idx) => (
                      <li key={idx} className="text-sm text-blue-700">{kpi}</li>
                    ))}
                  </ul>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(deepInsights.estrategia_90_dias.acoes_mensais).map(([mes, acoes]) => (
                    <div key={mes} className="neuro-card p-4 bg-white">
                      <h4 className="font-semibold text-blue-800 mb-2">{mes.replace('mes_', 'Mês ')}</h4>
                      <ul className="space-y-1">
                        {acoes.map((acao, idx) => (
                          <li key={idx} className="text-xs text-gray-700 flex items-start gap-1">
                            <span className="text-blue-500">•</span>
                            {acao}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Previsões */}
            {deepInsights.previsoes_proximos_meses && (
              <div className="grid grid-cols-2 gap-6">
                <div className="neuro-card p-6 bg-purple-50">
                  <h3 className="text-lg font-semibold text-purple-900 mb-4">🔮 Previsões</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-purple-700 mb-1">Tendência:</p>
                      <p className="text-xl font-bold text-purple-800 capitalize">{deepInsights.previsoes_proximos_meses.tendencia}</p>
                    </div>
                    <div>
                      <p className="text-sm text-purple-700 mb-1">Taxa Abertura Prevista:</p>
                      <p className="text-lg font-semibold text-purple-800">{deepInsights.previsoes_proximos_meses.taxa_abertura_prevista}</p>
                    </div>
                    <div>
                      <p className="text-sm text-purple-700 mb-1">Taxa Cliques Prevista:</p>
                      <p className="text-lg font-semibold text-purple-800">{deepInsights.previsoes_proximos_meses.taxa_cliques_prevista}</p>
                    </div>
                  </div>
                </div>

                <div className="neuro-card p-6 bg-orange-50">
                  <h3 className="text-lg font-semibold text-orange-900 mb-4">⚡ Comparação com Mercado</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-orange-700 mb-1">Sua Posição:</p>
                      <p className="text-xl font-bold text-orange-800 capitalize">
                        {deepInsights.comparacao_mercado.posicao.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-orange-700 mb-1">Gap para o Líder:</p>
                      <p className="text-lg font-semibold text-orange-800">{deepInsights.comparacao_mercado.gap_lider}</p>
                    </div>
                    <div className="mt-3 p-3 bg-white rounded-lg">
                      <p className="text-sm text-orange-800">{deepInsights.comparacao_mercado.o_que_fazer_para_chegar_la}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CriarCampanhaModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCriarCampanha}
          currentUser={currentUser}
        />
      )}

      {showCreateABTestModal && (
        <CriarTesteABModal
          onClose={() => setShowCreateABTestModal(false)}
          onSave={handleCriarTesteAB}
          currentUser={currentUser}
        />
      )}

      {showAnaliseModal && campanhaParaAnalisar && (
        <AnaliseCampanhaModal
          campanha={campanhaParaAnalisar}
          onClose={() => {
            setShowAnaliseModal(false);
            setCampanhaParaAnalisar(null);
          }}
          onRefresh={loadData}
        />
      )}

      {showABResultModal && campanhaABParaAnalisar && (
        <ResultadoTesteABModal
          campanha={campanhaABParaAnalisar}
          onClose={() => {
            setShowABResultModal(false);
            setCampanhaABParaAnalisar(null);
          }}
          onRefresh={loadData}
        />
      )}
    </div>
  );
}
