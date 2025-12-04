
import React, { useState, useEffect } from "react";
import { User } from "@/entities/all";
import { Settings, Key, Bell, Shield, Database } from "lucide-react";

export default function AdminConfiguracoes() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("geral");

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  const checkAdminAndLoadData = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
      
      // Changed 'user.role' to 'user.app_role' as per outline
      if (user.app_role !== 'super_admin') {
        window.location.href = '/Dashboard';
        return;
      }
    } catch (error) {
      console.error("Erro de autenticação:", error);
      window.location.href = '/Dashboard';
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "geral", label: "Geral", icon: Settings },
    { id: "api", label: "API Keys", icon: Key },
    { id: "notificacoes", label: "Notificações", icon: Bell },
    { id: "seguranca", label: "Segurança", icon: Shield },
    { id: "sistema", label: "Sistema", icon: Database }
  ];

  if (loading) {
    return <p className="text-center py-8">Carregando configurações...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Configurações do Sistema</h1>
        <p className="text-gray-600">Gerencie as configurações globais da plataforma</p>
      </div>

      <div className="flex space-x-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`neuro-button px-4 py-2 flex items-center gap-2 transition-all ${
              activeTab === tab.id ? 'pressed text-blue-600' : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="neuro-card p-8">
        {activeTab === "geral" && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Configurações Gerais</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Plataforma
                </label>
                <input
                  type="text"
                  defaultValue="NPS Manager"
                  className="neuro-input w-full p-3 text-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Base
                </label>
                <input
                  type="text"
                  defaultValue="https://npsmanager.com"
                  className="neuro-input w-full p-3 text-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email de Suporte
                </label>
                <input
                  type="email"
                  defaultValue="suporte@npsmanager.com"
                  className="neuro-input w-full p-3 text-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select className="neuro-input w-full p-3 text-gray-800">
                  <option value="America/Sao_Paulo">America/São Paulo</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === "api" && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Configurações de API</h3>
            
            <div className="space-y-4">
              <div className="neuro-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-800">Stripe API Key</h4>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                    Configurado
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Chave para processamento de pagamentos
                </p>
                <input
                  type="password"
                  placeholder="sk_live_..."
                  className="neuro-input w-full p-3 text-gray-800"
                />
              </div>

              <div className="neuro-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-800">SendGrid API Key</h4>
                  <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                    Pendente
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Para envio de emails automáticos
                </p>
                <input
                  type="password"
                  placeholder="SG..."
                  className="neuro-input w-full p-3 text-gray-800"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "notificacoes" && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Configurações de Notificações</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800">Notificações de Novos Usuários</h4>
                  <p className="text-sm text-gray-600">Receber email quando novos usuários se cadastrarem</p>
                </div>
                <label className="neuro-button p-1 cursor-pointer">
                  <input type="checkbox" className="sr-only" defaultChecked />
                  <div className="w-10 h-6 bg-blue-600 rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 transition-all"></div>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800">Alertas de Pagamento</h4>
                  <p className="text-sm text-gray-600">Notificar sobre falhas ou sucessos em pagamentos</p>
                </div>
                <label className="neuro-button p-1 cursor-pointer">
                  <input type="checkbox" className="sr-only" defaultChecked />
                  <div className="w-10 h-6 bg-blue-600 rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 transition-all"></div>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800">Relatórios Semanais</h4>
                  <p className="text-sm text-gray-600">Receber resumo semanal das métricas</p>
                </div>
                <label className="neuro-button p-1 cursor-pointer">
                  <input type="checkbox" className="sr-only" />
                  <div className="w-10 h-6 bg-gray-300 rounded-full relative">
                    <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 transition-all"></div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === "seguranca" && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Configurações de Segurança</h3>
            
            <div className="space-y-4">
              <div className="neuro-card p-4">
                <h4 className="font-medium text-gray-800 mb-2">Autenticação Dois Fatores</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Adicionar camada extra de segurança para admins
                </p>
                <button className="neuro-button px-4 py-2 text-gray-700">
                  Configurar 2FA
                </button>
              </div>

              <div className="neuro-card p-4">
                <h4 className="font-medium text-gray-800 mb-2">Sessões Ativas</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Gerenciar sessões de login ativas
                </p>
                <button className="neuro-button px-4 py-2 text-gray-700">
                  Ver Sessões
                </button>
              </div>

              <div className="neuro-card p-4">
                <h4 className="font-medium text-gray-800 mb-2">Logs de Acesso</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Histórico de acessos e ações no sistema
                </p>
                <button className="neuro-button px-4 py-2 text-gray-700">
                  Ver Logs
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "sistema" && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Informações do Sistema</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="neuro-card p-4">
                <h4 className="font-medium text-gray-800 mb-2">Versão</h4>
                <p className="text-lg font-mono text-gray-600">v1.0.0</p>
              </div>

              <div className="neuro-card p-4">
                <h4 className="font-medium text-gray-800 mb-2">Última Atualização</h4>
                <p className="text-lg text-gray-600">15/12/2024</p>
              </div>

              <div className="neuro-card p-4">
                <h4 className="font-medium text-gray-800 mb-2">Banco de Dados</h4>
                <p className="text-lg text-gray-600">PostgreSQL</p>
              </div>

              <div className="neuro-card p-4">
                <h4 className="font-medium text-gray-800 mb-2">Uptime</h4>
                <p className="text-lg text-green-600">99.9%</p>
              </div>
            </div>

            <div className="neuro-card p-4">
              <h4 className="font-medium text-gray-800 mb-3">Ações do Sistema</h4>
              <div className="flex gap-3">
                <button className="neuro-button px-4 py-2 text-gray-700">
                  Backup Manual
                </button>
                <button className="neuro-button px-4 py-2 text-gray-700">
                  Limpar Cache
                </button>
                <button className="neuro-button px-4 py-2 text-red-600">
                  Modo Manutenção
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-6 border-t border-gray-200">
          <button className="neuro-button pressed px-6 py-3 text-gray-800 font-medium">
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
}
