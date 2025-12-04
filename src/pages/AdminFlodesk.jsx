import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Mail, Send, CheckCircle, AlertTriangle, RefreshCw, Plus, List, Zap, UserCheck, MailOpen, Workflow, Clock, ExternalLink, Info } from 'lucide-react';

export default function AdminFlodesk() {
  const [loading, setLoading] = useState(false);
  const [segments, setSegments] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [campaignsAvailable, setCampaignsAvailable] = useState(true);
  const [syncStatus, setSyncStatus] = useState(null);
  const [newSegmentName, setNewSegmentName] = useState('');
  const [showCreateSegment, setShowCreateSegment] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedLojistaSegment, setSelectedLojistaSegment] = useState('');
  const [subscriptionStatusFilter, setSubscriptionStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('sync');
  
  // Estados para campanhas
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    subject: '',
    body: '',
    segment_ids: [],
    from_name: 'Cupom.Moda'
  });

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  const checkAdminAndLoadData = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
      
      const adminEmails = ["robertosaretta@gmail.com"];
      const isAdmin = user.app_role === 'super_admin' || adminEmails.includes(user.email);
      
      if (!isAdmin) {
        window.location.href = '/Dashboard';
        return;
      }
      
      await loadInitialData();
    } catch (error) {
      console.error("Erro de autenticação:", error);
      window.location.href = '/Dashboard';
    }
  };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSegments(),
        loadCampaigns()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSegments = async () => {
    try {
      const { data } = await base44.functions.invoke('flodeskListSegments');
      if (data.success) {
        setSegments(data.segments || []);
        return data.segments;
      }
    } catch (error) {
      console.error('Erro ao carregar segmentos:', error);
      return [];
    }
  };

  const loadCampaigns = async () => {
    try {
      const { data } = await base44.functions.invoke('flodeskListCampaigns');
      if (data.success) {
        setCampaigns(data.campaigns || []);
        // Verificar se a API suporta campanhas
        if (data.message && data.message.includes('não disponível')) {
          setCampaignsAvailable(false);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar campanhas:', error);
      setCampaignsAvailable(false);
      setCampaigns([]);
    }
  };

  const handleCreateSegment = async () => {
    if (!newSegmentName.trim()) {
      alert('Digite um nome para o segmento');
      return;
    }

    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('flodeskCreateSegment', {
        name: newSegmentName
      });

      if (data.success) {
        alert('Segmento criado com sucesso!');
        setNewSegmentName('');
        setShowCreateSegment(false);
        await loadSegments();
      } else {
        alert('Erro ao criar segmento: ' + (data.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao criar segmento:', error);
      alert('Erro ao criar segmento: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncLojistas = async () => {
    const confirmSync = window.confirm(
      `Deseja sincronizar todos os lojistas com o Flodesk?\n\n` +
      `Isso enviará os emails e dados dos usuários da plataforma (lojistas) para o Flodesk.\n\n` +
      `Filtro: ${subscriptionStatusFilter === 'all' ? 'Todos os lojistas' : 
        subscriptionStatusFilter === 'active' ? 'Apenas ativos' : 
        subscriptionStatusFilter === 'trial' ? 'Apenas em trial' : subscriptionStatusFilter}`
    );

    if (!confirmSync) return;

    setLoading(true);
    setSyncStatus({ status: 'syncing', message: 'Sincronizando lojistas...' });

    try {
      const { data } = await base44.functions.invoke('flodeskSyncLojistas', {
        segment_id: selectedLojistaSegment || undefined,
        subscription_status_filter: subscriptionStatusFilter
      });

      if (data.success) {
        setSyncStatus({
          status: 'success',
          message: `Sincronização de lojistas concluída!`,
          results: data.results
        });
      } else {
        setSyncStatus({
          status: 'error',
          message: data.error || 'Erro na sincronização de lojistas'
        });
      }
    } catch (error) {
      console.error('Erro ao sincronizar lojistas:', error);
      setSyncStatus({
        status: 'error',
        message: 'Erro ao sincronizar lojistas: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    if (!newCampaign.subject || !newCampaign.body) {
      alert('Preencha o assunto e o corpo do email');
      return;
    }

    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('flodeskCreateCampaign', newCampaign);

      if (data.success) {
        alert('Campanha criada com sucesso!');
        setShowCreateCampaign(false);
        setNewCampaign({
          subject: '',
          body: '',
          segment_ids: [],
          from_name: 'Cupom.Moda'
        });
        await loadCampaigns();
      } else {
        // Mostrar sugestão se disponível
        const message = data.suggestion 
          ? `${data.error}\n\nSugestão: ${data.suggestion}`
          : data.error || 'Erro desconhecido';
        alert(message);
      }
    } catch (error) {
      console.error('Erro ao criar campanha:', error);
      alert('Erro ao criar campanha: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCampaign = async (emailId) => {
    const confirmSend = window.confirm('Deseja enviar esta campanha agora?');
    if (!confirmSend) return;

    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('flodeskSendCampaign', {
        email_id: emailId
      });

      if (data.success) {
        alert('Campanha enviada com sucesso!');
        await loadCampaigns();
      } else {
        alert('Erro ao enviar campanha: ' + (data.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao enviar campanha:', error);
      alert('Erro ao enviar campanha: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'sync', label: 'Sincronização', icon: RefreshCw },
    { id: 'campaigns', label: 'Campanhas', icon: MailOpen },
    { id: 'automations', label: 'Automações', icon: Workflow }
  ];

  if (loading && !syncStatus && campaigns.length === 0 && segments.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Integração Flodesk</h1>
        <p className="text-gray-600">Gerencie emails, campanhas e automações para seus lojistas</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`neuro-button px-4 py-3 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === tab.id ? 'pressed text-blue-600' : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="neuro-card p-6">
          <div className="flex items-center gap-3">
            <div className="neuro-button p-3">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Segmentos</p>
              <p className="text-2xl font-bold text-gray-800">{segments.length}</p>
            </div>
          </div>
        </div>

        <div className="neuro-card p-6">
          <div className="flex items-center gap-3">
            <div className="neuro-button p-3">
              <MailOpen className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Campanhas</p>
              <p className="text-2xl font-bold text-gray-800">
                {campaignsAvailable ? campaigns.length : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="neuro-card p-6">
          <div className="flex items-center gap-3">
            <div className="neuro-button p-3">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Status API</p>
              <p className="text-lg font-bold text-green-600">Conectado</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo das Abas */}
      {activeTab === 'sync' && (
        <div className="space-y-6">
          {/* Gerenciar Segmentos */}
          <div className="neuro-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <List className="w-5 h-5" />
                Segmentos no Flodesk
              </h2>
              <button
                onClick={() => setShowCreateSegment(!showCreateSegment)}
                className="neuro-button pressed px-4 py-2 text-gray-800 font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Novo Segmento
              </button>
            </div>

            {showCreateSegment && (
              <div className="neuro-card p-4 bg-blue-50 mb-4">
                <h3 className="font-semibold text-gray-800 mb-3">Criar Novo Segmento</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newSegmentName}
                    onChange={(e) => setNewSegmentName(e.target.value)}
                    placeholder="Nome do segmento (ex: Lojistas Ativos)"
                    className="neuro-input flex-1 p-3"
                  />
                  <button
                    onClick={handleCreateSegment}
                    disabled={loading}
                    className="neuro-button pressed px-6 py-2 text-gray-800 font-medium"
                  >
                    Criar
                  </button>
                  <button
                    onClick={() => setShowCreateSegment(false)}
                    className="neuro-button px-4 py-2 text-gray-600"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {segments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <List className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>Nenhum segmento encontrado</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {segments.map(segment => (
                  <div key={segment.id} className="neuro-button p-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: segment.color || '#6366f1' }}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{segment.name}</p>
                        <p className="text-sm text-gray-600">
                          {segment.total_active_subscribers || 0} subscribers
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sincronização de Lojistas */}
          <div className="neuro-card p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Sincronizar Lojistas com Flodesk
            </h2>

            <div className="neuro-card p-4 bg-purple-50 mb-6">
              <h4 className="font-semibold text-purple-900 mb-2">ℹ️ O que será sincronizado</h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Email e nome dos lojistas</li>
                <li>• Nome da loja associada</li>
                <li>• Status da assinatura</li>
                <li>• Setor e porte da loja</li>
              </ul>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por Status
                </label>
                <select
                  value={subscriptionStatusFilter}
                  onChange={(e) => setSubscriptionStatusFilter(e.target.value)}
                  className="neuro-input w-full p-3"
                >
                  <option value="all">Todos</option>
                  <option value="active">Ativos</option>
                  <option value="trial">Trial</option>
                  <option value="past_due">Pagamento Atrasado</option>
                  <option value="canceled">Cancelados</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Segmento (opcional)
                </label>
                <select
                  value={selectedLojistaSegment}
                  onChange={(e) => setSelectedLojistaSegment(e.target.value)}
                  className="neuro-input w-full p-3"
                >
                  <option value="">Sem segmento específico</option>
                  {segments.map(segment => (
                    <option key={segment.id} value={segment.id}>
                      {segment.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSyncLojistas}
                disabled={loading}
                className="neuro-button pressed w-full py-4 text-gray-800 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
                {loading ? 'Sincronizando...' : 'Sincronizar Lojistas'}
              </button>
            </div>
          </div>

          {/* Status da Sincronização */}
          {syncStatus && (
            <div className={`neuro-card p-4 ${
              syncStatus.status === 'success' ? 'bg-green-50 border-2 border-green-200' :
              syncStatus.status === 'error' ? 'bg-red-50 border-2 border-red-200' :
              'bg-blue-50 border-2 border-blue-200'
            }`}>
              <div className="flex items-start gap-3">
                {syncStatus.status === 'success' && <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />}
                {syncStatus.status === 'error' && <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />}
                {syncStatus.status === 'syncing' && (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 flex-shrink-0"></div>
                )}
                
                <div className="flex-1">
                  <p className={`font-semibold ${
                    syncStatus.status === 'success' ? 'text-green-800' :
                    syncStatus.status === 'error' ? 'text-red-800' :
                    'text-blue-800'
                  }`}>
                    {syncStatus.message}
                  </p>
                  
                  {syncStatus.results && (
                    <div className="mt-3 grid grid-cols-4 gap-4">
                      <div className="text-center p-2 bg-white rounded-lg">
                        <p className="text-2xl font-bold text-gray-800">{syncStatus.results.total}</p>
                        <p className="text-xs text-gray-600">Total</p>
                      </div>
                      <div className="text-center p-2 bg-white rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{syncStatus.results.success}</p>
                        <p className="text-xs text-gray-600">Sucesso</p>
                      </div>
                      <div className="text-center p-2 bg-white rounded-lg">
                        <p className="text-2xl font-bold text-red-600">{syncStatus.results.errors}</p>
                        <p className="text-xs text-gray-600">Erros</p>
                      </div>
                      <div className="text-center p-2 bg-white rounded-lg">
                        <p className="text-2xl font-bold text-yellow-600">{syncStatus.results.skipped || 0}</p>
                        <p className="text-xs text-gray-600">Ignorados</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          {!campaignsAvailable && (
            <div className="neuro-card p-6 bg-yellow-50 border-2 border-yellow-200">
              <div className="flex items-start gap-3">
                <Info className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-yellow-900 mb-2">Gerenciamento de Campanhas via Flodesk</h3>
                  <p className="text-yellow-800 text-sm mb-3">
                    O gerenciamento completo de campanhas de email está disponível diretamente na plataforma do Flodesk.
                  </p>
                  <a
                    href="https://app.flodesk.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="neuro-button pressed inline-flex items-center gap-2 px-4 py-2 text-yellow-900 font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Abrir Flodesk
                  </a>
                </div>
              </div>
            </div>
          )}

          <div className="neuro-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <MailOpen className="w-5 h-5" />
                Campanhas de Email
              </h2>
              {campaignsAvailable && (
                <button
                  onClick={() => setShowCreateCampaign(!showCreateCampaign)}
                  className="neuro-button pressed px-4 py-2 text-gray-800 font-medium flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Nova Campanha
                </button>
              )}
            </div>

            {showCreateCampaign && campaignsAvailable && (
              <div className="neuro-card p-6 bg-blue-50 mb-6">
                <h3 className="font-semibold text-gray-800 mb-4">Criar Nova Campanha</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assunto do Email *
                    </label>
                    <input
                      type="text"
                      value={newCampaign.subject}
                      onChange={(e) => setNewCampaign({...newCampaign, subject: e.target.value})}
                      placeholder="Ex: Novidades para sua loja!"
                      className="neuro-input w-full p-3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Remetente
                    </label>
                    <input
                      type="text"
                      value={newCampaign.from_name}
                      onChange={(e) => setNewCampaign({...newCampaign, from_name: e.target.value})}
                      className="neuro-input w-full p-3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Corpo do Email (HTML) *
                    </label>
                    <textarea
                      value={newCampaign.body}
                      onChange={(e) => setNewCampaign({...newCampaign, body: e.target.value})}
                      placeholder="Use HTML para formatar seu email..."
                      className="neuro-input w-full p-3 h-48 resize-none font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Segmentos (opcional)
                    </label>
                    <select
                      multiple
                      value={newCampaign.segment_ids}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, option => option.value);
                        setNewCampaign({...newCampaign, segment_ids: selected});
                      }}
                      className="neuro-input w-full p-3 h-32"
                    >
                      {segments.map(segment => (
                        <option key={segment.id} value={segment.id}>
                          {segment.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Ctrl/Cmd + clique para selecionar múltiplos
                    </p>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowCreateCampaign(false)}
                      className="neuro-button px-6 py-2 text-gray-600"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleCreateCampaign}
                      disabled={loading}
                      className="neuro-button pressed px-6 py-2 text-gray-800 font-medium"
                    >
                      Criar Campanha
                    </button>
                  </div>
                </div>
              </div>
            )}

            {campaigns.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MailOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {campaignsAvailable ? 'Nenhuma campanha criada' : 'Campanhas gerenciadas no Flodesk'}
                </h3>
                <p className="mb-4">
                  {campaignsAvailable 
                    ? 'Crie sua primeira campanha de email para seus lojistas'
                    : 'Use a plataforma do Flodesk para criar e gerenciar suas campanhas de email'
                  }
                </p>
                {!campaignsAvailable && (
                  <a
                    href="https://app.flodesk.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="neuro-button pressed inline-flex items-center gap-2 px-6 py-3 text-gray-800 font-medium"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Ir para Flodesk
                  </a>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="neuro-button p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-800">{campaign.name || campaign.subject}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Assunto: {campaign.subject}
                        </p>
                        {campaign.status && (
                          <span className={`inline-block mt-2 px-3 py-1 text-xs rounded-full ${
                            campaign.status === 'sent' ? 'bg-green-100 text-green-800' :
                            campaign.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {campaign.status}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSendCampaign(campaign.id)}
                          disabled={loading || campaign.status === 'sent'}
                          className="neuro-button p-2 text-blue-600 disabled:opacity-50"
                          title="Enviar campanha"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'automations' && (
        <div className="space-y-6">
          <div className="neuro-card p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Workflow className="w-5 h-5" />
              Automações de Email
            </h2>

            <div className="neuro-card p-6 bg-gradient-to-r from-purple-50 to-indigo-50 mb-6">
              <h3 className="font-semibold text-purple-900 mb-3">🤖 Automações Disponíveis</h3>
              <p className="text-purple-800 text-sm mb-4">
                Configure emails automáticos baseados em eventos do usuário
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email de Boas-Vindas */}
              <div className="neuro-card p-6 bg-green-50">
                <div className="flex items-start gap-3 mb-4">
                  <div className="neuro-button p-3">
                    <Mail className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">Email de Boas-Vindas</h4>
                    <p className="text-sm text-gray-600">Enviado após o registro</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>✓ Mensagem personalizada de boas-vindas</p>
                  <p>✓ Primeiros passos na plataforma</p>
                  <p>✓ Links úteis e recursos</p>
                </div>
                <span className="inline-block mt-4 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  Ativo
                </span>
              </div>

              {/* Trial Ending */}
              <div className="neuro-card p-6 bg-yellow-50">
                <div className="flex items-start gap-3 mb-4">
                  <div className="neuro-button p-3">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">Trial Acabando</h4>
                    <p className="text-sm text-gray-600">3 dias antes do fim</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>✓ Lembrete sobre fim do trial</p>
                  <p>✓ Benefícios da assinatura</p>
                  <p>✓ Call-to-action para assinar</p>
                </div>
                <span className="inline-block mt-4 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                  Ativo
                </span>
              </div>

              {/* Primeiro Lead */}
              <div className="neuro-card p-6 bg-blue-50">
                <div className="flex items-start gap-3 mb-4">
                  <div className="neuro-button p-3">
                    <UserCheck className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">Primeiro Lead Capturado</h4>
                    <p className="text-sm text-gray-600">Imediatamente após</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>✓ Parabenização pelo sucesso</p>
                  <p>✓ Dicas para converter o lead</p>
                  <p>✓ Próximos passos</p>
                </div>
                <span className="inline-block mt-4 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  Ativo
                </span>
              </div>

              {/* Inatividade */}
              <div className="neuro-card p-6 bg-red-50">
                <div className="flex items-start gap-3 mb-4">
                  <div className="neuro-button p-3">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">Inatividade</h4>
                    <p className="text-sm text-gray-600">7 dias sem login</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>✓ Incentivo para voltar</p>
                  <p>✓ Novidades e atualizações</p>
                  <p>✓ Oferta especial</p>
                </div>
                <span className="inline-block mt-4 px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">
                  Em Breve
                </span>
              </div>
            </div>

            <div className="neuro-card p-4 bg-blue-50 mt-6">
              <p className="text-sm text-blue-800">
                <strong>💡 Dica:</strong> As automações são gerenciadas através dos segmentos do Flodesk. 
                Quando um lojista é sincronizado, ele é automaticamente incluído nos fluxos apropriados.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}