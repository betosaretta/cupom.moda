import React, { useState, useEffect, useCallback } from "react";
import { Pesquisa, Resposta, Loja, User } from "@/entities/all";
import { Users, Gift, TrendingUp, CheckCircle, Eye, Target, Store, Smile } from "lucide-react";

import StatsCard from "../components/dashboard/StatsCard";
import NPSChart from "../components/dashboard/NPSChart";
import RecentResponses from "../components/dashboard/RecentResponses";
import CriarLojaModal from "../components/onboarding/CriarLojaModal";
import SubscriptionAlert from "../components/subscription/SubscriptionAlert";
import OnboardingProgress from "../components/onboarding/OnboardingProgress";
import AdvancedAnalytics from "../components/dashboard/AdvancedAnalytics";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalPesquisas: 0,
    totalRespostas: 0,
    leadsGerados: 0,
    cuponsGerados: 0,
    cuponsUtilizados: 0,
    taxaConversao: 0,
    npsGeral: 0,
    promotores: 0,
    neutros: 0,
    detratores: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentLoja, setCurrentLoja] = useState(null);
  const [showCreateLojaModal, setShowCreateLojaModal] = useState(false);
  const [recentResponses, setRecentResponses] = useState([]);
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);
  const [allRespostas, setAllRespostas] = useState([]);

  const loadDashboardData = useCallback(async (lojaId) => {
    try {
      const [pesquisas, respostas] = await Promise.all([
        Pesquisa.filter({ loja_id: lojaId }),
        Resposta.list("-created_date", 1000)
      ]);

      const lojaRespostas = respostas.filter(r =>
        pesquisas.some(p => p.id === r.pesquisa_id)
      );

      setAllRespostas(lojaRespostas);

      const promotores = lojaRespostas.filter(r => r.nota >= 9).length;
      const detratores = lojaRespostas.filter(r => r.nota <= 6).length;
      const neutros = lojaRespostas.filter(r => r.nota === 7 || r.nota === 8).length;

      const npsScore = lojaRespostas.length > 0 ?
        Math.round(((promotores - detratores) / lojaRespostas.length) * 100) : 0;

      const cuponsGerados = lojaRespostas.filter(r => r.cupom_gerado).length;
      const cuponsUtilizados = lojaRespostas.filter(r => r.status_cupom === 'utilizado').length;
      const taxaConversao = cuponsGerados > 0 ? Math.round((cuponsUtilizados / cuponsGerados) * 100) : 0;

      setStats({
        totalPesquisas: pesquisas.length,
        totalRespostas: lojaRespostas.length,
        leadsGerados: lojaRespostas.length,
        cuponsGerados,
        cuponsUtilizados,
        taxaConversao,
        npsGeral: npsScore,
        promotores,
        neutros,
        detratores
      });

      setRecentResponses(lojaRespostas.slice(0, 5));
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    }
  }, []);

  const loadUserAndData = useCallback(async () => {
    setLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);

      if (user.loja_id) {
        try {
          const loja = await Loja.filter({ id: user.loja_id });
          if (loja.length > 0) {
            setCurrentLoja(loja[0]);
            await loadDashboardData(user.loja_id);
          }
        } catch (lojaError) {
          console.error("Erro ao carregar loja:", lojaError);
          setShowCreateLojaModal(true);
        }
      } else {
        setShowCreateLojaModal(true);
      }
    } catch (error) {
      console.error("Erro de autenticação no Dashboard, redirecionando para login:", error);
      await User.loginWithRedirect(window.location.href);
    } finally {
      setLoading(false);
    }
  }, [loadDashboardData]);

  useEffect(() => {
    loadUserAndData();
  }, [loadUserAndData]);

  const handleCreateLoja = async (lojaData) => {
    try {
      const newLoja = await Loja.create(lojaData);
      await User.updateMyUserData({ loja_id: newLoja.id });
      setCurrentLoja(newLoja);
      setShowCreateLojaModal(false);
      await loadUserAndData();
    } catch (error) {
      console.error("Erro ao criar loja:", error);
      alert("Erro ao criar loja. Tente novamente.");
    }
  };

  const needsSubscription = currentUser &&
    currentUser.subscription_status !== 'active';

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (!currentLoja) {
    return (
      <div className="space-y-8">
        <div className="neuro-card p-12 text-center">
          <Store className="w-24 h-24 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Seja bem-vindo(a) ao Cupom.Moda!</h2>
          <p className="text-gray-600 mb-8">
            O primeiro passo é criar sua loja. É rápido e fácil!
          </p>
          <button
            onClick={() => setShowCreateLojaModal(true)}
            className="neuro-button pressed px-8 py-4 text-gray-800 font-medium text-lg"
          >
            Criar Minha Loja Agora
          </button>
        </div>

        {showCreateLojaModal && (
          <CriarLojaModal
            onClose={() => setShowCreateLojaModal(false)}
            onSave={handleCreateLoja}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {needsSubscription && <SubscriptionAlert user={currentUser} />}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Início - {currentLoja.nome}</h1>
          <p className="text-gray-600">Veja aqui um resumo dos resultados da sua loja.</p>
        </div>
        
        <button
          onClick={() => setShowAdvancedAnalytics(!showAdvancedAnalytics)}
          className={`neuro-button px-6 py-3 flex items-center gap-2 font-medium ${
            showAdvancedAnalytics ? 'pressed text-blue-600' : 'text-gray-700'
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          {showAdvancedAnalytics ? 'Visão Simplificada' : 'Análises Avançadas'}
        </button>
      </div>

      {showAdvancedAnalytics ? (
        <AdvancedAnalytics 
          respostas={allRespostas} 
          cupons={[]} 
          pesquisas={[]}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Clientes Capturados"
              value={stats.leadsGerados}
              icon={Users}
              color="text-blue-600"
            />
            
            <StatsCard
              title="Cupons Entregues"
              value={stats.cuponsGerados}
              icon={Gift}
              color="text-purple-600"
            />
            <StatsCard
              title="Vendas com Cupom"
              value={stats.cuponsUtilizados}
              icon={CheckCircle}
              color="text-green-600"
            />
            <StatsCard
              title="Conversão de Vendas"
              value={`${stats.taxaConversao}%`}
              icon={Target}
              color="text-orange-600"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="neuro-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Pesquisas Ativas</h3>
                <Smile className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-600 mb-2">{stats.totalPesquisas}</p>
              <p className="text-sm text-gray-600">Campanhas em execução</p>
            </div>

            <div className="neuro-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Índice de Satisfação</h3>
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-purple-600 mb-2">
                {stats.npsGeral > 0 ? '+' : ''}{stats.npsGeral}
              </p>
              <p className="text-sm text-gray-600">Índice de satisfação</p>
            </div>

            <div className="neuro-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Total de Respostas</h3>
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-600 mb-2">{stats.totalRespostas}</p>
              <p className="text-sm text-gray-600">Feedbacks coletados</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <NPSChart
              promotores={stats.promotores}
              neutros={stats.neutros}
              detratores={stats.detratores}
            />
            <RecentResponses responses={recentResponses} />
          </div>
        </>
      )}

      {currentUser && currentUser.subscription_status === 'trial' && (
        <OnboardingProgress userId={currentUser.id} />
      )}
    </div>
  );
}