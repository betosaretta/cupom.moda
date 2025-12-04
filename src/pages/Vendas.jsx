
import React, { useState, useEffect, useMemo } from 'react';
import { Resposta, User, Cupom, Loja } from '@/entities/all';
import { Search, ShieldCheck, Download, ChevronDown, ChevronUp, User as UserIcon, MessageSquare, Filter } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import BaixarCupomModal from '../components/vendas/BaixarCupomModal';
import ExportacaoLGPDModal from '../components/lgpd/ExportacaoLGPDModal';
import { exportarClientes } from '@/functions/exportarClientes';

export default function Vendas() {
  const [leads, setLeads] = useState([]);
  const [cupons, setCupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBaixaModal, setShowBaixaModal] = useState(false);
  const [leadForAction, setLeadForAction] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'created_date', direction: 'desc' });
  const [showExportModal, setShowExportModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);
      if (user && user.loja_id) {
        const [respostas, cuponsData] = await Promise.all([
          Resposta.filter({ loja_id: user.loja_id }, '-created_date'),
          Cupom.filter({ loja_id: user.loja_id })
        ]);
        setLeads(respostas);
        setCupons(cuponsData);
      }
    } catch (error) {
      console.error("Erro de autenticação em Vendas, redirecionando para login:", error);
      await User.loginWithRedirect(window.location.href);
    } finally {
      setLoading(false);
    }
  };

  const handleBaixarCupom = async (codigo) => {
    try {
      const lead = leads.find(l => l.cupom_gerado === codigo);
      if (!lead) {
        alert("Cupom não encontrado.");
        return false;
      }
      if (lead.status_cupom === 'utilizado') {
        alert("Este cupom já foi utilizado.");
        return false;
      }
      const user = await User.me();
      await Resposta.update(lead.id, {
        status_cupom: 'utilizado',
        usuario_baixa: user.email,
        updated_date: new Date().toISOString()
      });
      alert("Cupom baixado com sucesso!");
      setShowBaixaModal(false);
      setLeadForAction(null);
      await loadData();
      return true;
    } catch (error) {
      console.error("Erro ao baixar cupom:", error);
      alert("Erro ao processar baixa do cupom.");
      return false;
    }
  };

  const handleExportRequest = () => {
    if (!currentUser?.loja_id) {
      alert("Você precisa ter uma loja cadastrada para exportar dados.");
      return;
    }

    const checkCNPJ = async () => {
      try {
        const lojas = await Loja.filter({ id: currentUser.loja_id });
        if (lojas.length === 0) {
          alert("Loja não encontrada.");
          return;
        }
        
        const loja = lojas[0];
        if (!loja.cnpj || loja.cnpj.trim() === '') {
          if (window.confirm("É necessário ter CNPJ cadastrado para exportar dados de clientes. Deseja ir para a página de configurações para cadastrar?")) {
            window.location.href = "/Configuracoes";
          }
          return;
        }
        
        setShowExportModal(true);
      } catch (error) {
        console.error("Erro ao verificar CNPJ:", error);
        alert("Erro ao verificar dados da loja.");
      }
    };
    
    checkCNPJ();
  };

  const handleExportConfirm = async () => {
    setShowExportModal(false);
    await handleExport();
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data } = await exportarClientes();
      const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `clientes-cupom-moda-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erro ao exportar clientes:", error);
      alert("Falha ao exportar dados.");
    } finally {
      setExporting(false);
    }
  };

  const handleOpenWhatsApp = (lead) => {
    const nome = lead.nome_cliente.split(' ')[0];
    const cupom = lead.cupom_gerado;
    let mensagem = `Olá, ${nome}! Tudo bem?`;
    if (cupom) {
        mensagem += ` Vimos que você gerou o cupom ${cupom} conosco.`;
    }
    const whatsappNumber = lead.whatsapp.startsWith('55') ? lead.whatsapp : `55${lead.whatsapp}`;
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  const sortedLeads = useMemo(() => {
    let sortableLeads = [...leads];

    // Apply search term filter
    if (searchTerm) {
      sortableLeads = sortableLeads.filter(lead =>
        lead.nome_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.whatsapp?.includes(searchTerm) ||
        lead.cupom_gerado?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      sortableLeads = sortableLeads.filter(lead => lead.status_cupom === filterStatus);
    }

    // Apply sorting
    if (sortConfig.key) {
      sortableLeads.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableLeads;
  }, [leads, searchTerm, filterStatus, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ChevronDown className="w-4 h-4 text-gray-400" />;
    return sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  const openBaixaModal = (lead) => {
    setLeadForAction(lead);
    setShowBaixaModal(true);
  };

  const getStatusChip = (status) => {
    const styles = {
      utilizado: 'bg-green-100 text-green-800',
      expirado: 'bg-red-100 text-red-800',
      gerado: 'bg-blue-100 text-blue-800',
    };
    const labels = {
      utilizado: 'Utilizado',
      expirado: 'Expirado',
      gerado: 'Ativo',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>{labels[status] || 'N/A'}</span>;
  };
  
  const getOrigemChip = (lead) => {
    if (lead.origem === 'pesquisa_nps') {
      return <span className="bg-purple-100 text-purple-800 px-2 py-1 text-xs font-medium rounded-full">Pesquisa ({lead.nota}/10)</span>;
    }
    if (lead.origem === 'campanha' && lead.cupom_id) {
      const cupomInfo = cupons.find(c => c.id === lead.cupom_id);
      return <span className="bg-orange-100 text-orange-800 px-2 py-1 text-xs font-medium rounded-full">{cupomInfo?.nome || 'Campanha'}</span>;
    }
    if (lead.origem === 'manual') {
      return <span className="bg-indigo-100 text-indigo-800 px-2 py-1 text-xs font-medium rounded-full">Manual</span>;
    }
    return <span className="bg-gray-100 text-gray-800 px-2 py-1 text-xs font-medium rounded-full">Desconhecida</span>;
  };

  if (loading) return <p className="text-center py-10">Carregando clientes...</p>;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Resgates de Cupons</h1>
          <p className="text-gray-600">Gerencie seus clientes, valide cupons e inicie conversas.</p>
        </div>

        <div className="neuro-card p-4 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome, contato, cupom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="neuro-input w-full p-3 pl-12 text-gray-800"
              />
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="neuro-button px-4 py-3 flex items-center justify-center gap-2 appearance-none pr-8 text-gray-800"
                  title="Filtrar por status do cupom"
                >
                  <option value="all">Todos os Status</option>
                  <option value="gerado">Ativo</option>
                  <option value="utilizado">Utilizado</option>
                  <option value="expirado">Expirado</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
              </div>

              <button 
                onClick={handleExportRequest} 
                className="neuro-button px-4 py-3 flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5 text-blue-600" />
                <span>Exportar Excel</span>
              </button>
            </div>
          </div>
        </div>

        <div className="neuro-card p-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="p-3 text-left cursor-pointer" onClick={() => requestSort('nome_cliente')}>
                    <div className="flex items-center gap-1">Cliente {getSortIcon('nome_cliente')}</div>
                  </th>
                  <th className="p-3 text-left">Cupom Gerado</th>
                  <th className="p-3 text-left cursor-pointer" onClick={() => requestSort('status_cupom')}>
                    <div className="flex items-center gap-1">Status {getSortIcon('status_cupom')}</div>
                  </th>
                  <th className="p-3 text-left">Origem</th>
                  <th className="p-3 text-left cursor-pointer" onClick={() => requestSort('created_date')}>
                    <div className="flex items-center gap-1">Data {getSortIcon('created_date')}</div>
                  </th>
                  <th className="p-3 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {sortedLeads.map(lead => (
                  <tr 
                    key={lead.id} 
                    className='border-b border-gray-100 hover:bg-gray-50'
                  >
                    <td className="p-3 font-medium text-gray-800">
                      <div>{lead.nome_cliente}</div>
                      <div className="text-xs text-gray-500">{lead.whatsapp}</div>
                    </td>
                    <td className="p-3 font-mono text-blue-600">{lead.cupom_gerado || '-'}</td>
                    <td className="p-3">{getStatusChip(lead.status_cupom)}</td>
                    <td className="p-3">{getOrigemChip(lead)}</td>
                    <td className="p-3 text-gray-600">{format(parseISO(lead.created_date), 'dd/MM/yy HH:mm')}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Tooltip delayDuration={200}>
                          <TooltipTrigger asChild>
                            <button 
                              onClick={() => handleOpenWhatsApp(lead)} 
                              className="neuro-button p-2 text-green-600 hover:bg-green-100"
                            >
                              <MessageSquare className="w-5 h-5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Abrir conversa no WhatsApp</p>
                          </TooltipContent>
                        </Tooltip>

                        {lead.cupom_gerado && lead.status_cupom === 'gerado' && (
                          <Tooltip delayDuration={200}>
                            <TooltipTrigger asChild>
                              <button 
                                onClick={() => openBaixaModal(lead)} 
                                className="neuro-button p-2 text-orange-600 hover:bg-orange-100"
                              >
                                <ShieldCheck className="w-4 h-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Resgatar/Dar baixa no cupom</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {sortedLeads.length === 0 && (
            <div className="text-center py-16">
              <UserIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700">Nenhum cliente encontrado</h3>
              <p className="text-gray-500 mt-2">Ajuste os filtros ou aguarde novas respostas de pesquisas.</p>
            </div>
          )}
        </div>

        {showBaixaModal && (
          <BaixarCupomModal
            onClose={() => setShowBaixaModal(false)}
            onConfirm={handleBaixarCupom}
            lead={leadForAction}
          />
        )}

        {showExportModal && (
          <ExportacaoLGPDModal
            onAccept={handleExportConfirm}
            onCancel={() => setShowExportModal(false)}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
