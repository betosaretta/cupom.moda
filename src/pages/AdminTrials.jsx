
import React, { useState, useEffect, useCallback } from 'react';
import { User, Pesquisa, Cupom, UserEngagementScore } from '@/entities/all';
import { Clock, Users, AlertTriangle, CheckCircle, MessageSquare, Moon, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';

import TrialStatusCard from '../components/admin/TrialStatusCard';
import TrialManagementModal from '../components/admin/TrialManagementModal';
import { sendTrialNotification } from '@/functions/sendTrialNotification';
import { analyzeUserEngagement } from '@/functions/analyzeUserEngagement';

export default function AdminTrials() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showManageModal, setShowManageModal] = useState(false);
  const [managingUser, setManagingUser] = useState(null);
  const [inactiveTrialUsers, setInactiveTrialUsers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    trialing: 0,
    expiringSoon: 0,
    expired: 0,
    active: 0,
    inactiveTrials: 0
  });
  const [engagementScores, setEngagementScores] = useState({});
  const [analyzingUser, setAnalyzingUser] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [usuariosData, pesquisasData, cuponsData] = await Promise.all([
        User.list("-created_date"),
        Pesquisa.list(),
        Cupom.list(),
      ]);
      setUsuarios(usuariosData);
      
      const today = new Date();
      let trialing = 0, expiringSoon = 0, expired = 0, active = 0, inactiveTrials = 0;
      const inactiveUsersList = [];

      for (const user of usuariosData) {
        if (user.subscription_status === 'active') {
          active++;
        } else if (user.subscription_status === 'trial') {
          trialing++;
          
          const hasPesquisas = pesquisasData.some(p => p.loja_id === user.loja_id);
          const hasCupons = cuponsData.some(c => c.loja_id === user.loja_id);

          if (!hasPesquisas && !hasCupons) {
            inactiveTrials++;
            inactiveUsersList.push(user);
          }

          if (user.trial_ends_at) {
            const endDate = new Date(user.trial_ends_at);
            const diffDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
            if (diffDays <= 0) expired++;
            else if (diffDays <= 3) expiringSoon++;
          }
        }
      }
      
      setStats({ total: usuariosData.length, trialing, expiringSoon, expired, active, inactiveTrials });
      setInactiveTrialUsers(inactiveUsersList);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  }, []);

  const loadEngagementScores = async () => {
    try {
      const scores = await UserEngagementScore.list();
      const scoresMap = {};
      scores.forEach(score => {
        scoresMap[score.user_id] = score;
      });
      setEngagementScores(scoresMap);
    } catch (error) {
      console.error("Erro ao carregar scores:", error);
    }
  };

  const checkAdminAndLoadData = useCallback(async () => {
    try {
      const user = await User.me();
      if (!user.app_role || !["super_admin"].includes(user.app_role) && user.email !== "robertosaretta@gmail.com") {
        window.location.href = '/Dashboard';
        return;
      }
      await loadData();
      await loadEngagementScores();
    } catch (error) {
      console.error("Erro de autenticação em AdminTrials:", error);
      await User.loginWithRedirect(window.location.href);
    } finally {
      setLoading(false);
    }
  }, [loadData]);

  useEffect(() => {
    checkAdminAndLoadData();
  }, [checkAdminAndLoadData]);

  const handleManageUser = (user) => {
    setManagingUser(user);
    setShowManageModal(true);
  };

  const handleSaveUser = async (userId, data) => {
    try {
      await User.update(userId, data);
      setShowManageModal(false);
      setManagingUser(null);
      await loadData();
      await loadEngagementScores(); // Reload engagement scores after user update
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      throw error;
    }
  };

  const sendNotificationToUser = async (user, type) => {
    try {
      if (!user.phone_number) {
        alert("Usuário não possui WhatsApp cadastrado.");
        return;
      }
      
      await sendTrialNotification({ 
        userId: user.id, 
        type: type,
        phoneNumber: user.phone_number 
      });
      
      const notifications = user.trial_notifications_sent || [];
      notifications.push({ date: new Date().toISOString(), type: type });
      
      await User.update(user.id, { trial_notifications_sent: notifications });
      await loadData();
      
      alert("Notificação (simulada) enviada com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar notificação:", error);
      alert("Erro ao enviar notificação.");
    }
  };

  const handleAnalyzeEngagement = async (user) => {
    setAnalyzingUser(user.id);
    try {
      await analyzeUserEngagement({ userId: user.id }); // Using `await` here
      await loadEngagementScores();
      alert('Análise concluída! Veja os insights abaixo.');
    } catch (error) {
      console.error('Erro ao analisar engajamento:', error);
      alert('Erro ao analisar engajamento do usuário.');
    } finally {
      setAnalyzingUser(null);
    }
  };

  const getRiscoIcon = (nivel) => {
    switch (nivel) {
      case 'baixo': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'medio': return <TrendingUp className="w-4 h-4 text-yellow-600" />;
      case 'alto': return <TrendingDown className="w-4 h-4 text-orange-600" />;
      case 'critico': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  const getRiscoColor = (nivel) => {
    switch (nivel) {
      case 'baixo': return 'bg-green-100 text-green-700';
      case 'medio': return 'bg-yellow-100 text-yellow-700';
      case 'alto': return 'bg-orange-100 text-orange-700';
      case 'critico': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };
  
  if (loading) {
    return <div className="text-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🤖 Assistente de Sucesso do Cliente com IA</h1>
        <p className="text-gray-600">Acompanhe e engaje usuários para convertê-los em clientes</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="neuro-card p-6 flex items-center gap-4">
          <div className="neuro-button p-3 text-blue-600"><Users/></div>
          <div><p className="text-sm text-gray-600">Total Usuários</p><p className="text-2xl font-bold">{stats.total}</p></div>
        </div>
        <div className="neuro-card p-6 flex items-center gap-4">
          <div className="neuro-button p-3 text-yellow-600"><Clock/></div>
          <div><p className="text-sm text-gray-600">Em Trial</p><p className="text-2xl font-bold">{stats.trialing}</p></div>
        </div>
        <div className="neuro-card p-6 flex items-center gap-4">
          <div className="neuro-button p-3 text-red-600"><AlertTriangle/></div>
          <div><p className="text-sm text-gray-600">Expirando</p><p className="text-2xl font-bold">{stats.expiringSoon}</p></div>
        </div>
        <div className="neuro-card p-6 flex items-center gap-4">
          <div className="neuro-button p-3 text-green-600"><CheckCircle/></div>
          <div><p className="text-sm text-gray-600">Assinantes</p><p className="text-2xl font-bold">{stats.active}</p></div>
        </div>
      </div>
      
      {inactiveTrialUsers.length > 0 && (
        <div className="neuro-card p-6">
          <h2 className="text-xl font-semibold text-orange-600 mb-4 flex items-center gap-2">
            <Moon className="w-5 h-5" />
            Usuários em Trial Precisando de Atenção ({inactiveTrialUsers.length})
          </h2>
          <p className="text-sm text-gray-600 mb-4">Estes usuários iniciaram o teste, mas ainda não criaram pesquisas ou cupons. Um bom momento para entrar em contato!</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inactiveTrialUsers.map(user => (
              <div key={user.id} className="relative">
                <TrialStatusCard user={user} onManage={handleManageUser} />
                <button
                  onClick={() => sendNotificationToUser(user, 'welcome_engagement')}
                  className="absolute top-2 right-2 neuro-button p-2 text-blue-600 hover:text-blue-800"
                  title="Enviar mensagem de engajamento"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Análise de Engajamento com IA
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {usuarios.map(user => {
            const engagement = engagementScores[user.id];
            
            return (
              <div key={user.id} className="neuro-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-800">{user.full_name}</h3>
                      {engagement && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getRiscoColor(engagement.nivel_risco)}`}>
                          {getRiscoIcon(engagement.nivel_risco)}
                          {engagement.nivel_risco.charAt(0).toUpperCase() + engagement.nivel_risco.slice(1)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  
                  <button
                    onClick={() => handleAnalyzeEngagement(user)}
                    disabled={analyzingUser === user.id}
                    className="neuro-button p-2 text-purple-600 hover:text-purple-800 disabled:opacity-50"
                    title="Analisar com IA"
                  >
                    {analyzingUser === user.id ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                    ) : (
                      <Sparkles className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {engagement && (
                  <div className="space-y-3">
                    {/* Score de engajamento */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">Score de Engajamento</span>
                        <span className="text-sm font-bold text-purple-600">{engagement.score_total}/100</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-500"
                          style={{ width: `${engagement.score_total}%` }}
                        />
                      </div>
                    </div>

                    {/* Métricas */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="neuro-card p-2 bg-blue-50">
                        <p className="text-xs text-blue-600">Pesquisas</p>
                        <p className="text-lg font-bold text-blue-700">{engagement.metricas?.pesquisas_criadas || 0}</p>
                      </div>
                      <div className="neuro-card p-2 bg-purple-50">
                        <p className="text-xs text-purple-600">Cupons</p>
                        <p className="text-lg font-bold text-purple-700">{engagement.metricas?.cupons_criados || 0}</p>
                      </div>
                      <div className="neuro-card p-2 bg-green-50">
                        <p className="text-xs text-green-600">Leads</p>
                        <p className="text-lg font-bold text-green-700">{engagement.metricas?.leads_capturados || 0}</p>
                      </div>
                    </div>

                    {/* Insights da IA */}
                    {engagement.insights_ia && (
                      <div className="neuro-card p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200">
                        <h4 className="font-semibold text-purple-800 text-sm mb-2 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Sugestão de Abordagem da IA
                        </h4>
                        
                        {engagement.insights_ia.problemas_identificados?.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs font-medium text-purple-700 mb-1">Problemas Identificados:</p>
                            <ul className="space-y-1">
                              {engagement.insights_ia.problemas_identificados.map((problema, idx) => (
                                <li key={idx} className="text-xs text-purple-600 flex items-start gap-1">
                                  <span className="text-purple-400">•</span>
                                  {problema}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {engagement.insights_ia.mensagem_sugerida && (
                          <div className="neuro-card p-3 bg-white">
                            <p className="text-xs font-medium text-gray-700 mb-1">📱 Mensagem Sugerida:</p>
                            <p className="text-sm text-gray-600 italic">"{engagement.insights_ia.mensagem_sugerida}"</p>
                          </div>
                        )}

                        {engagement.insights_ia.acoes_recomendadas?.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-medium text-purple-700 mb-1">Ações Recomendadas:</p>
                            <ul className="space-y-1">
                              {engagement.insights_ia.acoes_recomendadas.map((acao, idx) => (
                                <li key={idx} className="text-xs text-purple-600 flex items-start gap-1">
                                  <span className="text-purple-400">✓</span>
                                  {acao}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="mt-3 flex items-center justify-between">
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            engagement.insights_ia.prioridade_contato === 'urgente' ? 'bg-red-100 text-red-700' :
                            engagement.insights_ia.prioridade_contato === 'alta' ? 'bg-orange-100 text-orange-700' :
                            engagement.insights_ia.prioridade_contato === 'media' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            Prioridade: {engagement.insights_ia.prioridade_contato}
                          </span>
                          
                          <button
                            onClick={() => {
                              // Copiar mensagem sugerida para a área de transferência
                              navigator.clipboard.writeText(engagement.insights_ia.mensagem_sugerida);
                              alert('Mensagem copiada! Cole no WhatsApp do cliente.');
                            }}
                            className="neuro-button pressed px-3 py-1 text-xs font-medium text-purple-700"
                          >
                            Copiar Mensagem
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Visão Geral dos Usuários</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {usuarios.map(user => (
            <TrialStatusCard key={user.id} user={user} onManage={handleManageUser} />
          ))}
        </div>
      </div>

      {showManageModal && managingUser && (
        <TrialManagementModal user={managingUser} onClose={() => setShowManageModal(false)} onSave={handleSaveUser}/>
      )}
    </div>
  );
}
