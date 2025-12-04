
import React, { useState, useEffect, useCallback } from 'react';
import { User, Loja } from '@/entities/all';
import { Plus, Edit, Users, Shield, UserCheck, AlertTriangle } from 'lucide-react';

import ConvidarUsuarioModal from '../components/admin/ConvidarUsuarioModal';
import EditarUsuarioModal from '../components/admin/EditarUsuarioModal';

export default function AdminClientes() {
  const [clientes, setClientes] = useState([]);
  const [lojas, setLojas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [usuariosData, lojasData] = await Promise.all([
        User.list("-created_date"),
        Loja.list()
      ]);
      setClientes(usuariosData);
      setLojas(lojasData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  }, []); // Dependencies are stable setters, so empty array is appropriate

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
      
      await loadData();
    } catch (error) {
      console.error("Erro de autenticação em AdminClientes, redirecionando para login:", error);
      await User.loginWithRedirect(window.location.href);
    } finally {
      setLoading(false);
    }
  }, [loadData]); // Depends on loadData

  useEffect(() => {
    checkAdminAndLoadData();
  }, [checkAdminAndLoadData]); // Depends on checkAdminAndLoadData

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async (id, data) => {
    try {
      await User.update(id, data);
      await loadData(); // loadData is now stable due to useCallback
      setShowEditModal(false);
      setEditingUser(null);
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      alert("Erro ao atualizar cliente. Tente novamente.");
    }
  };

  const getLojaName = (lojaId) => {
    const loja = lojas.find(l => l.id === lojaId);
    return loja ? loja.nome : 'Sem loja';
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      case 'loja_admin': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'loja_admin': return 'Admin Loja';
      default: return 'Cliente';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestão de Clientes</h1>
          <p className="text-gray-600">Gerencie clientes e permissões do sistema</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="neuro-button px-6 py-3 text-gray-700 font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Convidar Cliente
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="neuro-card p-6">
          <div className="flex items-center gap-3">
            <div className="neuro-button p-3">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Clientes</p>
              <p className="text-2xl font-bold text-gray-800">{clientes.length}</p>
            </div>
          </div>
        </div>

        <div className="neuro-card p-6">
          <div className="flex items-center gap-3">
            <div className="neuro-button p-3">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Super Admins</p>
              <p className="text-2xl font-bold text-gray-800">
                {clientes.filter(u => u.app_role === 'super_admin').length}
              </p>
            </div>
          </div>
        </div>

        <div className="neuro-card p-6">
          <div className="flex items-center gap-3">
            <div className="neuro-button p-3">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Admins de Loja</p>
              <p className="text-2xl font-bold text-gray-800">
                {clientes.filter(u => u.app_role === 'loja_admin').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Clientes */}
      <div className="neuro-card p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Lista de Clientes</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-left font-semibold text-gray-600">Cliente</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-600">Loja Associada</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-600">Nível</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-600">Data Cadastro</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map(usuario => (
                <tr key={usuario.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-800">{usuario.full_name}</div>
                    <div className="text-xs text-gray-500">{usuario.email}</div>
                  </td>
                  <td className="py-4 px-4">
                    {usuario.loja_id ? (
                      <span className="text-gray-700">{getLojaName(usuario.loja_id)}</span>
                    ) : (
                      <span className="flex items-center gap-2 text-red-600 font-semibold text-xs bg-red-100 px-2 py-1 rounded-md">
                        <AlertTriangle className="w-4 h-4" />
                        Sem loja associada
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(usuario.app_role)}`}>
                      {getRoleLabel(usuario.app_role)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {new Date(usuario.created_date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleEditUser(usuario)}
                      className="neuro-button p-2 text-gray-600 hover:text-gray-800"
                      title="Editar Usuário"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showInviteModal && (
        <ConvidarUsuarioModal
          onClose={() => setShowInviteModal(false)}
          lojas={lojas}
          onRefresh={loadData}
        />
      )}

      {showEditModal && editingUser && (
        <EditarUsuarioModal
          user={editingUser}
          lojas={lojas}
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdateUser}
        />
      )}
    </div>
  );
}
