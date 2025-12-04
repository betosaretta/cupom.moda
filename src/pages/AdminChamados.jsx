import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { 
  Ticket, MessageSquare, Clock, CheckCircle, AlertCircle, Send, Search, User, Store, RefreshCw, AlertTriangle
} from 'lucide-react';

export default function AdminChamados() {
  const [chamados, setChamados] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [lojas, setLojas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedChamado, setSelectedChamado] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [chamadosData, usuariosData, lojasData] = await Promise.all([
        base44.entities.Chamado.list('-created_date'),
        base44.entities.User.list(),
        base44.entities.Loja.list()
      ]);
      
      setChamados(chamadosData);
      setUsuarios(usuariosData);
      setLojas(lojasData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkAdminAndLoadData = useCallback(async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
      
      const adminEmails = ["robertosaretta@gmail.com"];
      const isAdmin = user.app_role === 'super_admin' || adminEmails.includes(user.email);
      
      if (!isAdmin) {
        window.location.href = '/Dashboard';
        return;
      }
      
      await loadData();
    } catch (error) {
      console.error('Erro de autenticação:', error);
      window.location.href = '/Dashboard';
    }
  }, [loadData]);

  useEffect(() => {
    checkAdminAndLoadData();
  }, [checkAdminAndLoadData]);

  const getUserName = (userId) => {
    const user = usuarios.find(u => u.id === userId);
    return user?.full_name || 'Usuário não encontrado';
  };

  const getUserEmail = (userId) => {
    const user = usuarios.find(u => u.id === userId);
    return user?.email || '';
  };

  const getLojaName = (lojaId) => {
    const loja = lojas.find(l => l.id === lojaId);
    return loja?.nome || '-';
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChamado) return;

    try {
      const updatedMessages = [
        ...(selectedChamado.mensagens || []),
        {
          autor: currentUser.id,
          autor_nome: 'Suporte Cupom.Moda',
          mensagem: newMessage,
          data: new Date().toISOString(),
          is_admin: true
        }
      ];

      await base44.entities.Chamado.update(selectedChamado.id, {
        mensagens: updatedMessages,
        status: 'aguardando_usuario'
      });

      setSelectedChamado({
        ...selectedChamado,
        mensagens: updatedMessages,
        status: 'aguardando_usuario'
      });

      setChamados(chamados.map(c => 
        c.id === selectedChamado.id 
          ? { ...c, mensagens: updatedMessages, status: 'aguardando_usuario' }
          : c
      ));

      setNewMessage('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem.');
    }
  };

  const handleChangeStatus = async (chamadoId, newStatus) => {
    try {
      const updateData = { status: newStatus };
      
      if (newStatus === 'resolvido') {
        updateData.resolvido_em = new Date().toISOString();
        updateData.resolvido_por = currentUser.id;
      }

      await base44.entities.Chamado.update(chamadoId, updateData);

      setChamados(chamados.map(c => 
        c.id === chamadoId ? { ...c, ...updateData } : c
      ));

      if (selectedChamado?.id === chamadoId) {
        setSelectedChamado({ ...selectedChamado, ...updateData });
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      alert('Erro ao alterar status.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'aberto': return 'bg-blue-100 text-blue-800';
      case 'em_andamento': return 'bg-yellow-100 text-yellow-800';
      case 'aguardando_usuario': return 'bg-orange-100 text-orange-800';
      case 'resolvido': return 'bg-green-100 text-green-800';
      case 'fechado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'aberto': return 'Aberto';
      case 'em_andamento': return 'Em Andamento';
      case 'aguardando_usuario': return 'Aguardando Cliente';
      case 'resolvido': return 'Resolvido';
      case 'fechado': return 'Fechado';
      default: return status;
    }
  };

  const getPrioridadeColor = (prioridade) => {
    switch (prioridade) {
      case 'urgente': return 'text-red-600 bg-red-50';
      case 'alta': return 'text-orange-600 bg-orange-50';
      case 'media': return 'text-yellow-600 bg-yellow-50';
      case 'baixa': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredChamados = chamados.filter(c => {
    const statusMatch = statusFilter === 'todos' || c.status === statusFilter;
    const searchMatch = 
      c.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getUserName(c.user_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getUserEmail(c.user_id).toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  // Estatísticas
  const stats = {
    abertos: chamados.filter(c => c.status === 'aberto').length,
    emAndamento: chamados.filter(c => c.status === 'em_andamento').length,
    aguardando: chamados.filter(c => c.status === 'aguardando_usuario').length,
    resolvidos: chamados.filter(c => c.status === 'resolvido').length,
    urgentes: chamados.filter(c => c.prioridade === 'urgente' && c.status !== 'resolvido' && c.status !== 'fechado').length
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestão de Chamados</h1>
          <p className="text-gray-600">Responda e gerencie chamados de suporte dos clientes.</p>
        </div>
        <button
          onClick={loadData}
          className="neuro-button px-4 py-2 text-gray-700 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="neuro-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-gray-600">Abertos</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.abertos}</p>
        </div>
        <div className="neuro-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-yellow-500" />
            <span className="text-xs text-gray-600">Em Andamento</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{stats.emAndamento}</p>
        </div>
        <div className="neuro-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-gray-600">Aguardando</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">{stats.aguardando}</p>
        </div>
        <div className="neuro-card p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-xs text-gray-600">Resolvidos</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.resolvidos}</p>
        </div>
        <div className="neuro-card p-4 bg-red-50">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-xs text-gray-600">Urgentes</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.urgentes}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="neuro-card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por título, cliente..."
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
            <option value="aberto">Abertos</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="aguardando_usuario">Aguardando Cliente</option>
            <option value="resolvido">Resolvidos</option>
            <option value="fechado">Fechados</option>
          </select>
          <div className="text-right text-sm text-gray-600 flex items-center justify-end">
            {filteredChamados.length} chamado(s)
          </div>
        </div>
      </div>

      {/* Lista e Detalhes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {filteredChamados.length === 0 ? (
            <div className="neuro-card p-8 text-center">
              <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Nenhum chamado encontrado</p>
            </div>
          ) : (
            filteredChamados.map(chamado => (
              <div
                key={chamado.id}
                onClick={() => setSelectedChamado(chamado)}
                className={`neuro-card p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedChamado?.id === chamado.id ? 'ring-2 ring-blue-500' : ''
                } ${chamado.prioridade === 'urgente' ? 'border-l-4 border-red-500' : ''}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{chamado.titulo}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-600">{getUserName(chamado.user_id)}</span>
                      {chamado.loja_id && (
                        <>
                          <Store className="w-3 h-3 text-gray-400 ml-2" />
                          <span className="text-xs text-gray-600">{getLojaName(chamado.loja_id)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(chamado.status)}`}>
                      {getStatusLabel(chamado.status)}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${getPrioridadeColor(chamado.prioridade)}`}>
                      {chamado.prioridade}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                  <span>{format(new Date(chamado.created_date), "dd/MM/yyyy HH:mm")}</span>
                  {chamado.mensagens && chamado.mensagens.length > 1 && (
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {chamado.mensagens.length}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detalhes */}
        {selectedChamado ? (
          <div className="neuro-card p-6 h-fit sticky top-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-800">{selectedChamado.titulo}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {getUserName(selectedChamado.user_id)} • {getUserEmail(selectedChamado.user_id)}
                </p>
                {selectedChamado.loja_id && (
                  <p className="text-xs text-gray-500">Loja: {getLojaName(selectedChamado.loja_id)}</p>
                )}
              </div>
              <button onClick={() => setSelectedChamado(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            {/* Alterar Status */}
            <div className="mb-4 flex gap-2 flex-wrap">
              {['em_andamento', 'resolvido', 'fechado'].map(status => (
                <button
                  key={status}
                  onClick={() => handleChangeStatus(selectedChamado.id, status)}
                  disabled={selectedChamado.status === status}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    selectedChamado.status === status 
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Marcar como {getStatusLabel(status)}
                </button>
              ))}
            </div>

            {/* Mensagens */}
            <div className="space-y-3 max-h-64 overflow-y-auto mb-4 p-2 bg-gray-50 rounded-lg">
              {selectedChamado.mensagens?.map((msg, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    msg.is_admin 
                      ? 'bg-blue-50 border-l-4 border-blue-500' 
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${msg.is_admin ? 'text-blue-700' : 'text-gray-700'}`}>
                      {msg.is_admin ? '👨‍💼 Suporte' : msg.autor_nome || 'Cliente'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {format(new Date(msg.data), "dd/MM HH:mm")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.mensagem}</p>
                </div>
              ))}
            </div>

            {/* Input resposta */}
            {selectedChamado.status !== 'fechado' && (
              <div className="space-y-2">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite sua resposta..."
                  className="neuro-input w-full p-3 h-24 resize-none text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="neuro-button pressed w-full py-3 text-gray-800 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  Enviar Resposta
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="neuro-card p-12 text-center h-fit">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Selecione um chamado para responder</p>
          </div>
        )}
      </div>
    </div>
  );
}