
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Cupom, Resposta } from '@/entities/all';
import { Gift, CheckCircle, AlertTriangle, Loader, Copy } from 'lucide-react';

export default function CapturaLeadCupom() {
  const [searchParams] = useSearchParams();
  const cupomId = searchParams.get('cupomId');
  
  const [step, setStep] = useState('loading'); // 'loading', 'form', 'success', 'error'
  const [cupom, setCupom] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nome_cliente: '',
    whatsapp: '',
    email_cliente: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [generatedCupomInfo, setGeneratedCupomInfo] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!cupomId) {
      setError('Link inválido. Cupom não encontrado.');
      setStep('error');
      return;
    }
    loadCupom();
  }, [cupomId]);

  const loadCupom = async () => {
    try {
      const cupons = await Cupom.filter({ id: cupomId });
      if (cupons.length === 0) {
        setError('Cupom não encontrado ou inativo.');
        setStep('error');
        return;
      }

      const cupomData = cupons[0];
      if (!cupomData.ativo) {
        setError('Esta promoção não está mais disponível.');
        setStep('error');
        return;
      }

      setCupom(cupomData);
      setStep('form');
    } catch (error) {
      console.error('Erro ao carregar cupom:', error);
      setError('Erro ao carregar informações da oferta.');
      setStep('error');
    }
  };

  const generateCupomCode = (cupom) => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${cupom.codigo_prefixo}-${timestamp.slice(-4)}${random}`;
  };

  const validateForm = () => {
    if (!formData.nome_cliente.trim()) {
      setError('Por favor, informe seu nome.');
      return false;
    }
    if (!formData.whatsapp.trim()) {
      setError('Por favor, informe seu WhatsApp.');
      return false;
    }
    if (formData.whatsapp.replace(/\D/g, '').length < 10) {
      setError('Por favor, informe um WhatsApp válido.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      const cupomCode = generateCupomCode(cupom);
      
      const leadData = {
        nome_cliente: formData.nome_cliente.trim(),
        whatsapp: formData.whatsapp.replace(/\D/g, ''),
        email_cliente: formData.email_cliente.trim(),
        loja_id: cupom.loja_id,
        cupom_id: cupom.id,
        cupom_gerado: cupomCode,
        origem: 'campanha',
        navegador: navigator.userAgent || 'Desconhecido',
        status_cupom: 'gerado'
      };

      await Resposta.create(leadData);

      setGeneratedCupomInfo({
        code: cupomCode,
        validade: cupom.validade_dias,
        valor: cupom.valor_desconto,
        tipo: cupom.tipo_desconto,
      });

      setStep('success');
    } catch (error) {
      console.error('Erro ao registrar lead:', error);
      setError('Não foi possível registrar seu cupom. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando oferta...</p>
        </div>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="neuro-card p-8 max-w-md w-full text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Oferta Indisponível</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="neuro-button pressed px-6 py-3 text-gray-800 font-medium"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (step === 'success' && generatedCupomInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="neuro-card p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Cupom Resgatado com Sucesso!</h1>
          <p className="text-gray-600 mb-6">
            Apresente este código na loja para validar seu desconto.
          </p>

          <div className="neuro-card p-6 bg-white border-2 border-dashed border-blue-300">
            <p className="text-sm text-gray-500 mb-1">Seu desconto é de</p>
            <p className="text-4xl font-bold text-blue-600 mb-4">
              {generatedCupomInfo.valor}{generatedCupomInfo.tipo === 'percentual' ? '%' : 'R$'} OFF
            </p>
            
            <p className="text-sm text-gray-500 mb-2">Use o código abaixo:</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-mono font-bold text-gray-800 bg-gray-100 px-4 py-2 rounded-lg">
                {generatedCupomInfo.code}
              </span>
              <button 
                onClick={() => handleCopyCode(generatedCupomInfo.code)}
                className="neuro-button p-3"
              >
                {copied ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-gray-600" />}
              </button>
            </div>
          </div>
          
          <div className="mt-6">
            <p className="text-sm text-gray-600">
              Válido por <strong>{generatedCupomInfo.validade} dias</strong>.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Em breve você receberá os detalhes no seu WhatsApp.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="neuro-card p-8 max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="neuro-button p-4 inline-flex mb-4">
            <Gift className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{cupom?.nome}</h1>
          <div className="neuro-card p-4 bg-gradient-to-r from-blue-50 to-purple-50 mb-4">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {cupom?.valor_desconto}{cupom?.tipo_desconto === 'percentual' ? '%' : 'R$'} OFF
            </div>
            <p className="text-gray-600">{cupom?.texto_cupom}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo *
            </label>
            <input
              type="text"
              required
              value={formData.nome_cliente}
              onChange={(e) => setFormData({...formData, nome_cliente: e.target.value})}
              className="neuro-input w-full p-4 text-gray-800 placeholder-gray-500"
              placeholder="Seu nome completo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp *
            </label>
            <input
              type="tel"
              required
              value={formData.whatsapp}
              onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
              className="neuro-input w-full p-4 text-gray-800 placeholder-gray-500"
              placeholder="(11) 99999-9999"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-mail (opcional)
            </label>
            <input
              type="email"
              value={formData.email_cliente}
              onChange={(e) => setFormData({...formData, email_cliente: e.target.value})}
              className="neuro-input w-full p-4 text-gray-800 placeholder-gray-500"
              placeholder="seu@email.com"
            />
          </div>

          {error && (
            <div className="neuro-card p-4 bg-red-50">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="neuro-button pressed w-full py-4 text-gray-800 font-medium text-lg disabled:opacity-50"
          >
            {submitting ? 'Gerando Cupom...' : 'Quero Meu Cupom!'}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Válido por {cupom?.validade_dias} dias após a geração.
            {cupom?.minimo_compra > 0 && ` Compra mínima: R$ ${cupom.minimo_compra.toFixed(2)}.`}
          </p>
        </form>
      </div>
    </div>
  );
}
