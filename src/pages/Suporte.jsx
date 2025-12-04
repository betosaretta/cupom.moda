import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Ticket, Plus, MessageSquare, Clock, CheckCircle,
  Send, Filter, HelpCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Suporte() {
  const [chamados, setChamados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [selectedChamado, setSelectedChamado] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  
  const [newTicket, setNewTicket] = useState({
    titulo: '',
    descricao: '',
    categoria: 'duvida',
    prioridade: 'media'
  });

  const loadData = useCallback(async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
      
      const chamadosData = await base44.entities.Chamado.filter(
        { user_id: user.id }, 
        '-created_date'
      );
      setChamados(chamadosData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    
    if (!newTicket.titulo.trim() || !newTicket.descricao.trim()) {
      alert('Preencha o título e a descrição do chamado.');
      return;
    }

    try {
      const chamado = await base44.entities.Chamado.create({
        ...newTicket,
        user_id: currentUser.id,
        loja_id: currentUser.loja_id || '',
        mensagens: [{
          autor: currentUser.id,
          autor_nome: currentUser.full_name,
          mensagem: newTicket.descricao,
          data: new Date().toISOString(),
          is_admin: false
        }]
      });

      setChamados([chamado, ...chamados]);
      setShowNewTicket(false);
      setNewTicket({ titulo: '', descricao: '', categoria: 'duvida', prioridade: 'media' });
      alert('Chamado aberto com sucesso! Nossa equipe responderá em breve.');
    } catch (error) {
      console.error('Erro ao criar chamado:', error);
      alert('Erro ao criar chamado. Tente novamente.');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChamado) return;

    try {
      const updatedMessages = [
        ...(selectedChamado.mensagens || []),
        {
          autor: currentUser.id,
          autor_nome: currentUser.full_name,
          mensagem: newMessage,
          data: new Date().toISOString(),
          is_admin: false
        }
      ];

      await base44.entities.Chamado.update(selectedChamado.id, {
        mensagens: updatedMessages,
        status: 'aberto'
      });

      setSelectedChamado({
        ...selectedChamado,
        mensagens: updatedMessages,
        status: 'aberto'
      });

      setChamados(chamados.map(c => 
        c.id === selectedChamado.id 
          ? { ...c, mensagens: updatedMessages, status: 'aberto' }
          : c
      ));

      setNewMessage('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem. Tente novamente.');
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
      case 'aguardando_usuario': return 'Aguardando Você';
      case 'resolvido': return 'Resolvido';
      case 'fechado': return 'Fechado';
      default: return status;
    }
  };

  const getCategoriaLabel = (cat) => {
    switch (cat) {
      case 'duvida': return 'Dúvida';
      case 'problema_tecnico': return 'Problema Técnico';
      case 'financeiro': return 'Financeiro';
      case 'sugestao': return 'Sugestão';
      case 'outros': return 'Outros';
      default: return cat;
    }
  };

  const filteredChamados = chamados.filter(c => 
    statusFilter === 'todos' || c.status === statusFilter
  );

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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Central de Suporte</h1>
          <p className="text-gray-600">Abra chamados e acompanhe suas solicitações.</p>
        </div>
        <button
          onClick={() => setShowNewTicket(true)}
          className="neuro-button pressed px-6 py-3 text-gray-800 font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Chamado
        </button>
      </div>

      {/* Cards de ajuda rápida */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to={createPageUrl('Ajuda')} className="neuro-card p-6 hover:shadow-lg transition-shadow">
          <HelpCircle className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="font-semibold text-gray-800 mb-1">Como Usar</h3>
          <p className="text-sm text-gray-600">Tutoriais e guias passo a passo</p>
        </Link>
        <div className="neuro-card p-6">
          <MessageSquare className="w-8 h-8 text-green-600 mb-3" />
          <h3 className="font-semibold text-gray-800 mb-1">Chat Online</h3>
          <p className="text-sm text-gray-600">Use o chat no canto inferior direito</p>
        </div>
        <div className="neuro-card p-6">
          <Clock className="w-8 h-8 text-purple-600 mb-3" />
          <h3 className="font-semibold text-gray-800 mb-1">Tempo de Resposta</h3>
          <p className="text-sm text-gray-600">Até 24 horas úteis</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="neuro-input p-2 text-sm"
          >
            <option value="todos">Todos os Status</option>
            <option value="aberto">Abertos</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="aguardando_usuario">Aguardando Você</option>
            <option value="resolvido">Resolvidos</option>
            <option value="fechado">Fechados</option>
          </select>
        </div>
        <span className="text-sm text-gray-500">
          {filteredChamados.length} chamado(s)
        </span>
      </div>

      {/* Lista de Chamados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista */}
        <div className="space-y-4">
          {filteredChamados.length === 0 ? (
            <div className="neuro-card p-12 text-center">
              <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Nenhum chamado encontrado</h3>
              <p className="text-gray-600 mb-4">Você ainda não abriu nenhum chamado de suporte.</p>
              <button
                onClick={() => setShowNewTicket(true)}
                className="neuro-button pressed px-6 py-3 text-gray-800 font-medium"
              >
                Abrir Primeiro Chamado
              </button>
            </div>
          ) : (
            filteredChamados.map(chamado => (
              <div
                key={chamado.id}
                onClick={() => setSelectedChamado(chamado)}
                className={`neuro-card p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedChamado?.id === chamado.id ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-800 flex-1">{chamado.titulo}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(chamado.status)}`}>
                    {getStatusLabel(chamado.status)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{chamado.descricao}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="bg-gray-100 px-2 py-1 rounded">{getCategoriaLabel(chamado.categoria)}</span>
                  <span>{format(new Date(chamado.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                </div>
                {chamado.mensagens && chamado.mensagens.length > 1 && (
                  <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {chamado.mensagens.length} mensagens
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Detalhes do Chamado */}
        {selectedChamado ? (
          <div className="neuro-card p-6 h-fit sticky top-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-800">{selectedChamado.titulo}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedChamado.status)}`}>
                    {getStatusLabel(selectedChamado.status)}
                  </span>
                  <span className="text-xs text-gray-500">
                    #{selectedChamado.id.slice(0, 8)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedChamado(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Mensagens */}
            <div className="space-y-3 max-h-80 overflow-y-auto mb-4 p-2">
              {selectedChamado.mensagens?.map((msg, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    msg.is_admin 
                      ? 'bg-blue-50 border-l-4 border-blue-500' 
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${msg.is_admin ? 'text-blue-700' : 'text-gray-700'}`}>
                      {msg.is_admin ? '👨‍💼 Suporte' : msg.autor_nome || 'Você'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {format(new Date(msg.data), "dd/MM HH:mm")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.mensagem}</p>
                </div>
              ))}
            </div>

            {/* Input de nova mensagem */}
            {selectedChamado.status !== 'fechado' && selectedChamado.status !== 'resolvido' && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Digite sua mensagem..."
                  className="neuro-input flex-1 p-3 text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="neuro-button pressed p-3 text-blue-600 disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            )}

            {(selectedChamado.status === 'resolvido' || selectedChamado.status === 'fechado') && (
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
                <p className="text-sm text-green-700">Este chamado foi {getStatusLabel(selectedChamado.status).toLowerCase()}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="neuro-card p-12 text-center h-fit">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Selecione um chamado para ver os detalhes</p>
          </div>
        )}
      </div>

      {/* Modal Novo Chamado */}
      {showNewTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="neuro-card p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Abrir Novo Chamado</h2>
            
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título do Chamado *
                </label>
                <input
                  type="text"
                  value={newTicket.titulo}
                  onChange={(e) => setNewTicket({ ...newTicket, titulo: e.target.value })}
                  placeholder="Resumo do problema ou dúvida"
                  className="neuro-input w-full p-3"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={newTicket.categoria}
                    onChange={(e) => setNewTicket({ ...newTicket, categoria: e.target.value })}
                    className="neuro-input w-full p-3"
                  >
                    <option value="duvida">Dúvida</option>
                    <option value="problema_tecnico">Problema Técnico</option>
                    <option value="financeiro">Financeiro</option>
                    <option value="sugestao">Sugestão</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioridade
                  </label>
                  <select
                    value={newTicket.prioridade}
                    onChange={(e) => setNewTicket({ ...newTicket, prioridade: e.target.value })}
                    className="neuro-input w-full p-3"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição Detalhada *
                </label>
                <textarea
                  value={newTicket.descricao}
                  onChange={(e) => setNewTicket({ ...newTicket, descricao: e.target.value })}
                  placeholder="Descreva com detalhes seu problema ou dúvida..."
                  className="neuro-input w-full p-3 h-32 resize-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewTicket(false)}
                  className="neuro-button flex-1 py-3 text-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="neuro-button pressed flex-1 py-3 text-gray-800 font-medium"
                >
                  Abrir Chamado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}