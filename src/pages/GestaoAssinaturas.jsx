import React, { useState, useEffect } from "react";
import { Assinatura, Loja, User } from "@/entities/all";
import { CreditCard, Receipt, Plus, AlertCircle, CheckCircle, Clock } from "lucide-react";

export default function GestaoAssinaturas() {
  const [assinaturas, setAssinaturas] = useState([]);
  const [lojas, setLojas] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
      
      const [assinaturasData, lojasData] = await Promise.all([
        Assinatura.list("-created_date"),
        Loja.list()
      ]);
      
      setAssinaturas(assinaturasData);
      setLojas(lojasData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const calcularValorComDesconto = (numeroLojas) => {
    const valorBase = 119;
    if (numeroLojas === 1) return valorBase;
    
    // Primeira loja: R$ 119, demais: 30% de desconto
    const valorPrimeiraLoja = valorBase;
    const valorDemaisLojas = valorBase * 0.7; // 30% desconto
    
    return valorPrimeiraLoja + (valorDemaisLojas * (numeroLojas - 1));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ativa':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pendente':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'vencida':
      case 'cancelada':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ativa':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'vencida':
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalLojas = assinaturas.filter(a => a.status === 'ativa').length;
  const valorTotalMensal = calcularValorComDesconto(totalLojas);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestão de Assinaturas</h1>
          <p className="text-gray-600">Gerencie suas assinaturas e planos de pagamento</p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="neuro-button px-6 py-3 text-gray-700 font-medium hover:text-gray-900 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nova Assinatura
        </button>
      </div>

      {/* Resumo de Pagamento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="neuro-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="neuro-button p-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Lojas Ativas</h3>
              <p className="text-2xl font-bold text-green-600">{totalLojas}</p>
            </div>
          </div>
        </div>

        <div className="neuro-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="neuro-button p-3">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Valor Mensal</h3>
              <p className="text-2xl font-bold text-blue-600">R$ {valorTotalMensal.toFixed(2)}</p>
            </div>
          </div>
          {totalLojas > 1 && (
            <p className="text-xs text-green-600">
              ✓ Economizando R$ {((119 * totalLojas) - valorTotalMensal).toFixed(2)} por mês
            </p>
          )}
        </div>

        <div className="neuro-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="neuro-button p-3">
              <Receipt className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Economia Anual</h3>
              <p className="text-2xl font-bold text-purple-600">
                R$ {totalLojas > 1 ? (((119 * totalLojas) - valorTotalMensal) * 12).toFixed(2) : '0.00'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Assinaturas */}
      <div className="neuro-card p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Suas Assinaturas</h2>
        
        {loading ? (
          <p className="text-center py-8">Carregando assinaturas...</p>
        ) : assinaturas.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhuma assinatura ativa</h3>
            <p className="text-gray-600 mb-6">Comece criando sua primeira assinatura</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="neuro-button px-6 py-3 text-gray-700 font-medium"
            >
              Criar Primeira Assinatura
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {assinaturas.map((assinatura) => {
              const loja = lojas.find(l => l.id === assinatura.loja_id);
              return (
                <div key={assinatura.id} className="neuro-button p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(assinatura.status)}
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {loja?.nome || 'Loja sem nome'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        R$ {assinatura.valor_mensal.toFixed(2)}/mês
                        {assinatura.desconto_percentual > 0 && (
                          <span className="text-green-600 ml-2">
                            ({assinatura.desconto_percentual}% desconto)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(assinatura.status)}`}>
                      {assinatura.status.charAt(0).toUpperCase() + assinatura.status.slice(1)}
                    </span>
                    
                    <div className="text-right text-sm text-gray-600">
                      <p>Pagamento: {assinatura.forma_pagamento}</p>
                      {assinatura.data_vencimento && (
                        <p>Vence: {new Date(assinatura.data_vencimento).toLocaleDateString('pt-BR')}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tabela de Preços */}
      <div className="neuro-card p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Tabela de Preços</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Quantidade de Lojas</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Valor por Loja</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Total Mensal</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Economia</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map(num => {
                const total = calcularValorComDesconto(num);
                const economia = num > 1 ? (119 * num) - total : 0;
                return (
                  <tr key={num} className="border-b border-gray-100">
                    <td className="py-3 px-4">{num} {num === 1 ? 'loja' : 'lojas'}</td>
                    <td className="py-3 px-4">
                      {num === 1 ? 'R$ 119,00' : 'R$ 119,00 + R$ 83,30'}
                    </td>
                    <td className="py-3 px-4 font-semibold">R$ {total.toFixed(2)}</td>
                    <td className="py-3 px-4 text-green-600">
                      {economia > 0 ? `R$ ${economia.toFixed(2)}` : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}