import React, { useState, useEffect } from 'react';
import { Loja, User, Assinatura } from '@/entities/all';
import { Plus, Edit, Store, CreditCard, Users } from 'lucide-react';

import CriarLojaModal from '../components/admin/CriarLojaModal';
import EditarLojaModal from '../components/admin/EditarLojaModal';

export default function AdminLojas() {
  const [lojas, setLojas] = useState([]);
  const [assinaturas, setAssinaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLoja, setEditingLoja] = useState(null);

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  const checkAdminAndLoadData = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
      
      if (user.role !== 'super_admin') {
        window.location.href = '/Dashboard';
        return;
      }
      
      await loadData();
    } catch (error) {
      console.error("Erro de autenticação:", error);
      window.location.href = '/Dashboard';
    }
  };

  const loadData = async () => {
    try {
      const [lojasData, assinaturasData] = await Promise.all([
        Loja.list("-created_date"),
        Assinatura.list()
      ]);
      setLojas(lojasData);
      setAssinaturas(assinaturasData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLoja = async (data) => {
    try {
      await Loja.create(data);
      await loadData();
      setShowCreateModal(false);
    } catch (error) {
      console.error("Erro ao criar loja:", error);
      alert("Erro ao criar loja. Tente novamente.");
    }
  };

  const handleEditLoja = (loja) => {
    setEditingLoja(loja);
    setShowEditModal(true);
  };

  const handleUpdateLoja = async (id, data) => {
    try {
      await Loja.update(id, data);
      await loadData();
      setShowEditModal(false);
      setEditingLoja(null);
    } catch (error) {
      console.error("Erro ao atualizar loja:", error);
      alert("Erro ao atualizar loja. Tente novamente.");
    }
  };

  const getLojaAssinatura = (lojaId) => {
    return assinaturas.find(a => a.loja_id === lojaId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ativa': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'vencida': return 'bg-red-100 text-red-800';
      case 'cancelada': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <p className="text-center py-8">Carregando lojas...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestão de Lojas</h1>
          <p className="text-gray-600">Gerencie todas as lojas e suas assinaturas</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="neuro-button px-6 py-3 text-gray-700 font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nova Loja
        </button>
      </div>

      {lojas.length === 0 ? (
        <div className="neuro-card p-12 text-center">
          <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhuma loja cadastrada</h3>
          <p className="text-gray-600 mb-6">Comece criando sua primeira loja no sistema</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="neuro-button px-6 py-3 text-gray-700 font-medium"
          >
            Criar Primeira Loja
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {lojas.map(loja => {
            const assinatura = getLojaAssinatura(loja.id);
            return (
              <div key={loja.id} className="neuro-card p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="neuro-button p-3">
                      <Store className="w-8 h-8 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">{loja.nome}</h3>
                      <p className="text-sm text-gray-500">Slug: {loja.slug}</p>
                      {loja.cnpj && (
                        <p className="text-sm text-gray-500">CNPJ: {loja.cnpj}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleEditLoja(loja)}
                    className="neuro-button p-3"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                </div>

                {assinatura ? (
                  <div className="neuro-card p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-800">Assinatura</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assinatura.status)}`}>
                        {assinatura.status.charAt(0).toUpperCase() + assinatura.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CreditCard className="w-4 h-4" />
                      <span>R$ {assinatura.valor_mensal.toFixed(2)}/mês</span>
                    </div>
                    {assinatura.data_vencimento && (
                      <p className="text-xs text-gray-500 mt-1">
                        Vence: {new Date(assinatura.data_vencimento).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="neuro-card p-4 mb-4 text-center">
                    <p className="text-sm text-gray-600 mb-2">Sem assinatura ativa</p>
                    <button className="neuro-button px-4 py-2 text-xs text-gray-700">
                      Criar Assinatura
                    </button>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Criada em {new Date(loja.created_date).toLocaleDateString('pt-BR')}</span>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>0 usuários</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <CriarLojaModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateLoja}
        />
      )}

      {showEditModal && editingLoja && (
        <EditarLojaModal
          loja={editingLoja}
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdateLoja}
        />
      )}
    </div>
  );
}