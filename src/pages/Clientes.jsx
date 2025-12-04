import React, { useState, useEffect, useMemo } from "react";
import { Resposta, Pesquisa, Loja, User } from "@/entities/all";
import { Search, MessageSquare, Send, Users, ShoppingCart, Phone, Target } from "lucide-react";
import { format } from 'date-fns';

import BaixarCupomModal from "../components/clientes/BaixarCupomModal";
import CampanhaModal from "../components/clientes/CampanhaModal";
import ConectarWhatsAppModal from "../components/clientes/ConectarWhatsAppModal";

const Clientes = () => {
    const [respostas, setRespostas] = useState([]);
    const [pesquisas, setPesquisas] = useState([]);
    const [lojas, setLojas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLoja, setSelectedLoja] = useState("");
    const [showBaixaModal, setShowBaixaModal] = useState(false);
    const [showCampanhaModal, setShowCampanhaModal] = useState(false);
    const [showConnectModal, setShowConnectModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [viewMode, setViewMode] = useState('leads');
    const [filterStatus, setFilterStatus] = useState('todos');
    const [selectedLeads, setSelectedLeads] = useState([]);
    const [whatsappConnected, setWhatsappConnected] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [user, respostasData, pesquisasData, lojasData] = await Promise.all([
                    User.me(),
                    Resposta.list("-created_date"),
                    Pesquisa.list(),
                    Loja.list()
                ]);
                setCurrentUser(user);
                setRespostas(respostasData);
                setPesquisas(pesquisasData);
                setLojas(lojasData);
                
                // Verificar se WhatsApp está conectado (simulado)
                const connected = localStorage.getItem('whatsapp_connected') === 'true';
                setWhatsappConnected(connected);
            } catch (error) {
                console.error("Erro ao carregar dados:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const stats = useMemo(() => {
        const totalLeads = respostas.length;
        const leadsComWhatsApp = respostas.filter(r => r.whatsapp).length;
        const cuponsGerados = respostas.filter(r => r.cupom_gerado).length;
        const cuponsUtilizados = respostas.filter(r => r.status_cupom === 'utilizado').length;
        const taxaConversao = cuponsGerados > 0 ? Math.round((cuponsUtilizados / cuponsGerados) * 100) : 0;

        return {
            totalLeads,
            leadsComWhatsApp,
            cuponsGerados,
            cuponsUtilizados,
            taxaConversao
        };
    }, [respostas]);

    const filteredData = useMemo(() => {
        let items = viewMode === 'vendas' 
            ? respostas.filter(r => r.status_cupom === 'utilizado') 
            : respostas;

        return items.filter(resposta => {
            const loja = lojas.find(l => pesquisas.find(p => p.id === resposta.pesquisa_id)?.loja_id === l.id);
            const searchMatch = (
                resposta.nome_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                resposta.email_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                resposta.cupom_gerado?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                resposta.cpf_cliente_baixa?.includes(searchTerm) ||
                resposta.whatsapp?.includes(searchTerm)
            );
            const lojaMatch = selectedLoja ? loja?.id === selectedLoja : true;
            
            let statusMatch = true;
            if (filterStatus === 'com_whatsapp') statusMatch = !!resposta.whatsapp;
            if (filterStatus === 'sem_whatsapp') statusMatch = !resposta.whatsapp;
            if (filterStatus === 'cupom_pendente') statusMatch = resposta.status_cupom === 'gerado';
            
            return searchMatch && lojaMatch && statusMatch;
        });
    }, [respostas, searchTerm, selectedLoja, lojas, pesquisas, viewMode, filterStatus]);

    const handleSelectLead = (leadId, checked) => {
        if (checked) {
            setSelectedLeads([...selectedLeads, leadId]);
        } else {
            setSelectedLeads(selectedLeads.filter(id => id !== leadId));
        }
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedLeads(filteredData.map(r => r.id));
        } else {
            setSelectedLeads([]);
        }
    };

    const handleSendWhatsapp = (whatsapp, nome) => {
        if (!whatsapp) {
            alert("Este lead não possui um número de WhatsApp cadastrado.");
            return;
        }
        const cleanedWhatsapp = whatsapp.replace(/\D/g, '');
        const clientName = nome || 'cliente';
        const message = `Olá ${clientName}, tudo bem?`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/55${cleanedWhatsapp}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleBaixarCupom = async (cupomCode, cpf) => {
        try {
            const respostaParaBaixar = await Resposta.filter({ cupom_gerado: cupomCode });
            if (respostaParaBaixar.length === 0) {
                alert("Cupom não encontrado.");
                return;
            }

            const resposta = respostaParaBaixar[0];
            if (resposta.status_cupom === 'utilizado') {
                alert(`Este cupom já foi utilizado em ${format(new Date(resposta.updated_date), 'dd/MM/yyyy')} por um cliente com CPF terminado em ${resposta.cpf_cliente_baixa.slice(-4)}.`);
                return;
            }

            await Resposta.update(resposta.id, {
                status_cupom: 'utilizado',
                cpf_cliente_baixa: cpf,
                usuario_baixa: currentUser?.email || 'Sistema'
            });

            alert("Cupom baixado com sucesso!");
            setShowBaixaModal(false);
            
            const [user, respostasData] = await Promise.all([User.me(), Resposta.list("-created_date")]);
            setCurrentUser(user);
            setRespostas(respostasData);
        } catch (error) {
            console.error("Erro ao baixar cupom:", error);
            alert("Erro ao baixar cupom. Tente novamente.");
        }
    };

    const handleCreateCampaign = (campaignData) => {
        console.log("Criando campanha:", campaignData);
        alert("Campanha criada com sucesso! Os leads selecionados receberão a mensagem.");
        setSelectedLeads([]);
        setShowCampanhaModal(false);
    };

    return (
        <div className="space-y-6">
            {/* Header com estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="neuro-card p-4">
                    <div className="flex items-center gap-3">
                        <Users className="w-8 h-8 text-blue-600" />
                        <div>
                            <p className="text-lg font-bold text-gray-800">{stats.totalLeads}</p>
                            <p className="text-sm text-gray-600">Total de Leads</p>
                        </div>
                    </div>
                </div>
                
                <div className="neuro-card p-4">
                    <div className="flex items-center gap-3">
                        <Phone className="w-8 h-8 text-green-600" />
                        <div>
                            <p className="text-lg font-bold text-gray-800">{stats.leadsComWhatsApp}</p>
                            <p className="text-sm text-gray-600">Com WhatsApp</p>
                        </div>
                    </div>
                </div>
                
                <div className="neuro-card p-4">
                    <div className="flex items-center gap-3">
                        <ShoppingCart className="w-8 h-8 text-purple-600" />
                        <div>
                            <p className="text-lg font-bold text-gray-800">{stats.cuponsUtilizados}</p>
                            <p className="text-sm text-gray-600">Vendas</p>
                        </div>
                    </div>
                </div>
                
                <div className="neuro-card p-4">
                    <div className="flex items-center gap-3">
                        <Target className="w-8 h-8 text-orange-600" />
                        <div>
                            <p className="text-lg font-bold text-gray-800">{stats.taxaConversao}%</p>
                            <p className="text-sm text-gray-600">Conversão</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Header principal */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Central de Leads</h1>
                    <p className="text-gray-600">Gerencie seus leads, envie campanhas e acompanhe vendas</p>
                </div>
                
                <div className="flex items-center gap-3">
                    {!whatsappConnected ? (
                        <button 
                            onClick={() => setShowConnectModal(true)}
                            className="neuro-button px-4 py-2 text-green-600 flex items-center gap-2"
                        >
                            <Phone className="w-4 h-4" />
                            Conectar WhatsApp
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 text-green-600 text-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            WhatsApp Conectado
                        </div>
                    )}
                    
                    <button 
                        onClick={() => setShowBaixaModal(true)}
                        className="neuro-button px-4 py-2 text-gray-800"
                    >
                        Baixar Cupom
                    </button>
                    
                    <button 
                        onClick={() => setShowCampanhaModal(true)}
                        disabled={selectedLeads.length === 0 || !whatsappConnected}
                        className="neuro-button pressed px-4 py-2 text-gray-800 flex items-center gap-2 disabled:opacity-50"
                    >
                        <Send className="w-4 h-4" />
                        Campanha ({selectedLeads.length})
                    </button>
                </div>
            </div>

            {/* Abas e filtros */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex space-x-1">
                    <button
                        onClick={() => setViewMode('leads')}
                        className={`neuro-button px-4 py-2 flex items-center gap-2 transition-all ${viewMode === 'leads' ? 'pressed text-blue-600' : 'text-gray-700'}`}
                    >
                        <Users className="w-4 h-4" /> Leads
                    </button>
                    <button
                        onClick={() => setViewMode('vendas')}
                        className={`neuro-button px-4 py-2 flex items-center gap-2 transition-all ${viewMode === 'vendas' ? 'pressed text-green-600' : 'text-gray-700'}`}
                    >
                        <ShoppingCart className="w-4 h-4" /> Vendas
                    </button>
                </div>
                
                <div className="flex gap-2">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="neuro-input px-3 py-2 text-sm"
                    >
                        <option value="todos">Todos</option>
                        <option value="com_whatsapp">Com WhatsApp</option>
                        <option value="sem_whatsapp">Sem WhatsApp</option>
                        <option value="cupom_pendente">Cupom Pendente</option>
                    </select>
                </div>
            </div>
            
            {/* Busca */}
            <div className="neuro-card p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                    <input
                        type="text"
                        placeholder="Buscar por nome, email, WhatsApp ou cupom..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="neuro-input w-full p-3 pl-10 text-gray-800"
                    />
                </div>
            </div>

            {/* Tabela de leads */}
            <div className="neuro-card p-4 overflow-x-auto">
                {loading ? (
                    <p className="text-center p-8">Carregando...</p>
                ) : viewMode === 'leads' ? (
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase border-b">
                            <tr>
                                <th className="p-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedLeads.length === filteredData.length && filteredData.length > 0}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        className="w-4 h-4"
                                    />
                                </th>
                                <th className="p-3">Cliente</th>
                                <th className="p-3">Contato</th>
                                <th className="p-3">Origem</th>
                                <th className="p-3">Cupom</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Data</th>
                                <th className="p-3">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map(resposta => {
                                const pesquisa = pesquisas.find(p => p.id === resposta.pesquisa_id);
                                const loja = lojas.find(l => l.id === pesquisa?.loja_id);
                                return (
                                    <tr key={resposta.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="p-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedLeads.includes(resposta.id)}
                                                onChange={(e) => handleSelectLead(resposta.id, e.target.checked)}
                                                className="w-4 h-4"
                                            />
                                        </td>
                                        <td className="p-3">
                                            <div>
                                                <p className="font-medium text-gray-900">{resposta.nome_cliente}</p>
                                                <p className="text-xs text-gray-500">{resposta.email_cliente}</p>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                {resposta.whatsapp ? (
                                                    <div className="flex items-center gap-1 text-green-600">
                                                        <Phone className="w-3 h-3" />
                                                        <span className="text-xs">{resposta.whatsapp}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">Sem WhatsApp</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <p className="text-xs font-medium">{pesquisa?.titulo || 'Cupom Direto'}</p>
                                            <p className="text-xs text-gray-500">{loja?.nome}</p>
                                        </td>
                                        <td className="p-3">
                                            {resposta.cupom_gerado ? (
                                                <span className="font-mono text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                                    {resposta.cupom_gerado}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400">Sem cupom</span>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                resposta.status_cupom === 'utilizado' ? 'bg-green-100 text-green-800' :
                                                resposta.status_cupom === 'gerado' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {resposta.status_cupom === 'utilizado' ? 'Convertido' :
                                                 resposta.status_cupom === 'gerado' ? 'Pendente' : 'Lead'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-xs">{format(new Date(resposta.created_date), 'dd/MM/yyyy')}</td>
                                        <td className="p-3">
                                            <button 
                                                onClick={() => handleSendWhatsapp(resposta.whatsapp, resposta.nome_cliente)}
                                                disabled={!resposta.whatsapp || !whatsappConnected}
                                                className="neuro-button p-2 text-green-600 hover:text-green-700 disabled:opacity-50"
                                            >
                                                <MessageSquare className="w-4 h-4"/>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase border-b">
                            <tr>
                                <th className="p-3">Cliente</th>
                                <th className="p-3">CPF</th>
                                <th className="p-3">Cupom</th>
                                <th className="p-3">Data da Venda</th>
                                <th className="p-3">Responsável</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map(resposta => (
                                <tr key={resposta.id} className="border-b border-gray-100">
                                    <td className="p-3 font-medium">{resposta.nome_cliente}</td>
                                    <td className="p-3 font-mono">{resposta.cpf_cliente_baixa}</td>
                                    <td className="p-3 font-mono text-purple-700">{resposta.cupom_gerado}</td>
                                    <td className="p-3">{format(new Date(resposta.updated_date), 'dd/MM/yyyy HH:mm')}</td>
                                    <td className="p-3 text-gray-600">{resposta.usuario_baixa}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                
                {filteredData.length === 0 && !loading && (
                    <p className="text-center p-8 text-gray-500">
                        {viewMode === 'leads' ? 'Nenhum lead encontrado.' : 'Nenhuma venda registrada.'}
                    </p>
                )}
            </div>

            {/* Modals */}
            {showBaixaModal && (
                <BaixarCupomModal
                    onClose={() => setShowBaixaModal(false)}
                    onConfirm={handleBaixarCupom}
                />
            )}

            {showCampanhaModal && (
                <CampanhaModal
                    onClose={() => setShowCampanhaModal(false)}
                    onSave={handleCreateCampaign}
                    selectedLeads={selectedLeads.length}
                    leadsData={filteredData.filter(r => selectedLeads.includes(r.id))}
                />
            )}

            {showConnectModal && (
                <ConectarWhatsAppModal
                    onClose={() => setShowConnectModal(false)}
                    onConnect={() => {
                        setWhatsappConnected(true);
                        localStorage.setItem('whatsapp_connected', 'true');
                        setShowConnectModal(false);
                    }}
                />
            )}
        </div>
    );
};

export default Clientes;