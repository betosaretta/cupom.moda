import React, { useState, useEffect, useCallback } from "react";
import { Loja, User, Assinatura, Pesquisa, Resposta } from "@/entities/all";
import { Store, Users, CreditCard, TrendingUp, DollarSign, AlertTriangle } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalLojas: 0,
    totalUsuarios: 0,
    assinaturasAtivas: 0,
    receitaMensal: 0,
    totalPesquisas: 0,
    totalRespostas: 0,
    assinaturasPendentes: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);

  const loadDashboardData = useCallback(async () => {
    try {
      // Carregar dados em paralelo com tratamento de erro individual
      const results = await Promise.allSettled([
        Loja.list().catch(() => []),
        User.list().catch(() => []),
        Assinatura.list().catch(() => []),
        Pesquisa.list().catch(() => []),
        Resposta.list().catch(() => [])
      ]);

      const lojas = results[0].status === 'fulfilled' ? results[0].value : [];
      const usuarios = results[1].status === 'fulfilled' ? results[1].value : [];
      const assinaturas = results[2].status === 'fulfilled' ? results[2].value : [];
      const pesquisas = results[3].status === 'fulfilled' ? results[3].value : [];
      const respostas = results[4].status === 'fulfilled' ? results[4].value : [];

      const assinaturasAtivas = assinaturas.filter(a => a.status === 'active' || a.status === 'trialing');
      const assinaturasPendentes = assinaturas.filter(a => a.status === 'past_due' || a.status === 'incomplete');
      const receitaMensal = assinaturasAtivas.reduce((total, assinatura) => total + (assinatura.valor_mensal || 149), 0);

      setStats({
        totalLojas: lojas.length,
        totalUsuarios: usuarios.length,
        assinaturasAtivas: assinaturasAtivas.length,
        receitaMensal,
        totalPesquisas: pesquisas.length,
        totalRespostas: respostas.length,
        assinaturasPendentes: assinaturasPendentes.length
      });
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setError("Erro ao carregar alguns dados. Algumas informações podem estar incompletas.");
    }
  }, []);

  const checkAdminAndLoadData = useCallback(async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
      
      const adminEmails = ["robertosaretta@gmail.com"];
      const isAdmin = user.app_role === 'super_admin' || adminEmails.includes(user.email);
      
      if (!isAdmin) {
        window.location.href = '/Dashboard';
        return;
      }
      
      await loadDashboardData();
    } catch (error) {
      console.error("Erro de autenticação em AdminDashboard:", error);
      setError("Erro ao carregar dados. Por favor, recarregue a página.");
    } finally {
      setLoading(false);
    }
  }, [loadDashboardData]);

  useEffect(() => {
    checkAdminAndLoadData();
  }, [checkAdminAndLoadData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Administrativo</h1>
        <p className="text-gray-600">Visão geral completa do sistema</p>
      </div>

      {error && (
        <div className="neuro-card p-4 bg-yellow-50 border-2 border-yellow-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <p className="text-yellow-800">{error}</p>
          </div>
        </div>
      )}

      {/* Cards de Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="neuro-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total de Lojas</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalLojas}</p>
            </div>
            <div className="neuro-button p-4 text-blue-600">
              <Store className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="neuro-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Usuários Ativos</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalUsuarios}</p>
            </div>
            <div className="neuro-button p-4 text-green-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="neuro-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Assinaturas Ativas</p>
              <p className="text-3xl font-bold text-gray-800">{stats.assinaturasAtivas}</p>
            </div>
            <div className="neuro-button p-4 text-purple-600">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="neuro-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Receita Mensal</p>
              <p className="text-3xl font-bold text-gray-800">R$ {stats.receitaMensal.toFixed(2)}</p>
            </div>
            <div className="neuro-button p-4 text-yellow-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Cards Secundários */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="neuro-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Pesquisas Criadas</h3>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.totalPesquisas}</p>
          <p className="text-sm text-gray-600">Total de pesquisas no sistema</p>
        </div>

        <div className="neuro-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Respostas Coletadas</h3>
            <Users className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.totalRespostas}</p>
          <p className="text-sm text-gray-600">Feedback de clientes</p>
        </div>

        <div className="neuro-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Pendências</h3>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.assinaturasPendentes}</p>
          <p className="text-sm text-gray-600">Assinaturas pendentes</p>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="neuro-card p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="neuro-button p-4 text-left hover:shadow-lg transition-all">
            <Store className="w-6 h-6 text-blue-600 mb-2" />
            <p className="font-medium text-gray-800">Nova Loja</p>
            <p className="text-sm text-gray-600">Cadastrar nova loja</p>
          </button>
          
          <button className="neuro-button p-4 text-left hover:shadow-lg transition-all">
            <Users className="w-6 h-6 text-green-600 mb-2" />
            <p className="font-medium text-gray-800">Convidar Usuário</p>
            <p className="text-sm text-gray-600">Adicionar novo usuário</p>
          </button>
          
          <button className="neuro-button p-4 text-left hover:shadow-lg transition-all">
            <CreditCard className="w-6 h-6 text-purple-600 mb-2" />
            <p className="font-medium text-gray-800">Ver Assinaturas</p>
            <p className="text-sm text-gray-600">Gerenciar pagamentos</p>
          </button>
          
          <button className="neuro-button p-4 text-left hover:shadow-lg transition-all">
            <TrendingUp className="w-6 h-6 text-orange-600 mb-2" />
            <p className="font-medium text-gray-800">Relatórios</p>
            <p className="text-sm text-gray-600">Análises detalhadas</p>
          </button>
        </div>
      </div>
    </div>
  );
}