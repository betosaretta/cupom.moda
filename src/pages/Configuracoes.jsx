
import React, { useState, useEffect } from "react";
import { User, Loja, Parceria } from "@/entities/all";
import { Save, Store, User as UserIcon, CreditCard, Gift, Briefcase, Check, Calendar, Clock, Bell, X, Star, Heart } from "lucide-react"; // Added Star and Heart import
import ReferralCard from '../components/dashboard/ReferralCard';
import AceiteLGPDModal from "../components/lgpd/AceiteLGPDModal";
import CriarLojaModal from "../components/onboarding/CriarLojaModal";
import { createPortalSession } from "@/functions/createPortalSession";
import { createCheckoutSession } from "@/functions/createCheckoutSession";
import { format, differenceInDays } from 'date-fns';
import { NotificacaoParceria } from "@/entities/all";

export default function Configuracoes() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentLoja, setCurrentLoja] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("dados");
  const [parcerias, setParcerias] = useState([]);
  const [showLGPDModal, setShowLGPDModal] = useState(false);
  const [showCreateLojaModal, setShowCreateLojaModal] = useState(false);
  const [notificacoes, setNotificacoes] = useState([]);

  const [lojaData, setLojaData] = useState({
    nome: "",
    slug: "",
    descricao: "",
    cnpj: "",
    telefone: "" 
  });

  const [userData, setUserData] = useState({
    full_name: "",
    email: ""
  });

  useEffect(() => {
    loadData();
    loadNotifications();
    
    // Carregar script do Stripe
    const stripeScript = document.createElement('script');
    stripeScript.src = 'https://js.stripe.com/v3/buy-button.js';
    stripeScript.async = true;
    document.head.appendChild(stripeScript);

    // Cleanup: remove the script when the component unmounts
    return () => {
      const existingScript = document.querySelector('script[src="https://js.stripe.com/v3/buy-button.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  // Marcar notificações como lidas ao visualizar ofertas
  useEffect(() => {
    if (activeTab === 'parceiros' && notificacoes.length > 0) {
      // Esperar 2 segundos antes de marcar como lidas
      const timer = setTimeout(async () => {
        await handleMarkAllAsRead();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [activeTab, notificacoes.length]);

  const loadData = async () => {
    setLoading(true);
    try {
      const user = await User.me();
      if (!user) {
        await User.loginWithRedirect(window.location.origin + "/Configuracoes");
        return;
      }
      
      setCurrentUser({ ...user, favoritos_ofertas: user.favoritos_ofertas || [] }); // Ensure favoritos_ofertas is an array
      
      const parceriasData = await Parceria.list();
      setParcerias(parceriasData);
      
      setUserData({
        full_name: user.full_name || "",
        email: user.email || ""
      });

      if (!user.lgpd_aceito) {
        setShowLGPDModal(true);
        setLoading(false);
        return;
      }

      if (user.loja_id) {
        const lojas = await Loja.filter({ id: user.loja_id });
        if (lojas.length > 0) {
          const loja = lojas[0];
          setCurrentLoja(loja);
          setLojaData({
            nome: loja.nome || "",
            slug: loja.slug || "",
            descricao: loja.descricao || "",
            cnpj: loja.cnpj || "",
            telefone: loja.telefone || "" 
          });
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      if (error.message && error.message.includes('401')) {
        try {
          await User.loginWithRedirect(window.location.origin + "/Configuracoes");
        } catch (loginError) {
          console.error("Erro no redirecionamento de login:", loginError);
        }
      }
    } finally {
      setLoading(false);
    }
  };
  
  const loadNotifications = async () => {
    try {
      const notifs = await NotificacaoParceria.filter({ lida: false });
      setNotificacoes(notifs);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
    }
  };

  const handleMarkAsRead = async (notifId) => {
    try {
      await NotificacaoParceria.update(notifId, { lida: true });
      await loadNotifications();
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await Promise.all(notificacoes.map(n => NotificacaoParceria.update(n.id, { lida: true })));
      await loadNotifications();
    } catch (error) {
      console.error("Erro ao marcar todas as notificações como lidas:", error);
    }
  };

  const handleCreateLoja = async (lojaData) => {
    setSaving(true);
    try {
      const newLoja = await Loja.create(lojaData);
      await User.updateMyUserData({ loja_id: newLoja.id });
      setCurrentLoja(newLoja);
      setShowCreateLojaModal(false);
      await loadData();
    } catch (error) {
      console.error("Erro ao criar loja:", error);
      alert("Erro ao criar loja. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLoja = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (currentLoja) {
        await Loja.update(currentLoja.id, lojaData);
        alert("Configurações da loja salvas com sucesso!");
        await loadData();
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar configurações. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleLGPDAccept = async () => {
    setShowLGPDModal(false);
    setLoading(true);
    await loadData();
  };
  
  const handleSubscribe = async () => {
    setSaving(true);
    try {
      const { data } = await createCheckoutSession();
      if (data && data.url) {
        window.location.href = data.url;
      } else {
        const errorMessage = data?.error || "Ocorreu um erro desconhecido.";
        alert(`Erro ao iniciar assinatura: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Erro ao criar sessão de checkout:", error);
      const backendError = error.response?.data?.error || "Não foi possível conectar ao sistema de pagamentos.";
      alert(`Erro ao iniciar processo de assinatura:\n${backendError}`);
    } finally {
      setSaving(false);
    }
  };

  const handleManageSubscription = async () => {
    setSaving(true);
    try {
      const { data } = await createPortalSession();
      if (data && data.url) {
        window.location.href = data.url;
      } else {
        const errorMessage = data?.error || "Ocorreu um erro desconhecido.";
        alert(`Erro ao abrir portal: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Erro ao abrir portal:", error);
      const backendError = error.response?.data?.error || "Não foi possível conectar ao portal de pagamentos.";
      alert(`Erro ao gerenciar assinatura:\n${backendError}`);
    } finally {
        setSaving(false);
    }
  };

  const handleToggleFavorite = async (ofertaId) => {
    try {
      // Ensure currentUser and favoritos_ofertas are not null/undefined
      const currentFavoritos = currentUser?.favoritos_ofertas || [];
      const isFavorite = currentFavoritos.includes(ofertaId);
      
      let newFavoritos;
      if (isFavorite) {
        newFavoritos = currentFavoritos.filter(id => id !== ofertaId);
      } else {
        newFavoritos = [...currentFavoritos, ofertaId];
      }
      
      // Assuming base44.auth.updateMe is available globally or imported
      // For this example, replace base44.auth.updateMe with a mock or actual User.updateMyUserData if it's intended.
      // If `base44` is an internal lib, it should be imported. If `User` is the entity, then User.updateMyUserData should be used.
      // Assuming User.updateMyUserData based on `User` entity import:
      await User.updateMyUserData({ favoritos_ofertas: newFavoritos });
      setCurrentUser({ ...currentUser, favoritos_ofertas: newFavoritos });
    } catch (error) {
      console.error('Erro ao atualizar favoritos:', error);
      alert('Erro ao atualizar favoritos. Tente novamente.');
    }
  };

  const tabs = [
    { id: "dados", label: "Dados & Conta", icon: UserIcon },
    { id: "assinatura", label: "Assinatura", icon: CreditCard },
    { id: "indicacao", label: "Indique e Ganhe", icon: Gift },
    { id: "parceiros", label: "Ofertas de Parceiros", icon: Briefcase },
  ];

  if (showLGPDModal) {
    return <AceiteLGPDModal onAccept={handleLGPDAccept} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }
  
  if (!currentLoja && !loading) {
    return (
      <div className="space-y-8">
        <div className="neuro-card p-12 text-center">
          <Store className="w-24 h-24 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Primeiro Passo: Crie sua Loja</h2>
          <p className="text-gray-600 mb-8">
            Você precisa de uma loja para acessar as configurações.
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
            saving={saving}
          />
        )}
      </div>
    );
  }
  
  const getSubscriptionStatusInfo = (status) => {
    const trialEndDate = currentUser?.trial_ends_at ? new Date(currentUser.trial_ends_at) : null;
    const daysLeft = trialEndDate ? differenceInDays(trialEndDate, new Date()) : 0;

    switch (status) {
        case 'active':
            return { text: 'Ativa', color: 'bg-green-100 text-green-700', description: 'Seu acesso está completo, aproveite todos os recursos!' };
        case 'trialing':
        case 'trial':
            return { text: 'Em Teste', color: 'bg-blue-100 text-blue-700', description: `Você tem ${daysLeft > 0 ? daysLeft : 0} dias restantes de teste gratuito.` };
        case 'past_due':
            return { text: 'Pagamento Atrasado', color: 'bg-red-100 text-red-700', description: 'Por favor, atualize seu pagamento para evitar o bloqueio do acesso.' };
        case 'canceled':
            return { text: 'Cancelada', color: 'bg-gray-100 text-gray-700', description: 'Sua assinatura foi cancelada. Assine novamente para reativar o acesso.' };
        default:
            return { text: 'Inativa', color: 'bg-yellow-100 text-yellow-700', description: 'Sua assinatura está inativa. Assine agora para ter acesso a todos os recursos.' };
    }
  };

  const statusInfo = getSubscriptionStatusInfo(currentUser?.subscription_status);
  const trialDaysLeft = currentUser?.trial_ends_at ? differenceInDays(new Date(currentUser.trial_ends_at), new Date()) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Minha Conta</h1>
        <p className="text-gray-600">Gerencie suas informações, assinatura e configurações</p>
      </div>

      {/* Sistema de Notificações Melhorado */}
      {notificacoes.length > 0 && (
        <div className="neuro-card p-4 border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 animate-pulse">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveTab('parceiros')}
              className="flex items-center gap-3 flex-1 group"
            >
              <div className="neuro-button p-3 group-hover:shadow-lg transition-all relative">
                <Bell className="w-5 h-5 text-blue-600 animate-bounce" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {notificacoes.length}
                </span>
              </div>
              <div className="text-left">
                <h3 className="font-bold text-blue-900 text-lg">
                  {notificacoes.length} {notificacoes.length === 1 ? 'Nova Oferta Exclusiva' : 'Novas Ofertas Exclusivas'}! 🎁
                </h3>
                <p className="text-blue-700 text-sm">Clique aqui para ver as ofertas especiais para você</p>
              </div>
            </button>
            <button
              onClick={handleMarkAllAsRead}
              className="neuro-button p-2 text-gray-500 hover:text-gray-700 ml-2"
              title="Marcar todas como lidas"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Status da Assinatura em Destaque */}
      <div className="neuro-card p-6 border-2 border-blue-200 bg-blue-50">
        <div className="flex items-center gap-4">
          <div className="neuro-button p-3 text-blue-600">
            <CreditCard className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-800">Status da Assinatura:</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                {statusInfo.text}
              </span>
            </div>
            <p className="text-gray-700">{statusInfo.description}</p>
            {currentUser?.subscription_status === 'trial' && trialDaysLeft > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-700 font-medium">
                  Vence em: {format(new Date(currentUser.trial_ends_at), 'dd/MM/yyyy')} ({trialDaysLeft} dias)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex space-x-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`neuro-button px-4 py-3 flex items-center gap-2 transition-all whitespace-nowrap relative ${
              activeTab === tab.id ? 'pressed text-blue-600' : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.id === 'parceiros' && notificacoes.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {notificacoes.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="neuro-card p-8">
        {activeTab === "dados" && (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">
                Dados da Loja e Conta
              </h3>
            </div>
            
            <form onSubmit={handleSaveLoja} className="space-y-8">
              <div>
                <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Store className="w-5 h-5 text-blue-600" />
                  Informações da Loja
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Loja *
                    </label>
                    <input
                      type="text"
                      required
                      value={lojaData.nome}
                      onChange={(e) => setLojaData({...lojaData, nome: e.target.value})}
                      className="neuro-input w-full p-3 text-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL da Loja
                    </label>
                    <input
                      type="text"
                      disabled 
                      value={lojaData.slug}
                      className="neuro-input w-full p-3 text-gray-800 bg-gray-100 cursor-not-allowed" 
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      A URL é definida no cadastro e não pode ser alterada.
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição
                    </label>
                    <textarea
                      value={lojaData.descricao}
                      onChange={(e) => setLojaData({...lojaData, descricao: e.target.value})}
                      className="neuro-input w-full p-3 text-gray-800 h-24 resize-none"
                      placeholder="Descreva sua loja..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CNPJ
                    </label>
                    <input
                      type="text"
                      value={lojaData.cnpj}
                      onChange={(e) => setLojaData({...lojaData, cnpj: e.target.value})}
                      className="neuro-input w-full p-3 text-gray-800"
                      placeholder="00.000.000/0000-00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone de Contato
                    </label>
                    <input
                      type="text"
                      value={lojaData.telefone}
                      onChange={(e) => setLojaData({...lojaData, telefone: e.target.value})}
                      className="neuro-input w-full p-3 text-gray-800"
                      placeholder="(00) 90000-0000"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-green-600" />
                  Informações da Conta
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      value={userData.full_name}
                      disabled
                      className="neuro-input w-full p-3 text-gray-800 bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={userData.email}
                      disabled
                      className="neuro-input w-full p-3 text-gray-800 bg-gray-100"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="neuro-button pressed px-8 py-3 text-gray-800 font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "assinatura" && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Planos e Assinatura</h3>

            {currentUser.subscription_status === 'trial' && trialDaysLeft > 0 && (
              <div className="neuro-card p-6 border-2 border-blue-200 bg-blue-50">
                <div className="flex items-center gap-4">
                  <div className="neuro-button p-3 text-blue-600">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800 text-lg">Seu período de teste está ativo!</h4>
                    <p className="text-blue-700 mt-1">
                      Você tem <span className="font-bold">{trialDaysLeft} {trialDaysLeft === 1 ? 'dia restante' : 'dias restantes'}</span> para explorar todos os recursos.
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Expira em: {format(new Date(currentUser.trial_ends_at), 'dd/MM/yyyy')}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="neuro-card p-6 bg-green-50">
                <h4 className="font-medium text-green-800 mb-4 text-lg">✨ Benefícios Inclusos</h4>
                <ul className="text-green-700 space-y-3">
                  <li className="flex items-start"><Check className="w-5 h-5 mr-3 mt-0.5 text-green-600 flex-shrink-0" /> Leads e Cupons ilimitados</li>
                  <li className="flex items-start"><Check className="w-5 h-5 mr-3 mt-0.5 text-green-600 flex-shrink-0" /> Pesquisas NPS ilimitadas</li>
                  <li className="flex items-start"><Check className="w-5 h-5 mr-3 mt-0.5 text-green-600 flex-shrink-0" /> Relatórios detalhados</li>
                  <li className="flex items-start"><Check className="w-5 h-5 mr-3 mt-0.5 text-green-600 flex-shrink-0" /> Suporte prioritário</li>
                  <li className="flex items-start"><Check className="w-5 h-5 mr-3 mt-0.5 text-green-600 flex-shrink-0" /> 14 dias para testar grátis</li>
                </ul>
              </div>

              <div className="neuro-card p-8 text-center">
                <h4 className="text-2xl font-bold text-gray-800 mb-2">Plano Mensal</h4>
                <p className="text-4xl font-extrabold text-blue-600 mb-4">
                  R$149,00<span className="text-lg font-medium text-gray-500">/mês</span>
                </p>
                
                {['active', 'past_due'].includes(currentUser?.subscription_status) ? (
                  <div className="space-y-4">
                    <button
                      onClick={handleManageSubscription}
                      disabled={saving}
                      className="neuro-button w-full py-3 text-gray-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <CreditCard className="w-5 h-5" />
                      {saving ? 'Carregando...' : 'Gerenciar Assinatura'}
                    </button>
                    <p className="text-xs text-gray-500">Gerencie sua assinatura através do portal seguro do Stripe</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={handleSubscribe}
                        disabled={saving}
                        className="neuro-button pressed w-full py-4 text-gray-800 font-medium text-lg flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <CreditCard className="w-5 h-5" />
                        {saving ? 'Carregando...' : 'Assinar com Checkout'}
                      </button>
                      
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-3">ou</p>
                        <div className="flex justify-center">
                          <stripe-buy-button
                            buy-button-id="buy_btn_1Rsn3BCPt533DBcge2M0Qc7A"
                            publishable-key="pk_live_51Oh9BPCPt533DBcgSDVbNyJelaQRj6gDa0w9YkXoYrJbkRG3uzzA4lyzo8qmudp7v5DHUksPfZxMAuQkvV08KeYo008jTKGtQ4"
                          >
                          </stripe-buy-button>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">Cancele quando quiser. Pagamento seguro via Stripe.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="neuro-card p-6 bg-blue-50">
              <h4 className="font-medium text-blue-800 mb-2">🔐 Portal de Pagamentos Seguro</h4>
              <p className="text-sm text-blue-700 mb-4">
                Gerencie seus dados de pagamento, visualize faturas e histórico através do portal seguro do Stripe.
              </p>
            </div>
          </div>
        )}
        
        {activeTab === "indicacao" && (
            <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Programa de Indicação</h3>
                <ReferralCard />
            </div>
        )}

        {activeTab === "parceiros" && (
            <div className="space-y-8">
                <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Ofertas Exclusivas de Parceiros</h3>
                    <p className="text-gray-600">Aproveite benefícios selecionados para alavancar seu negócio.</p>
                </div>
                
                {/* Banner de boas-vindas quando visualiza ofertas pela primeira vez */}
                {notificacoes.length > 0 && (
                  <div className="neuro-card p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="neuro-button p-3">
                        <Gift className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-green-900 text-lg">
                          ✨ Ofertas Exclusivas Disponíveis para Você!
                        </h4>
                        <p className="text-green-700 text-sm">
                          Explore as ofertas abaixo e aproveite descontos especiais para alavancar seu negócio.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ofertas Favoritas */}
                {currentUser?.favoritos_ofertas?.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500 fill-current" />
                      Minhas Ofertas Favoritas
                    </h4>
                    <div className="grid grid-cols-1 gap-6">
                      {parcerias
                        .filter(p => currentUser.favoritos_ofertas.includes(p.id) && p.ativa)
                        .map(oferta => {
                          const dataInicio = oferta.data_inicio ? new Date(oferta.data_inicio) : null;
                          const dataFim = oferta.data_fim ? new Date(oferta.data_fim) : null;
                          const hoje = new Date();
                          const isValida = (!dataInicio || hoje >= dataInicio) && (!dataFim || hoje <= dataFim);
                          const temValores = oferta.valor_original && oferta.valor_promocional;
                          const desconto = temValores ? Math.round(((oferta.valor_original - oferta.valor_promocional) / oferta.valor_original) * 100) : 0;
                          
                          return (
                            <div key={oferta.id} className="neuro-card p-6 hover:shadow-xl transition-all border-2 border-red-200">
                              <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-shrink-0 relative">
                                  <img 
                                    src={oferta.imagem_url || 'https://via.placeholder.com/200'} 
                                    alt={oferta.titulo} 
                                    className="w-full md:w-48 h-48 object-cover rounded-lg shadow-md"
                                  />
                                  {temValores && desconto > 0 && (
                                    <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
                                      -{desconto}%
                                    </div>
                                  )}
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-start justify-between mb-3">
                                    <div>
                                      <h5 className="text-xl font-bold text-gray-800 mb-1">{oferta.titulo}</h5>
                                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                        oferta.categoria === 'roupas' ? 'bg-pink-100 text-pink-800' : 'bg-indigo-100 text-indigo-800'
                                      }`}>
                                        {oferta.categoria === 'roupas' ? '👗 Roupas' : '💻 Software'}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => handleToggleFavorite(oferta.id)}
                                      className="neuro-button p-2 text-red-500"
                                      title="Remover dos favoritos"
                                    >
                                      <Heart className="w-5 h-5 fill-current" />
                                    </button>
                                  </div>

                                  {temValores && (
                                    <div className="mb-4">
                                      <div className="flex items-center gap-3">
                                        <span className="text-gray-500 line-through text-lg">
                                          R$ {oferta.valor_original.toFixed(2)}
                                        </span>
                                        <span className="text-green-600 font-bold text-2xl">
                                          R$ {oferta.valor_promocional.toFixed(2)}
                                        </span>
                                      </div>
                                      <p className="text-sm text-green-600 font-medium mt-1">
                                        Economize R$ {(oferta.valor_original - oferta.valor_promocional).toFixed(2)}
                                      </p>
                                    </div>
                                  )}

                                  <p className="text-gray-700 mb-4 leading-relaxed">
                                    {oferta.descricao || 'Aproveite esta oferta exclusiva!'}
                                  </p>

                                  {oferta.codigo_cupom && (
                                    <div className="mb-4 inline-block">
                                      <div className="flex items-center gap-2 bg-green-50 border-2 border-green-200 rounded-lg px-4 py-2">
                                        <Gift className="w-5 h-5 text-green-600" />
                                        <div>
                                          <p className="text-xs text-green-700 font-medium">Cupom Exclusivo</p>
                                          <p className="text-lg font-bold text-green-800">{oferta.codigo_cupom}</p>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  <a 
                                    href={oferta.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="neuro-button pressed inline-flex items-center gap-2 px-6 py-3 text-gray-800 font-medium hover:shadow-lg transition-all"
                                  >
                                    <Gift className="w-5 h-5" />
                                    Aproveitar Oferta
                                  </a>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}


                {parcerias.filter(p => p.ativa).length === 0 ? ( 
                    <div className="text-center py-16">
                        <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-2xl font-semibold text-gray-800 mb-2">Em Breve</h3>
                        <p className="text-gray-600 mb-4">
                            Estamos preparando ofertas exclusivas e parcerias especiais para nossos clientes.
                        </p>
                        <div className="neuro-card p-6 max-w-md mx-auto bg-blue-50">
                            <h4 className="font-semibold text-blue-800 mb-2">O que você pode esperar:</h4>
                            <ul className="text-sm text-blue-700 space-y-1 text-left">
                                <li>🎨 Cápsulas de roupas com desconto especial</li>
                                <li>💻 Softwares e ferramentas para seu negócio</li>
                                <li>📚 Cursos e mentorias exclusivas</li>
                                <li>🤝 Parcerias estratégicas</li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Ofertas de Roupas */}
                        {parcerias.filter(p => p.categoria === 'roupas' && p.ativa).length > 0 && (
                            <div>
                                <h4 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                                    <span className="text-2xl">👗</span>
                                    Cápsula de Roupas e Produtos
                                </h4>
                                <div className="grid grid-cols-1 gap-6">
                                    {parcerias.filter(p => p.categoria === 'roupas' && p.ativa).map(oferta => {
                                        const dataInicio = oferta.data_inicio ? new Date(oferta.data_inicio) : null;
                                        const dataFim = oferta.data_fim ? new Date(oferta.data_fim) : null;
                                        const hoje = new Date();
                                        const isValida = (!dataInicio || hoje >= dataInicio) && (!dataFim || hoje <= dataFim);
                                        const temValores = oferta.valor_original && oferta.valor_promocional;
                                        const desconto = temValores ? Math.round(((oferta.valor_original - oferta.valor_promocional) / oferta.valor_original) * 100) : 0;
                                        const isFavorite = currentUser?.favoritos_ofertas?.includes(oferta.id);
                                        
                                        return (
                                            <div key={oferta.id} className={`neuro-card p-6 hover:shadow-xl transition-all ${oferta.destaque ? 'border-2 border-yellow-300' : ''}`}>
                                                <div className="flex flex-col md:flex-row gap-6">
                                                    <div className="flex-shrink-0 relative">
                                                        <img 
                                                            src={oferta.imagem_url || 'https://via.placeholder.com/200'} 
                                                            alt={oferta.titulo} 
                                                            className="w-full md:w-48 h-48 object-cover rounded-lg shadow-md"
                                                        />
                                                        {temValores && desconto > 0 && (
                                                            <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
                                                                -{desconto}%
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div>
                                                                <h5 className="text-xl font-bold text-gray-800 mb-1">{oferta.titulo}</h5>
                                                                <div className="flex items-center gap-2">
                                                                  {oferta.destaque && (
                                                                      <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 text-xs rounded-full font-medium">
                                                                          <Star className="w-3 h-3" /> Destaque
                                                                      </span>
                                                                  )}
                                                                </div>
                                                            </div>
                                                            <button
                                                              onClick={() => handleToggleFavorite(oferta.id)}
                                                              className={`neuro-button p-2 transition-colors ${
                                                                isFavorite ? 'text-red-500' : 'text-gray-400'
                                                              }`}
                                                              title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                                                            >
                                                              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                                                            </button>
                                                        </div>

                                                        {temValores && (
                                                            <div className="mb-4">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-gray-500 line-through text-lg">
                                                                        R$ {oferta.valor_original.toFixed(2)}
                                                                    </span>
                                                                    <span className="text-green-600 font-bold text-2xl">
                                                                        R$ {oferta.valor_promocional.toFixed(2)}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-green-600 font-medium mt-1">
                                                                    Economize R$ {(oferta.valor_original - oferta.valor_promocional).toFixed(2)}
                                                                </p>
                                                            </div>
                                                        )}

                                                        <p className="text-gray-700 mb-4 leading-relaxed">
                                                            {oferta.descricao || 'Aproveite esta oferta exclusiva para nossos clientes!'}
                                                        </p>

                                                        {oferta.codigo_cupom && (
                                                            <div className="mb-4 inline-block">
                                                                <div className="flex items-center gap-2 bg-green-50 border-2 border-green-200 rounded-lg px-4 py-2">
                                                                    <Gift className="w-5 h-5 text-green-600" />
                                                                    <div>
                                                                        <p className="text-xs text-green-700 font-medium">Cupom Exclusivo</p>
                                                                        <p className="text-lg font-bold text-green-800">{oferta.codigo_cupom}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="mb-4">
                                                            {(dataInicio || dataFim) && (
                                                                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                                                                    isValida ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'
                                                                }`}>
                                                                    <Calendar className="w-4 h-4" />
                                                                    <span>
                                                                        {dataInicio && `De ${dataInicio.toLocaleDateString('pt-BR')}`}
                                                                        {dataInicio && dataFim && ' '}
                                                                        {dataFim && `até ${dataFim.toLocaleDateString('pt-BR')}`}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <a 
                                                            href={oferta.link} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="neuro-button pressed inline-flex items-center gap-2 px-6 py-3 text-gray-800 font-medium hover:shadow-lg transition-all"
                                                        >
                                                            <Gift className="w-5 h-5" />
                                                            Aproveitar Oferta
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Ofertas de Software */}
                        {parcerias.filter(p => p.categoria === 'software' && p.ativa).length > 0 && (
                            <div>
                                <h4 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                                    <span className="text-2xl">💻</span>
                                    Softwares e Ferramentas
                                </h4>
                                <div className="grid grid-cols-1 gap-6">
                                    {parcerias.filter(p => p.categoria === 'software' && p.ativa).map(oferta => {
                                        const dataInicio = oferta.data_inicio ? new Date(oferta.data_inicio) : null;
                                        const dataFim = oferta.data_fim ? new Date(oferta.data_fim) : null;
                                        const hoje = new Date();
                                        const isValida = (!dataInicio || hoje >= dataInicio) && (!dataFim || hoje <= dataFim);
                                        const temValores = oferta.valor_original && oferta.valor_promocional;
                                        const desconto = temValores ? Math.round(((oferta.valor_original - oferta.valor_promocional) / oferta.valor_original) * 100) : 0;
                                        const isFavorite = currentUser?.favoritos_ofertas?.includes(oferta.id);
                                        
                                        return (
                                            <div key={oferta.id} className={`neuro-card p-6 hover:shadow-xl transition-all ${oferta.destaque ? 'border-2 border-yellow-300' : ''}`}>
                                                <div className="flex flex-col md:flex-row gap-6">
                                                    <div className="flex-shrink-0 relative">
                                                        <img 
                                                            src={oferta.imagem_url || 'https://via.placeholder.com/200'} 
                                                            alt={oferta.titulo} 
                                                            className="w-full md:w-48 h-48 object-cover rounded-lg shadow-md"
                                                        />
                                                        {temValores && desconto > 0 && (
                                                            <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
                                                                -{desconto}%
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div>
                                                                <h5 className="text-xl font-bold text-gray-800 mb-1">{oferta.titulo}</h5>
                                                                <div className="flex items-center gap-2">
                                                                  {oferta.destaque && (
                                                                      <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 text-xs rounded-full font-medium">
                                                                          <Star className="w-3 h-3" /> Destaque
                                                                      </span>
                                                                  )}
                                                                </div>
                                                            </div>
                                                            <button
                                                              onClick={() => handleToggleFavorite(oferta.id)}
                                                              className={`neuro-button p-2 transition-colors ${
                                                                isFavorite ? 'text-red-500' : 'text-gray-400'
                                                              }`}
                                                              title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                                                            >
                                                              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                                                            </button>
                                                        </div>

                                                        {temValores && (
                                                            <div className="mb-4">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-gray-500 line-through text-lg">
                                                                        R$ {oferta.valor_original.toFixed(2)}
                                                                    </span>
                                                                    <span className="text-green-600 font-bold text-2xl">
                                                                        R$ {oferta.valor_promocional.toFixed(2)}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-green-600 font-medium mt-1">
                                                                    Economize R$ {(oferta.valor_original - oferta.valor_promocional).toFixed(2)}
                                                                </p>
                                                            </div>
                                                        )}

                                                        <p className="text-gray-700 mb-4 leading-relaxed">
                                                            {oferta.descricao || 'Aproveite esta ferramenta exclusiva para nossos clientes!'}
                                                        </p>

                                                        {oferta.codigo_cupom && (
                                                            <div className="mb-4 inline-block">
                                                                <div className="flex items-center gap-2 bg-green-50 border-2 border-green-200 rounded-lg px-4 py-2">
                                                                    <Gift className="w-5 h-5 text-green-600" />
                                                                    <div>
                                                                        <p className="text-xs text-green-700 font-medium">Cupom Exclusivo</p>
                                                                        <p className="text-lg font-bold text-green-800">{oferta.codigo_cupom}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="mb-4">
                                                            {(dataInicio || dataFim) && (
                                                                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                                                                    isValida ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'
                                                                }`}>
                                                                    <Calendar className="w-4 h-4" />
                                                                    <span>
                                                                        {dataInicio && `De ${dataInicio.toLocaleDateString('pt-BR')}`}
                                                                        {dataInicio && dataFim && ' '}
                                                                        {dataFim && `até ${dataFim.toLocaleDateString('pt-BR')}`}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <a 
                                                            href={oferta.link} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="neuro-button pressed inline-flex items-center gap-2 px-6 py-3 text-gray-800 font-medium hover:shadow-lg transition-all"
                                                        >
                                                            <Gift className="w-5 h-5" />
                                                            Aproveitar Oferta
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
}
