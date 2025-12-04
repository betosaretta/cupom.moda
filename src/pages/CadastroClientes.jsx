
import React, { useState, useEffect } from 'react';
import { Resposta, User, Cupom } from '@/entities/all';
import { UserPlus, Gift, Users, Cake, Search, MessageSquare } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import CadastrarClienteComAniversarioModal from '../components/clientes/CadastrarClienteComAniversarioModal';
import EnviarCupomAniversarioModal from '../components/clientes/EnviarCupomAniversarioModal';
import GerarCupomClienteModal from '../components/clientes/GerarCupomClienteModal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function CadastroClientes() {
  const [activeTab, setActiveTab] = useState('cadastro');
  const [clientes, setClientes] = useState([]);
  const [aniversariantes, setAniversariantes] = useState([]);
  const [cupons, setCupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showCadastroModal, setShowCadastroModal] = useState(false);
  const [showCupomModal, setShowCupomModal] = useState(false);
  const [showGerarCupomModal, setShowGerarCupomModal] = useState(false);
  const [clienteForCupom, setClienteForCupom] = useState(null); // Used for actions from 'listagem' tab
  const [selectedClienteForCupom, setSelectedClienteForCupom] = useState(null); // Used for 'gerar_cupom' tab
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);
      
      if (user && user.loja_id) {
        const [clientesData, cuponsData] = await Promise.all([
          Resposta.filter({ loja_id: user.loja_id }, '-created_date'),
          Cupom.filter({ loja_id: user.loja_id, ativo: true })
        ]);
        
        setClientes(clientesData);
        setCupons(cuponsData);
        
        // Filtrar aniversariantes (hoje e próximos 30 dias)
        const hoje = new Date();
        const aniversariantesArray = [];
        
        clientesData.forEach(cliente => {
          if (cliente.data_aniversario) {
            // Parse da data considerando apenas dia e mês
            const [ano, mes, dia] = cliente.data_aniversario.split('-');
            const aniversarioEsteAno = new Date(hoje.getFullYear(), parseInt(mes) - 1, parseInt(dia));
            
            // Se já passou este ano, considerar o próximo ano
            if (aniversarioEsteAno < hoje) {
              aniversarioEsteAno.setFullYear(hoje.getFullYear() + 1);
            }
            
            const diffTime = aniversarioEsteAno.getTime() - hoje.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays >= 0 && diffDays <= 30) {
              aniversariantesArray.push({
                ...cliente,
                dias: diffDays,
                tipo: diffDays === 0 ? 'hoje' : 'proximo',
                data_aniversario_formatada: format(aniversarioEsteAno, 'dd/MM', { locale: ptBR })
              });
            }
          }
        });
        
        // Ordenar por proximidade do aniversário
        aniversariantesArray.sort((a, b) => a.dias - b.dias);
        setAniversariantes(aniversariantesArray);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCadastrarCliente = async (clienteData) => {
    try {
      const dataToSave = {
        ...clienteData,
        loja_id: currentUser.loja_id,
        origem: 'manual',
        navegador: 'Cadastro Manual'
      };

      await Resposta.create(dataToSave);
      await loadData();
      setShowCadastroModal(false);
      alert("Cliente cadastrado com sucesso!");
    } catch (error) {
      console.error("Erro ao cadastrar cliente:", error);
      alert("Erro ao cadastrar cliente. Tente novamente.");
    }
  };

  const handleEnviarCupomAniversario = (cliente) => {
    setClienteForCupom(cliente);
    setShowCupomModal(true);
  };

  // Used by 'listagem' tab
  const handleGerarCupomCliente = (cliente) => {
    setClienteForCupom(cliente);
    setShowGerarCupomModal(true);
  };

  // Used by 'gerar_cupom' tab
  const handleSelecionarClienteParaCupom = (cliente) => {
    setSelectedClienteForCupom(cliente);
    setShowGerarCupomModal(true);
  };

  const handleConfirmarEnvioCupom = async (cupomData, mensagemPersonalizada) => {
    try {
      // Gerar código único para o cupom de aniversário
      const timestamp = Date.now().toString();
      const random = Math.random().toString(36).substring(2, 4).toUpperCase();
      const codigoCupom = `PARABENS${timestamp.slice(-4)}${random}`;

      // Atualizar cliente com cupom de aniversário
      await Resposta.update(clienteForCupom.id, {
        cupom_aniversario: codigoCupom,
        cupom_aniversario_enviado_em: new Date().toISOString()
      });

      setShowCupomModal(false);
      setClienteForCupom(null);
      await loadData();
      
      // Preparar mensagem (personalizada ou padrão)
      let mensagem;
      if (mensagemPersonalizada?.trim()) {
        mensagem = mensagemPersonalizada.replace(/\[CÓDIGO_CUPOM\]/gi, `*${codigoCupom}*`);
      } else {
        mensagem = `🎉 Parabéns, ${clienteForCupom.nome_cliente.split(' ')[0]}! 

Hoje é seu dia especial e temos um presente para você! 🎁

Use o cupom: *${codigoCupom}*
${cupomData.tipo_desconto === 'percentual' ? cupomData.valor_desconto + '% de desconto' : 'R$ ' + cupomData.valor_desconto + ' de desconto'}

Válido por 30 dias. Venha nos visitar! ✨`;
      }

      const whatsappUrl = `https://wa.me/55${clienteForCupom.whatsapp}?text=${encodeURIComponent(mensagem)}`;
      window.open(whatsappUrl, '_blank');
      
    } catch (error) {
      console.error("Erro ao enviar cupom de aniversário:", error);
      alert("Erro ao processar cupom de aniversário.");
    }
  };

  const handleConfirmarGerarCupom = async (cupomData, mensagemPersonalizada) => {
    const targetCliente = selectedClienteForCupom || clienteForCupom;
    if (!targetCliente) {
      alert("Nenhum cliente selecionado para gerar cupom.");
      return;
    }

    try {
      // Criar um cupom temporário para gerar o código
      const cupomTemp = await Cupom.create({
        ...cupomData,
        loja_id: currentUser.loja_id,
        ativo: false // Não ativar como campanha regular
      });

      // Gerar código único
      const timestamp = Date.now().toString();
      const random = Math.random().toString(36).substring(2, 4).toUpperCase();
      const codigoCupom = `${cupomData.codigo_prefixo}${timestamp.slice(-4)}${random}`;

      // Criar registro de cupom para o cliente
      const leadData = {
        nome_cliente: targetCliente.nome_cliente,
        whatsapp: targetCliente.whatsapp,
        email_cliente: targetCliente.email_cliente || '',
        loja_id: currentUser.loja_id,
        cupom_id: cupomTemp.id,
        cupom_gerado: codigoCupom,
        origem: 'manual',
        navegador: 'Geração Manual para Cliente',
        comentario: `Cupom gerado para cliente - ${cupomData.observacao || 'Sem observação'}`
      };

      await Resposta.create(leadData);
      await loadData();
      setShowGerarCupomModal(false);
      setClienteForCupom(null);
      setSelectedClienteForCupom(null);

      // Abrir WhatsApp com mensagem do cupom
      let mensagem;
      if (mensagemPersonalizada?.trim()) {
        mensagem = mensagemPersonalizada.replace(/\[CÓDIGO_CUPOM\]/gi, `*${codigoCupom}*`);
      } else {
        mensagem = `Olá, ${targetCliente.nome_cliente.split(' ')[0]}! 

Temos um cupom especial para você! 🎁

Código: *${codigoCupom}*
${cupomData.tipo_desconto === 'percentual' ? cupomData.valor_desconto + '% de desconto' : 'R$ ' + cupomData.valor_desconto + ' de desconto'}

${cupomData.texto_cupom || 'Aproveite sua oferta especial!'}

Válido por ${cupomData.validade_dias} dias. Venha nos visitar! 🛍️`;
      }

      const whatsappUrl = `https://wa.me/55${targetCliente.whatsapp}?text=${encodeURIComponent(mensagem)}`;
      window.open(whatsappUrl, '_blank');
      
    } catch (error) {
      console.error("Erro ao gerar cupom:", error);
      alert("Erro ao gerar cupom. Tente novamente.");
    }
  };

  const handleOpenWhatsApp = (cliente) => {
    const nome = cliente.nome_cliente.split(' ')[0];
    const mensagem = `Olá, ${nome}! Tudo bem? Como posso te ajudar hoje?`;
    const whatsappNumber = cliente.whatsapp.startsWith('55') ? cliente.whatsapp : `55${cliente.whatsapp}`;
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  const clientesFiltrados = clientes.filter(cliente => 
    cliente.nome_cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.whatsapp?.includes(searchTerm) ||
    cliente.email_cliente?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: 'cadastro', label: 'Cadastro de Cliente', icon: UserPlus },
    { id: 'aniversariantes', label: 'Aniversariantes', icon: Cake },
    { id: 'listagem', label: 'Lista de Clientes', icon: Users },
    { id: 'gerar_cupom', label: 'Gerar Cupom', icon: Gift }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-xl text-gray-700">Carregando...</p>
      </div>
    );
  }

  const renderClientList = (isGerarCupomTab) => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">
          {isGerarCupomTab ? 'Selecionar Cliente para Gerar Cupom' : `Lista de Clientes (${clientesFiltrados.length})`}
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="neuro-input pl-10 pr-4 py-2 w-64"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-3 px-4 text-left">Cliente</th>
              <th className="py-3 px-4 text-left">Aniversário</th>
              <th className="py-3 px-4 text-left">Cadastrado em</th>
              {!isGerarCupomTab && <th className="py-3 px-4 text-left">Ações</th>}
              {isGerarCupomTab && <th className="py-3 px-4 text-left">Gerar Cupom</th>}
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.map(cliente => (
              <tr key={cliente.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div>
                    <p className="font-medium text-gray-800">{cliente.nome_cliente}</p>
                    <p className="text-xs text-gray-500">{cliente.whatsapp}</p>
                    {cliente.email_cliente && (
                      <p className="text-xs text-gray-500">{cliente.email_cliente}</p>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4">
                  {cliente.data_aniversario ? (
                    <span className="text-gray-700">
                      {format(parseISO(cliente.data_aniversario), 'dd/MM', { locale: ptBR })}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">Não informado</span>
                  )}
                </td>
                <td className="py-4 px-4 text-gray-600">
                  {format(parseISO(cliente.created_date), 'dd/MM/yy', { locale: ptBR })}
                </td>
                
                {!isGerarCupomTab && (
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleOpenWhatsApp(cliente)}
                            className="neuro-button p-2 text-green-600 hover:bg-green-100"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Enviar mensagem no WhatsApp</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </td>
                )}

                {isGerarCupomTab && (
                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleSelecionarClienteParaCupom(cliente)}
                      className="neuro-button pressed px-4 py-2 text-gray-800 font-medium flex items-center gap-2"
                    >
                      <Gift className="w-4 h-4" />
                      Gerar Cupom
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        
        {clientesFiltrados.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {isGerarCupomTab ? 'Nenhum cliente encontrado para gerar cupom.' : 'Nenhum cliente encontrado.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <TooltipProvider>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Clientes e Aniversários</h1>
          <p className="text-gray-600">Cadastre clientes, gerencie aniversários e envie cupons especiais</p>
        </div>

        {/* Navegação por Abas */}
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`neuro-button px-6 py-3 flex items-center gap-2 transition-all ${
                activeTab === tab.id ? 'pressed text-blue-600' : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Conteúdo das Abas */}
        <div className="neuro-card p-6">
          {activeTab === 'cadastro' && (
            <div className="text-center py-12">
              <UserPlus className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Cadastro de Novo Cliente</h3>
              <p className="text-gray-600 mb-8">
                Cadastre clientes manualmente incluindo data de aniversário para campanhas personalizadas
              </p>
              <button
                onClick={() => setShowCadastroModal(true)}
                className="neuro-button pressed px-8 py-4 text-gray-800 font-medium flex items-center gap-2 mx-auto"
              >
                <UserPlus className="w-5 h-5" />
                Cadastrar Novo Cliente
              </button>
            </div>
          )}

          {activeTab === 'aniversariantes' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  Aniversariantes ({aniversariantes.length})
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Cake className="w-4 h-4" />
                  <span>Próximos 30 dias</span>
                </div>
              </div>

              {aniversariantes.length === 0 ? (
                <div className="text-center py-12">
                  <Cake className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-700 mb-2">Nenhum aniversariante</h4>
                  <p className="text-gray-500">Não há clientes com aniversário nos próximos 30 dias.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aniversariantes.map(cliente => (
                    <div key={cliente.id} className={`neuro-button p-4 ${cliente.tipo === 'hoje' ? 'bg-yellow-50 border-2 border-yellow-200' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-800">{cliente.nome_cliente}</h4>
                          <p className="text-sm text-gray-600">{cliente.whatsapp}</p>
                          <div className="flex items-center gap-2 mt-2">
                            {cliente.tipo === 'hoje' ? (
                              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                                🎉 HOJE!
                              </span>
                            ) : (
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                em {cliente.dias} dia{cliente.dias > 1 ? 's' : ''}
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              {cliente.data_aniversario_formatada}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          {cliente.cupom_aniversario ? (
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium text-center">
                              Cupom Enviado
                            </span>
                          ) : (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => handleEnviarCupomAniversario(cliente)}
                                  className="neuro-button pressed px-3 py-2 text-xs font-medium flex items-center gap-1"
                                >
                                  <Gift className="w-3 h-3" />
                                  Cupom Aniversário
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Gerar cupom de aniversário personalizado</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => handleOpenWhatsApp(cliente)}
                                className="neuro-button px-3 py-2 text-xs font-medium flex items-center gap-1 text-green-600"
                              >
                                <MessageSquare className="w-3 h-3" />
                                Mensagem
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Enviar mensagem pelo WhatsApp</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'listagem' && renderClientList(false)}
          {activeTab === 'gerar_cupom' && renderClientList(true)}
        </div>

        {/* Modals */}
        {showCadastroModal && (
          <CadastrarClienteComAniversarioModal
            onClose={() => setShowCadastroModal(false)}
            onSave={handleCadastrarCliente}
          />
        )}

        {showCupomModal && clienteForCupom && (
          <EnviarCupomAniversarioModal
            cliente={clienteForCupom}
            onClose={() => setShowCupomModal(false)}
            onConfirm={handleConfirmarEnvioCupom}
          />
        )}

        {showGerarCupomModal && (selectedClienteForCupom || clienteForCupom) && (
          <GerarCupomClienteModal
            cliente={selectedClienteForCupom || clienteForCupom}
            onClose={() => {
              setShowGerarCupomModal(false);
              setSelectedClienteForCupom(null);
              setClienteForCupom(null); // Clear clienteForCupom in case it was used
            }}
            onSave={handleConfirmarGerarCupom}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
