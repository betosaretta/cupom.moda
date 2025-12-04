import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import OnboardingManager from "@/components/onboarding/OnboardingManager";
import {
  LayoutDashboard,
  Gift,
  Smile,
  Store,
  UserCog,
  Building,
  CreditCard,
  LogOut,
  Menu,
  X,
  Briefcase,
  Shield,
  Code,
  UserCheck,
  DollarSign,
  Key,
  Clock,
  UserPlus,
  LifeBuoy,
  Mail,
  FileText,
  Ticket,
} from "lucide-react";
import ChatbotButton from "@/components/suporte/ChatbotButton";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [currentLoja, setCurrentLoja] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificacoesCount, setNotificacoesCount] = useState(0);

  const loadNotifications = async () => {
    try {
      const notifs = await base44.entities.NotificacaoParceria.filter({ lida: false });
      setNotificacoesCount(notifs?.length || 0);
    } catch (error) {
      console.log("Info: Notificações não disponíveis no momento");
      setNotificacoesCount(0);
    }
  };

  const loadUserData = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);

      if (user.loja_id) {
        try {
          const lojas = await base44.entities.Loja.filter({ id: user.loja_id });
          if (lojas.length > 0) {
            setCurrentLoja(lojas[0]);
          }
        } catch (lojaError) {
          console.log("Info: Loja não carregada");
        }
      }

      if (!currentPageName?.includes('Admin')) {
        await loadNotifications();
      }
    } catch (e) {
      console.log("Usuário não logado ou erro ao carregar dados");
    }
  };

  useEffect(() => {
    loadUserData();

    const interval = setInterval(() => {
      if (!currentPageName?.includes('Admin')) {
        loadNotifications();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [currentPageName]);

  const handleLojaCreated = async (loja) => {
    setCurrentLoja(loja);
    await loadUserData();
  };

  const adminEmails = ["robertosaretta@gmail.com"];
  const isSuperAdmin = currentUser?.app_role === 'super_admin' || adminEmails.includes(currentUser?.email);

  const lojistaNavigation = [
    { title: "Início", url: createPageUrl("Dashboard"), icon: LayoutDashboard },
    { title: "Pesquisas", url: createPageUrl("Pesquisas"), icon: Smile },
    { title: "Cupons", url: createPageUrl("Cupons"), icon: Gift },
    { title: "Clientes", url: createPageUrl("CadastroClientes"), icon: UserPlus },
    { title: "Vendas", url: createPageUrl("Vendas"), icon: DollarSign },
    { title: "Relatórios", url: createPageUrl("Relatorios"), icon: FileText },
    { title: "Suporte", url: createPageUrl("Suporte"), icon: Ticket },
    { title: "Como Usar", url: createPageUrl("Ajuda"), icon: LifeBuoy },
    { title: "Minha Conta", url: createPageUrl("Configuracoes"), icon: UserCog, badge: notificacoesCount },
  ];

  const adminNavigation = [
    { title: "Dashboard Admin", url: createPageUrl("AdminDashboard"), icon: LayoutDashboard },
    { title: "Gestão de Trials", url: createPageUrl("AdminTrials"), icon: Clock },
    { title: "Clientes", url: createPageUrl("AdminUsuarios"), icon: Building },
    { title: "Pagamentos", url: createPageUrl("AdminPagamentos"), icon: DollarSign },
    { title: "Assinaturas", url: createPageUrl("AdminAssinaturas"), icon: CreditCard },
    { title: "Chamados", url: createPageUrl("AdminChamados"), icon: Ticket },
    { title: "Integração Flodesk", url: createPageUrl("AdminFlodesk"), icon: Mail },
    { title: "Parceiros", url: createPageUrl("AdminParceiros"), icon: Briefcase },
    { title: "Códigos Promocionais", url: createPageUrl("AdminCodigos"), icon: Code },
    { title: "Ofertas Parceiros", url: createPageUrl("AdminParcerias"), icon: UserCheck },
    { title: "LGPD", url: createPageUrl("AdminLGPD"), icon: Shield },
    { title: "Como Usar", url: createPageUrl("Ajuda"), icon: LifeBuoy },
    { title: "Configurações", url: createPageUrl("AdminConfiguracoes"), icon: Key },
  ];

  const isClientPage = ["PesquisaCliente", "Sucesso", "Home", "CapturaLeadCupom", "LGPD"].includes(currentPageName);
  
  const newBgColor = '#f8fafc';
  const newDarkShadow = '#e2e8f0';
  const newLightShadow = '#ffffff';

  const neumorphicStyles = `
    .neuro-card {
      background: ${newBgColor};
      border-radius: 20px;
      box-shadow:
        8px 8px 16px ${newDarkShadow},
        -8px -8px 16px ${newLightShadow};
    }

    .neuro-button {
      background: ${newBgColor};
      border: none;
      border-radius: 15px;
      box-shadow:
        6px 6px 12px ${newDarkShadow},
        -6px -6px 12px ${newLightShadow};
      transition: all 0.2s ease;
    }

    .neuro-button:hover {
      box-shadow:
        4px 4px 8px ${newDarkShadow},
        -4px -4px 8px ${newLightShadow};
    }

    .neuro-button:active,
    .neuro-button.pressed {
      box-shadow:
        inset 4px 4px 8px ${newDarkShadow},
        inset -4px -4px 8px ${newLightShadow};
    }

    .neuro-input {
      background: ${newBgColor};
      border: none;
      border-radius: 12px;
      box-shadow:
        inset 4px 4px 8px ${newDarkShadow},
        inset -4px -4px 8px ${newLightShadow};
    }

    .neuro-input:focus {
      outline: none;
      box-shadow:
        inset 6px 6px 12px ${newDarkShadow},
        inset -6px -6px 12px ${newLightShadow};
    }
  `;

  const sidebarStyles = `
    .neuro-sidebar-item {
      background: ${newBgColor};
      border-radius: 12px;
      transition: all 0.3s ease;
      box-shadow: none;
    }

    .neuro-sidebar-item:hover {
      box-shadow:
        4px 4px 8px ${newDarkShadow},
        -4px -4px 8px ${newLightShadow};
    }

    .neuro-sidebar-item.active {
      box-shadow:
        inset 4px 4px 8px ${newDarkShadow},
        inset -4px -4px 8px ${newLightShadow};
    }
  `;

  if (isClientPage) {
    return (
      <div className="min-h-screen" style={{background: newBgColor}}>
        <style>{neumorphicStyles}</style>
        {children}
      </div>
    );
  }

  const navigationItems = isSuperAdmin ? adminNavigation : lojistaNavigation;

  const handleLogout = async () => {
    try {
      await base44.auth.logout();
    } catch (error) {
      console.error("Erro no logout:", error);
      // Forçar logout mesmo com erro
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen flex" style={{background: newBgColor}}>
      <style>{neumorphicStyles + sidebarStyles}</style>

      {/* Onboarding Manager - Gerencia toda a jornada de onboarding */}
      {currentUser && !isSuperAdmin && (
        <OnboardingManager 
          currentUser={currentUser} 
          currentLoja={currentLoja}
          onLojaCreated={handleLojaCreated}
        />
      )}

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`} style={{background: newBgColor}}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="neuro-button p-2 mr-3">
                <Gift className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-xl font-bold text-gray-800">Cupom.Moda</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden neuro-button p-2"
              title="Fechar Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 px-4 py-6">
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.url || (item.url.includes(currentPageName) && currentPageName);
                const IconComponent = item.icon;

                return (
                  <Link
                    key={item.title}
                    to={item.url}
                    className={`neuro-sidebar-item flex items-center px-4 py-3 text-gray-700 hover:text-gray-900 ${isActive ? 'active' : ''} relative`}
                    onClick={() => setSidebarOpen(false)}
                    title={item.title}
                  >
                    <IconComponent className="w-5 h-5 mr-3" />
                    {item.title}
                    {item.badge > 0 && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-gray-200">
            {currentUser && (
              <div className="neuro-card p-4">
                <div className="flex items-center">
                  <div className="neuro-button p-2 mr-3">
                    <Store className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {currentLoja?.nome || 'Sem loja'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {currentUser.full_name}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="neuro-button p-2 text-gray-600 hover:text-gray-800"
                    title="Sair"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 lg:ml-0">
        <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-white shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="neuro-button p-2 relative"
            title="Abrir Menu"
          >
            <Menu className="w-6 h-6" />
            {notificacoesCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {notificacoesCount}
              </span>
            )}
          </button>
          <h1 className="text-lg font-semibold text-gray-800">Cupom.Moda</h1>
          <div className="w-10" />
        </div>

        <main className="flex-1 p-6">
          {children}
        </main>
        </div>

        {/* Chatbot de Suporte - apenas para lojistas */}
        {currentUser && !isSuperAdmin && (
        <ChatbotButton currentUser={currentUser} />
        )}
        </div>
        );
        }