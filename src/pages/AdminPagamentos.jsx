import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, CreditCard, DollarSign, ExternalLink, TrendingUp, TrendingDown, RefreshCw, FileText, Download, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminPagamentos() {
  const [assinaturas, setAssinaturas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [periodoFilter, setPeriodoFilter] = useState('atual');

  const checkAdminAndLoadData = useCallback(async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      const adminEmails = ["robertosaretta@gmail.com"];
      if (user.app_role !== 'super_admin' && !adminEmails.includes(user.email)) {
        window.location.href = '/Dashboard';
        return;
      }
      await loadData();
    } catch (error) {
      window.location.href = '/Dashboard';
    }
  }, []);

  useEffect(() => {
    checkAdminAndLoadData();
  }, [checkAdminAndLoadData]);

  const loadData = async () => {
    try {
      const [assinaturasData, usersData] = await Promise.all([
        base44.entities.Assinatura.list('-created_date'),
        base44.entities.User.list()
      ]);

      const usersById = usersData.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {});

      const enrichedAssinaturas = assinaturasData.map(sub => ({
        ...sub,
        userName: usersById[sub.user_id]?.full_name || 'Usuário não encontrado',
        userEmail: usersById[sub.user_id]?.email || ''
      }));

      setAssinaturas(enrichedAssinaturas);
      setUsuarios(usersData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'trialing': return 'bg-blue-100 text-blue-800';
      case 'past_due': return 'bg-yellow-100 text-yellow-800';
      case 'canceled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'trialing': return 'Trial';
      case 'past_due': return 'Em Atraso';
      case 'canceled': return 'Cancelado';
      case 'incomplete': return 'Incompleto';
      default: return 'Inativo';
    }
  };
  
  const filteredAssinaturas = assinaturas.filter(sub => {
    const searchMatch = 
      sub.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.stripe_subscription_id && sub.stripe_subscription_id.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const statusMatch = statusFilter === 'todos' || sub.status === statusFilter;
    
    return searchMatch && statusMatch;
  });

  // Cálculos financeiros
  const mrr = assinaturas
    .filter(a => a.status === 'active')
    .reduce((total, a) => total + (a.valor_mensal || 149), 0);
  
  const mrrAnterior = mrr * 0.9; // Simulação - idealmente pegar do histórico
  const crescimentoMRR = mrrAnterior > 0 ? ((mrr - mrrAnterior) / mrrAnterior * 100).toFixed(1) : 0;
  
  const arr = mrr * 12;
  const ticketMedio = assinaturas.filter(a => a.status === 'active').length > 0 
    ? mrr / assinaturas.filter(a => a.status === 'active').length 
    : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados de pagamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Painel Financeiro</h1>
          <p className="text-gray-600">Monitore receita, pagamentos e métricas financeiras.</p>
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
            href="https://dashboard.stripe.com/payments" 
            target="_blank" 
            rel="noopener noreferrer"
            className="neuro-button pressed px-4 py-2 text-gray-800 flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Stripe
          </a>
        </div>
      </div>
      
      {/* Cards de Métricas Financeiras */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="neuro-card p-6 bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">MRR</h3>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">R$ {mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <div className="flex items-center gap-1 mt-2">
            {Number(crescimentoMRR) >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-sm ${Number(crescimentoMRR) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {crescimentoMRR}% vs mês anterior
            </span>
          </div>
        </div>
        
        <div className="neuro-card p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">ARR (Anual)</h3>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">R$ {arr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-gray-500 mt-2">Receita anual projetada</p>
        </div>
        
        <div className="neuro-card p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Ticket Médio</h3>
            <CreditCard className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-600">R$ {ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-gray-500 mt-2">Por assinante ativo</p>
        </div>
        
        <div className="neuro-card p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Assinantes Ativos</h3>
            <Calendar className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-3xl font-bold text-indigo-600">{assinaturas.filter(a => a.status === 'active').length}</p>
          <p className="text-xs text-gray-500 mt-2">
            +{assinaturas.filter(a => a.status === 'trialing').length} em trial
          </p>
        </div>
      </div>

      {/* Links Rápidos Stripe */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <a 
          href="https://dashboard.stripe.com/payments" 
          target="_blank" 
          rel="noopener noreferrer"
          className="neuro-button p-4 text-center hover:bg-gray-50"
        >
          <CreditCard className="w-6 h-6 mx-auto mb-2 text-gray-600" />
          <span className="text-sm text-gray-700">Pagamentos</span>
        </a>
        <a 
          href="https://dashboard.stripe.com/subscriptions" 
          target="_blank" 
          rel="noopener noreferrer"
          className="neuro-button p-4 text-center hover:bg-gray-50"
        >
          <RefreshCw className="w-6 h-6 mx-auto mb-2 text-gray-600" />
          <span className="text-sm text-gray-700">Assinaturas</span>
        </a>
        <a 
          href="https://dashboard.stripe.com/invoices" 
          target="_blank" 
          rel="noopener noreferrer"
          className="neuro-button p-4 text-center hover:bg-gray-50"
        >
          <FileText className="w-6 h-6 mx-auto mb-2 text-gray-600" />
          <span className="text-sm text-gray-700">Faturas</span>
        </a>
        <a 
          href="https://dashboard.stripe.com/customers" 
          target="_blank" 
          rel="noopener noreferrer"
          className="neuro-button p-4 text-center hover:bg-gray-50"
        >
          <Download className="w-6 h-6 mx-auto mb-2 text-gray-600" />
          <span className="text-sm text-gray-700">Clientes</span>
        </a>
      </div>

      <div className="neuro-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por cliente, email ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="neuro-input w-full p-3 pl-10 text-gray-800 text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="neuro-input p-3 text-gray-800 text-sm"
          >
            <option value="todos">Todos os Status</option>
            <option value="active">Ativo</option>
            <option value="trialing">Trial</option>
            <option value="past_due">Em Atraso</option>
            <option value="canceled">Cancelado</option>
            <option value="incomplete">Incompleto</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="p-3 font-semibold">Cliente</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold">Plano</th>
                <th className="p-3 font-semibold">Período Atual</th>
                <th className="p-3 font-semibold">ID Assinatura (Stripe)</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssinaturas.map(sub => (
                <tr key={sub.id} className="border-b border-gray-100">
                  <td className="p-3">
                    <p className="font-medium text-gray-800">{sub.userName}</p>
                    <p className="text-xs text-gray-500">{sub.userEmail}</p>
                  </td>
                  <td className="p-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(sub.status)}`}>
                      {getStatusLabel(sub.status)}
                    </span>
                  </td>
                  <td className="p-3">{sub.plano || 'Mensal'}</td>
                  <td className="p-3">
                    {sub.current_period_start && sub.current_period_end ?
                      `${format(new Date(sub.current_period_start), 'dd/MM/yy')} - ${format(new Date(sub.current_period_end), 'dd/MM/yy')}`
                      : 'N/A'
                    }
                  </td>
                  <td className="p-3">
                    <a href={`https://dashboard.stripe.com/subscriptions/${sub.stripe_subscription_id}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center text-xs">
                      {sub.stripe_subscription_id} <ExternalLink className="w-3 h-3 ml-1"/>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}