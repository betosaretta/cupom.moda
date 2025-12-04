import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Search, DollarSign, ExternalLink, 
  Users, AlertTriangle, Clock, CheckCircle, XCircle,
  RefreshCw, Eye
} from 'lucide-react';

export default function AdminAssinaturas() {
  const [usuarios, setUsuarios] = useState([]);
  const [lojas, setLojas] = useState([]);
  const [assinaturas, setAssinaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [usuariosData, lojasData, assinaturasData] = await Promise.all([
        base44.entities.User.list("-created_date"),
        base44.entities.Loja.list("-created_date"),
        base44.entities.Assinatura.list("-created_date")
      ]);
      
      setUsuarios(usuariosData);
      setLojas(lojasData);
      setAssinaturas(assinaturasData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkAdminAndLoadData = useCallback(async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      const adminEmails = ["robertosaretta@gmail.com"];
      const isAdmin = user.app_role === 'super_admin' || adminEmails.includes(user.email);
      
      if (!isAdmin) {
        window.location.href = '/Dashboard';
        return;
      }
      
      await loadData();
    } catch (error) {
      console.error("Erro de autenticação em AdminAssinaturas:", error);
      window.location.href = '/Dashboard';
    }
  }, [loadData]);
  
  useEffect(() => {
    checkAdminAndLoadData();
  }, [checkAdminAndLoadData]);

  const getLojaName = (lojaId) => {
    const loja = lojas.find(l => l.id === lojaId);
    return loja?.nome || 'Sem loja';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'trial':
      case 'trialing': return 'bg-blue-100 text-blue-800';
      case 'past_due': return 'bg-yellow-100 text-yellow-800';
      case 'canceled': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'trial':
      case 'trialing': return 'Trial';
      case 'past_due': return 'Em Atraso';
      case 'canceled': return 'Cancelado';
      case 'inactive': return 'Inativo';
      default: return 'Indefinido';
    }
  };

  const getDaysRemaining = (trialEndsAt) => {
    if (!trialEndsAt) return null;
    const today = new Date();
    const endDate = new Date(trialEndsAt);
    return differenceInDays(endDate, today);
  };

  // Estatísticas
  const stats = {
    total: usuarios.length,
    ativos: usuarios.filter(u => u.subscription_status === 'active').length,
    trial: usuarios.filter(u => ['trial', 'trialing'].includes(u.subscription_status)).length,
    cancelados: usuarios.filter(u => u.subscription_status === 'canceled').length,
    emAtraso: usuarios.filter(u => u.subscription_status === 'past_due').length,
    mrrEstimado: usuarios.filter(u => u.subscription_status === 'active').length * 149,
    trialExpirando: usuarios.filter(u => {
      if (!['trial', 'trialing'].includes(u.subscription_status)) return false;
      const days = getDaysRemaining(u.trial_ends_at);
      return days !== null && days <= 3 && days >= 0;
    }).length
  };

  // Filtrar usuários
  const filteredUsuarios = usuarios.filter(usuario => {
    const searchMatch = 
      usuario.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getLojaName(usuario.loja_id).toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusMatch = statusFilter === 'todos' || usuario.subscription_status === statusFilter;
    
    return searchMatch && statusMatch;
  });

  const handleViewDetails = (usuario) => {
    setSelectedUser(usuario);
    setShowDetailModal(true);
  };

  const handleExtendTrial = async (userId, days = 7) => {
    try {
      const newTrialEnd = new Date();
      newTrialEnd.setDate(newTrialEnd.getDate() + days);
      
      await base44.entities.User.update(userId, {
        trial_ends_at: newTrialEnd.toISOString(),
        subscription_status: 'trial'
      });
      
      alert(`Trial estendido por ${days} dias!`);
      await loadData();
    } catch (error) {
      console.error("Erro ao estender trial:", error);
      alert("Erro ao estender trial. Tente novamente.");
    }
  };

  const handleChangeStatus = async (userId, newStatus) => {
    try {
      await base44.entities.User.update(userId, {
        subscription_status: newStatus
      });
      
      alert(`Status alterado para ${getStatusLabel(newStatus)}!`);
      await loadData();
      setShowDetailModal(false);
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      alert("Erro ao alterar status. Tente novamente.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando assinaturas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestão de Assinaturas</h1>
          <p className="text-gray-600">Gerencie assinaturas, trials e receita da plataforma.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadData}
            className="neuro-button px-4 py-2 text-gray-700 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </button>
          <a 
            href="https://dashboard.stripe.com/subscriptions" 
            target="_blank" 
            rel="noopener noreferrer"
            className="neuro-button pressed px-4 py-2 text-gray-800 flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Stripe
          </a>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="neuro-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-600">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="neuro-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-xs text-gray-600">Ativos</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.ativos}</p>
        </div>
        <div className="neuro-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-gray-600">Trial</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.trial}</p>
        </div>
        <div className="neuro-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-gray-600">Expirando</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">{stats.trialExpirando}</p>
        </div>
        <div className="neuro-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <span className="text-xs text-gray-600">Em Atraso</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{stats.emAtraso}</p>
        </div>
        <div className="neuro-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-xs text-gray-600">Cancelados</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.cancelados}</p>
        </div>
        <div className="neuro-card p-4 bg-gradient-to-br from-purple-50 to-indigo-50">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-purple-500" />
            <span className="text-xs text-gray-600">MRR (Est.)</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">R$ {stats.mrrEstimado.toLocaleString('pt-BR')}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        {[
          { id: 'overview', label: 'Visão Geral', icon: Users },
          { id: 'expiring', label: 'Trials Expirando', icon: AlertTriangle },
          { id: 'past_due', label: 'Em Atraso', icon: Clock }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
              activeTab === tab.id 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className="neuro-card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, email ou loja..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="neuro-input w-full p-3 pl-10 text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="neuro-input p-3 text-sm"
          >
            <option value="todos">Todos os Status</option>
            <option value="active">Ativos</option>
            <option value="trial">Trial</option>
            <option value="trialing">Trialing</option>
            <option value="past_due">Em Atraso</option>
            <option value="canceled">Cancelados</option>
          </select>
          <div className="text-right text-sm text-gray-600 flex items-center justify-end">
            Exibindo {filteredUsuarios.length} de {usuarios.length} usuários
          </div>
        </div>
      </div>

      {/* Tabela de Usuários */}
      <div className="neuro-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-700">Cliente</th>
                <th className="text-left p-4 font-semibold text-gray-700">Loja</th>
                <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                <th className="text-left p-4 font-semibold text-gray-700">Trial/Detalhes</th>
                <th className="text-left p-4 font-semibold text-gray-700">Cadastro</th>
                <th className="text-left p-4 font-semibold text-gray-700">Stripe</th>
                <th className="text-center p-4 font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsuarios.map(usuario => {
                const daysRemaining = getDaysRemaining(usuario.trial_ends_at);
                const isExpiring = daysRemaining !== null && daysRemaining <= 3 && daysRemaining >= 0;
                
                // Filtrar por tab
                if (activeTab === 'expiring' && !(['trial', 'trialing'].includes(usuario.subscription_status) && isExpiring)) {
                  return null;
                }
                if (activeTab === 'past_due' && usuario.subscription_status !== 'past_due') {
                  return null;
                }
                
                return (
                  <tr key={usuario.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-gray-800">{usuario.full_name}</p>
                        <p className="text-xs text-gray-500">{usuario.email}</p>
                      </div>
                    </td>
                    <td className="p-4 text-gray-700">{getLojaName(usuario.loja_id)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(usuario.subscription_status)}`}>
                        {getStatusLabel(usuario.subscription_status)}
                      </span>
                    </td>
                    <td className="p-4">
                      {['trial', 'trialing'].includes(usuario.subscription_status) && daysRemaining !== null ? (
                        <div>
                          <p className={`text-sm font-medium ${isExpiring ? 'text-orange-600' : 'text-blue-600'}`}>
                            {daysRemaining > 0 ? `${daysRemaining} dias restantes` : 'Expira hoje'}
                          </p>
                          {usuario.trial_ends_at && (
                            <p className="text-xs text-gray-500">
                              Termina: {format(new Date(usuario.trial_ends_at), 'dd/MM/yyyy')}
                            </p>
                          )}
                        </div>
                      ) : usuario.subscription_status === 'active' ? (
                        <p className="text-sm text-green-600">Pagando</p>
                      ) : (
                        <p className="text-sm text-gray-500">-</p>
                      )}
                    </td>
                    <td className="p-4 text-gray-600">
                      {format(new Date(usuario.created_date), 'dd/MM/yyyy')}
                    </td>
                    <td className="p-4">
                      {usuario.stripe_customer_id ? (
                        <a 
                          href={`https://dashboard.stripe.com/customers/${usuario.stripe_customer_id}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-xs flex items-center gap-1"
                        >
                          Ver <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleViewDetails(usuario)}
                        className="neuro-button p-2 text-gray-600 hover:text-gray-800"
                        title="Ver detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalhes */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="neuro-card p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{selectedUser.full_name}</h2>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="neuro-button p-2 text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Info básica */}
              <div className="neuro-card p-4 bg-gray-50">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Loja</p>
                    <p className="font-medium">{getLojaName(selectedUser.loja_id)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedUser.subscription_status)}`}>
                      {getStatusLabel(selectedUser.subscription_status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500">Cadastro</p>
                    <p className="font-medium">{format(new Date(selectedUser.created_date), 'dd/MM/yyyy', { locale: ptBR })}</p>
                  </div>
                  {selectedUser.trial_ends_at && (
                    <div>
                      <p className="text-gray-500">Fim do Trial</p>
                      <p className="font-medium">{format(new Date(selectedUser.trial_ends_at), 'dd/MM/yyyy', { locale: ptBR })}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Ações rápidas */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800">Ações Rápidas</h3>
                
                {['trial', 'trialing'].includes(selectedUser.subscription_status) && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExtendTrial(selectedUser.id, 7)}
                      className="neuro-button pressed flex-1 py-2 text-sm text-gray-800"
                    >
                      +7 dias de trial
                    </button>
                    <button
                      onClick={() => handleExtendTrial(selectedUser.id, 14)}
                      className="neuro-button flex-1 py-2 text-sm text-gray-700"
                    >
                      +14 dias de trial
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleChangeStatus(selectedUser.id, 'active')}
                    className="neuro-button py-2 text-sm text-green-700 bg-green-50"
                    disabled={selectedUser.subscription_status === 'active'}
                  >
                    Ativar Manualmente
                  </button>
                  <button
                    onClick={() => handleChangeStatus(selectedUser.id, 'canceled')}
                    className="neuro-button py-2 text-sm text-red-700 bg-red-50"
                    disabled={selectedUser.subscription_status === 'canceled'}
                  >
                    Cancelar Assinatura
                  </button>
                </div>

                {selectedUser.stripe_customer_id && (
                  <a
                    href={`https://dashboard.stripe.com/customers/${selectedUser.stripe_customer_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="neuro-button pressed w-full py-3 text-center text-gray-800 flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Ver no Stripe
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}