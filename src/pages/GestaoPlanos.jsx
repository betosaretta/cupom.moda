import React, { useState, useEffect } from "react";
import { User, Loja, PlanoAssinatura, AssinaturaMultiLojas } from "@/entities/all";
import { 
  Store, 
  Plus, 
  Calculator, 
  Crown, 
  Check, 
  ArrowRight,
  Building,
  CreditCard,
  Zap
} from "lucide-react";

import CriarLojaModal from "../components/onboarding/CriarLojaModal";

export default function GestaoPlanos() {
  const [currentUser, setCurrentUser] = useState(null);
  const [lojas, setLojas] = useState([]);
  const [planos, setPlanos] = useState([]);
  const [assinaturaAtual, setAssinaturaAtual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateLojaModal, setShowCreateLojaModal] = useState(false);
  const [calculadora, setCalculadora] = useState({ quantidade: 1, valores: null });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [user, planosData] = await Promise.all([
        User.me(),
        PlanoAssinatura.filter({ ativo: true })
      ]);
      
      setCurrentUser(user);
      setPlanos(planosData);
      
      if (user.lojas_ids && user.lojas_ids.length > 0) {
        const lojasData = await Promise.all(
          user.lojas_ids.map(id => Loja.filter({ id }))
        );
        setLojas(lojasData.flat().filter(Boolean));
      } else if (user.loja_id) {
        const lojaData = await Loja.filter({ id: user.loja_id });
        setLojas(lojaData);
      }
      
      // Carregar assinatura atual
      const assinaturas = await AssinaturaMultiLojas.filter({ user_id: user.id });
      if (assinaturas.length > 0) {
        setAssinaturaAtual(assinaturas[0]);
      }
      
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const calcularValores = (quantidadeLojas) => {
    if (planos.length === 0) return null;
    
    const plano = planos[0]; // Assumindo um plano base
    const valorBase = plano.valor_base;
    const desconto = plano.desconto_loja_adicional || 20;
    
    let valorTotal = 0;
    let detalhamento = [];
    
    for (let i = 1; i <= quantidadeLojas; i++) {
      if (i === 1) {
        valorTotal += valorBase;
        detalhamento.push({
          loja: `Loja ${i}`,
          valor: valorBase,
          desconto: 0,
          valorFinal: valorBase
        });
      } else {
        const valorComDesconto = valorBase * (1 - desconto / 100);
        valorTotal += valorComDesconto;
        detalhamento.push({
          loja: `Loja ${i}`,
          valor: valorBase,
          desconto: desconto,
          valorFinal: valorComDesconto
        });
      }
    }
    
    return {
      valorTotal: valorTotal.toFixed(2),
      detalhamento,
      economia: quantidadeLojas > 1 ? ((quantidadeLojas - 1) * valorBase * (desconto / 100)).toFixed(2) : 0
    };
  };

  const handleCalculadora = (quantidade) => {
    const valores = calcularValores(quantidade);
    setCalculadora({ quantidade, valores });
  };

  const handleCreateLoja = async (lojaData) => {
    try {
      const newLoja = await Loja.create(lojaData);
      
      // Atualizar lista de lojas do usuário
      const novasLojasIds = [...(currentUser.lojas_ids || [currentUser.loja_id].filter(Boolean)), newLoja.id];
      await User.updateMyUserData({ 
        lojas_ids: novasLojasIds,
        loja_ativa_id: newLoja.id 
      });
      
      setShowCreateLojaModal(false);
      await loadData();
    } catch (error) {
      console.error("Erro ao criar loja:", error);
      alert("Erro ao criar loja. Tente novamente.");
    }
  };

  const handleUpgradePlano = async (novaQuantidade) => {
    try {
      // Aqui você implementaria a lógica de upgrade via Stripe
      // Por enquanto, apenas simular
      alert(`Redirecionando para pagamento de ${novaQuantidade} lojas...`);
    } catch (error) {
      console.error("Erro ao fazer upgrade:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestão de Planos Multi-Lojas</h1>
        <p className="text-gray-600">Gerencie suas lojas e otimize seus custos com nosso sistema multi-lojas</p>
      </div>

      {/* Status Atual */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="neuro-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="neuro-button p-3">
              <Store className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Lojas Ativas</h3>
              <p className="text-2xl font-bold text-blue-600">{lojas.length}</p>
            </div>
          </div>
        </div>

        <div className="neuro-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="neuro-button p-3">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Valor Mensal Atual</h3>
              <p className="text-2xl font-bold text-green-600">
                R$ {assinaturaAtual ? assinaturaAtual.valor_mensal_total : calcularValores(lojas.length)?.valorTotal || '149,00'}
              </p>
            </div>
          </div>
        </div>

        <div className="neuro-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="neuro-button p-3">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Economia Mensal</h3>
              <p className="text-2xl font-bold text-purple-600">
                R$ {calcularValores(lojas.length)?.economia || '0,00'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Lojas */}
      <div className="neuro-card p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Minhas Lojas ({lojas.length})</h3>
          <button
            onClick={() => setShowCreateLojaModal(true)}
            className="neuro-button pressed px-4 py-2 text-gray-800 font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Adicionar Loja
          </button>
        </div>

        {lojas.length === 0 ? (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhuma loja encontrada</h3>
            <p className="text-gray-600 mb-6">Crie sua primeira loja para começar</p>
            <button
              onClick={() => setShowCreateLojaModal(true)}
              className="neuro-button pressed px-6 py-3 text-gray-800 font-medium"
            >
              Criar Primeira Loja
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lojas.map((loja, index) => (
              <div key={loja.id} className="neuro-button p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{loja.nome}</h4>
                    <p className="text-sm text-gray-600 mb-2">{loja.slug}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        index === 0 ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {index === 0 ? 'Principal' : `20% OFF`}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">
                      R$ {index === 0 ? '149,00' : '119,20'}
                    </p>
                    <p className="text-xs text-gray-500">/mês</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Calculadora de Preços */}
      <div className="neuro-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="neuro-button p-3">
            <Calculator className="w-6 h-6 text-orange-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800">Calculadora de Preços</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantas lojas você precisa?
            </label>
            <div className="flex items-center gap-4 mb-4">
              <input
                type="range"
                min="1"
                max="20"
                value={calculadora.quantidade}
                onChange={(e) => handleCalculadora(parseInt(e.target.value))}
                className="flex-1"
              />
              <div className="neuro-button px-4 py-2 font-bold text-blue-600">
                {calculadora.quantidade} {calculadora.quantidade === 1 ? 'loja' : 'lojas'}
              </div>
            </div>

            {calculadora.valores && (
              <div className="space-y-4">
                <div className="neuro-card p-4 bg-green-50">
                  <div className="text-center">
                    <p className="text-sm text-green-600 mb-1">Valor Total Mensal</p>
                    <p className="text-3xl font-bold text-green-700">R$ {calculadora.valores.valorTotal}</p>
                    {calculadora.valores.economia > 0 && (
                      <p className="text-sm text-green-600 mt-1">
                        Economia de R$ {calculadora.valores.economia}/mês
                      </p>
                    )}
                  </div>
                </div>

                {calculadora.quantidade > lojas.length && (
                  <button
                    onClick={() => handleUpgradePlano(calculadora.quantidade)}
                    className="neuro-button pressed w-full py-3 text-gray-800 font-medium flex items-center justify-center gap-2"
                  >
                    <Crown className="w-5 h-5" />
                    Fazer Upgrade para {calculadora.quantidade} Lojas
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-4">Detalhamento dos Valores</h4>
            {calculadora.valores?.detalhamento.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-800">{item.loja}</p>
                  {item.desconto > 0 && (
                    <p className="text-xs text-green-600">{item.desconto}% de desconto</p>
                  )}
                </div>
                <div className="text-right">
                  {item.desconto > 0 && (
                    <p className="text-xs text-gray-400 line-through">R$ {item.valor.toFixed(2)}</p>
                  )}
                  <p className="font-bold text-gray-800">R$ {item.valorFinal.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vantagens do Multi-Lojas */}
      <div className="neuro-card p-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Vantagens do Sistema Multi-Lojas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 mt-1" />
            <div>
              <h4 className="font-medium text-gray-800">20% de Desconto</h4>
              <p className="text-sm text-gray-600">A partir da segunda loja, você paga 20% menos em cada loja adicional</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 mt-1" />
            <div>
              <h4 className="font-medium text-gray-800">Gestão Centralizada</h4>
              <p className="text-sm text-gray-600">Gerencie todas suas lojas em uma única conta</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 mt-1" />
            <div>
              <h4 className="font-medium text-gray-800">Relatórios Consolidados</h4>
              <p className="text-sm text-gray-600">Visualize performance de todas as lojas em dashboards unificados</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 mt-1" />
            <div>
              <h4 className="font-medium text-gray-800">Flexibilidade Total</h4>
              <p className="text-sm text-gray-600">Adicione ou remova lojas conforme sua necessidade</p>
            </div>
          </div>
        </div>
      </div>

      {showCreateLojaModal && (
        <CriarLojaModal
          onClose={() => setShowCreateLojaModal(false)}
          onSave={handleCreateLoja}
        />
      )}
    </div>
  );
}