import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Resposta } from '@/entities/Resposta';
import { Cupom } from '@/entities/Cupom';
import { CheckCircle, Gift, Download, Scissors, AlertCircle, Loader2 } from 'lucide-react';

export default function Sucesso() {
  const [cupomGerado, setCupomGerado] = useState(null);
  const [cupomInfo, setCupomInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const codigoCupom = params.get('cupom');
    
    if (codigoCupom) {
      loadCupomData(codigoCupom);
    } else {
      setError("Código do cupom não encontrado.");
      setLoading(false);
    }
  }, [location.search]);

  const loadCupomData = async (codigo) => {
    setLoading(true);
    setError('');
    try {
      const respostas = await Resposta.filter({ cupom_gerado: codigo });
      if (respostas.length === 0) {
        throw new Error("Cupom inválido ou não encontrado.");
      }
      
      const resposta = respostas[0];
      setCupomGerado(resposta);

      if (resposta.cupom_id) {
        const cupons = await Cupom.filter({ id: resposta.cupom_id });
        if (cupons.length > 0) {
          setCupomInfo(cupons[0]);
        } else {
          throw new Error("Informações do cupom não encontradas.");
        }
      } else {
        throw new Error("Este cupom não tem informações de campanha associadas.");
      }
    } catch (err) {
      console.error("Erro ao carregar dados do cupom:", err);
      setError(err.message || "Ocorreu um erro ao buscar seu cupom.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="neuro-card p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Erro ao Carregar Cupom</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 print:bg-white">
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; }
          .no-print { display: none; }
        }
      `}</style>
      <div className="neuro-card p-6 sm:p-8 max-w-md w-full text-center print:shadow-none print:border">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Obrigado pela sua resposta!</h1>
        <p className="text-gray-600 mb-6 sm:mb-8">Seu cupom de desconto exclusivo está pronto.</p>

        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-white relative">
          <Scissors className="absolute -top-3 -left-3 bg-gray-50 p-1 rounded-full w-8 h-8 text-gray-500" />
          <Scissors className="absolute -top-3 -right-3 bg-gray-50 p-1 rounded-full w-8 h-8 text-gray-500" />
          <Gift className="w-12 h-12 text-orange-500 mx-auto mb-3" />
          
          <p className="text-sm text-gray-500">{cupomInfo?.nome}</p>
          <p className="text-4xl sm:text-5xl font-extrabold text-blue-600 my-2 tracking-wider">{cupomGerado?.cupom_gerado}</p>

          <div className="text-lg font-semibold text-gray-700">
            {cupomInfo?.valor_desconto}
            {cupomInfo?.tipo_desconto === 'percentual' ? '%' : ' R$'} de Desconto
          </div>
          
          {cupomInfo?.texto_cupom && (
             <p className="text-sm text-gray-600 mt-2">{cupomInfo.texto_cupom}</p>
          )}
        </div>

        <div className="text-left text-sm text-gray-500 mt-6 space-y-1">
            <p>• <strong>Cliente:</strong> {cupomGerado?.nome_cliente}</p>
            <p>• <strong>Validade:</strong> {cupomInfo?.validade_dias} dias a partir de hoje.</p>
            {cupomInfo?.minimo_compra > 0 && <p>• <strong>Compra Mínima:</strong> R$ {cupomInfo?.minimo_compra.toFixed(2)}</p>}
            <p>• Apresente este cupom (impresso ou no celular) no caixa para validar.</p>
        </div>

        <div className="mt-8 no-print">
          <button 
            onClick={handlePrint}
            className="neuro-button pressed w-full py-3 text-gray-800 font-medium flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Salvar ou Imprimir Cupom
          </button>
        </div>
      </div>
    </div>
  );
}