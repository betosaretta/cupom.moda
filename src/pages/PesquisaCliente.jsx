import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Pesquisa } from "@/entities/Pesquisa";
import { Cupom } from "@/entities/Cupom";
import { Resposta } from "@/entities/Resposta";
import { Loja } from "@/entities/Loja";
import { Send, CheckCircle, Gift, MessageSquare } from "lucide-react";

const newBgColor = '#f8fafc';
const newDarkShadow = '#e2e8f0';
const newLightShadow = '#ffffff';

const neumorphicStyles = `
  .neuro-card {
    background: ${newBgColor};
    border-radius: 20px;
    box-shadow: 
      8px 8px 16px ${newDarkShadow},
      -8px -8px 16px ${newLightShadow};
  }
  
  .neuro-button {
    background: ${newBgColor};
    border: none;
    border-radius: 15px;
    box-shadow: 
      6px 6px 12px ${newDarkShadow},
      -6px -6px 12px ${newLightShadow};
    transition: all 0.2s ease;
  }
  
  .neuro-button:hover {
    box-shadow: 
      4px 4px 8px ${newDarkShadow},
      -4px -4px 8px ${newLightShadow};
  }
  
  .neuro-button:active,
  .neuro-button.pressed {
    box-shadow: 
      inset 4px 4px 8px ${newDarkShadow},
      inset -4px -4px 8px ${newLightShadow};
  }
  
  .neuro-input {
    background: ${newBgColor};
    border: none;
    border-radius: 12px;
    box-shadow: 
      inset 4px 4px 8px ${newDarkShadow},
      inset -4px -4px 8px ${newLightShadow};
  }
`;

const validateWhatsApp = (whatsapp) => {
  const cleaned = whatsapp.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
};

export default function PesquisaCliente() {
  const location = useLocation();
  const navigate = useNavigate();
  const [pesquisa, setPesquisa] = useState(null);
  const [cupom, setCupom] = useState(null);
  const [loja, setLoja] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nome_cliente: '',
    whatsapp: '',
    email_cliente: '',
    nota: null,
    comentario: '',
    respostas_extras: []
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pesquisaId = params.get("id");
    
    if (pesquisaId) {
      loadPesquisaData(pesquisaId);
    } else {
      setError("ID da pesquisa não fornecido.");
      setLoading(false);
    }
  }, [location.search]);

  useEffect(() => {
    if (pesquisa?.perguntas_extras?.length > 0) {
      setFormData(prev => ({
        ...prev,
        respostas_extras: pesquisa.perguntas_extras.map(q => ({ 
          pergunta_id: q.id, 
          resposta: '' 
        }))
      }));
    }
  }, [pesquisa]);
  
  const handleExtraAnswerChange = (perguntaId, resposta) => {
    setFormData(prev => ({
      ...prev,
      respostas_extras: prev.respostas_extras.map(r => 
        r.pergunta_id === perguntaId ? { ...r, resposta } : r
      )
    }));
  };

  const loadPesquisaData = async (pesquisaId) => {
    try {
      const pesquisas = await Pesquisa.filter({ id: pesquisaId });
      if (pesquisas.length === 0) {
        throw new Error("Pesquisa não encontrada.");
      }
      
      const pesquisaData = pesquisas[0];
      
      if (!pesquisaData.ativa) {
        setError("Esta pesquisa não está mais ativa.");
        setLoading(false);
        return;
      }
      
      setPesquisa(pesquisaData);

      // Carregar dados da loja
      if (pesquisaData.loja_id) {
        try {
          const lojas = await Loja.filter({ id: pesquisaData.loja_id });
          if (lojas.length > 0) {
            setLoja(lojas[0]);
          }
        } catch (lojaError) {
          console.warn("Erro ao carregar loja:", lojaError);
        }
      }

      // Carregar cupom apenas se oferece cupom E tem cupom_id
      if (pesquisaData.oferecer_cupom && pesquisaData.cupom_id) {
        try {
          const cupons = await Cupom.filter({ id: pesquisaData.cupom_id });
          if (cupons.length > 0 && cupons[0].ativo) {
            setCupom(cupons[0]);
          }
        } catch (cupomError) {
          console.warn("Erro ao carregar cupom:", cupomError);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar pesquisa:", error);
      setError("Erro ao carregar pesquisa. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const generateCupomCode = (cupom) => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    const prefix = cupom.codigo_prefixo || 'CUPOM';
    return `${prefix}-${random}${timestamp}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (!validateWhatsApp(formData.whatsapp)) {
      setError('Por favor, insira um número de WhatsApp válido.');
      setSubmitting(false);
      return;
    }

    if (formData.nota === null) {
      setError('Por favor, selecione uma nota de 0 a 10.');
      setSubmitting(false);
      return;
    }
    
    try {
      const notaFinal = parseInt(formData.nota, 10);
      let cupomGerado = null;
      
      // Se a pesquisa oferece cupom e há um cupom válido, gerar código
      if (pesquisa.oferecer_cupom && cupom) {
        cupomGerado = generateCupomCode(cupom);
      }
      
      const dataToSave = {
        ...formData,
        nota: notaFinal,
        pesquisa_id: pesquisa.id,
        loja_id: pesquisa.loja_id,
        cupom_id: cupom?.id || null,
        cupom_gerado: cupomGerado,
        navegador: navigator.userAgent,
        origem: 'pesquisa_nps',
        categoria_nps: notaFinal >= 9 ? 'promotor' : notaFinal <= 6 ? 'detrator' : 'neutro',
      };

      await Resposta.create(dataToSave);
      
      // Redirecionar com cupom se foi gerado
      if (cupomGerado) {
        navigate(`/Sucesso?cupom=${cupomGerado}`);
      } else {
        setStep(2);
      }
    } catch (err) {
      console.error("Erro ao enviar resposta:", err);
      setError('Erro ao enviar resposta. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderNpsButtons = () => {
    return (
      <div className="space-y-4">
        <label className="block text-lg font-medium text-gray-800 text-center">
          {pesquisa.pergunta_principal}
        </label>
        <div className="grid grid-cols-6 gap-2 md:grid-cols-11">
          {[...Array(11)].map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setFormData({...formData, nota: i})}
              className={`neuro-button h-12 w-full flex items-center justify-center text-lg font-bold transition-all ${
                formData.nota === i 
                  ? 'pressed text-blue-600' 
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              {i}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Não recomendaria</span>
          <span>Recomendaria totalmente</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: newBgColor}}>
        <style>{neumorphicStyles}</style>
        <div className="neuro-card p-8 max-w-md w-full mx-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando pesquisa...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: newBgColor}}>
        <style>{neumorphicStyles}</style>
        <div className="neuro-card p-8 max-w-md w-full mx-4 text-center">
          <div className="text-red-600 mb-4">
            <MessageSquare className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-xl font-bold">Ops!</h2>
          </div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: newBgColor}}>
        <style>{neumorphicStyles}</style>
        <div className="neuro-card p-8 max-w-md w-full mx-4 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Obrigado!</h2>
          <p className="text-gray-600">
            Sua resposta foi registrada com sucesso. Agradecemos seu feedback!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8" style={{background: newBgColor}}>
      <style>{neumorphicStyles}</style>
      <div className="max-w-2xl mx-auto px-4">
        <div className="neuro-card p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{pesquisa.titulo}</h1>
            {loja && (
              <p className="text-gray-600">por {loja.nome}</p>
            )}
          </div>

          {cupom && (
            <div className="neuro-card p-4 mb-6 text-center">
              <Gift className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-sm text-gray-700">
                Complete esta pesquisa e ganhe um cupom de desconto!
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome_cliente}
                  onChange={(e) => setFormData({...formData, nome_cliente: e.target.value})}
                  className="neuro-input w-full p-3 text-gray-800"
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
                  className="neuro-input w-full p-3 text-gray-800"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (opcional)
              </label>
              <input
                type="email"
                value={formData.email_cliente}
                onChange={(e) => setFormData({...formData, email_cliente: e.target.value})}
                className="neuro-input w-full p-3 text-gray-800"
                placeholder="seu@email.com"
              />
            </div>

            <div className="neuro-card p-6">
              {renderNpsButtons()}
            </div>

            {pesquisa.pergunta_adicional && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {pesquisa.pergunta_adicional}
                </label>
                <textarea
                  value={formData.comentario}
                  onChange={(e) => setFormData({...formData, comentario: e.target.value})}
                  className="neuro-input w-full p-3 text-gray-800 h-24 resize-none"
                  placeholder="Compartilhe seus comentários..."
                />
              </div>
            )}

            {pesquisa.perguntas_extras?.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800">Mais algumas perguntas:</h3>
                {pesquisa.perguntas_extras.map((pergunta) => (
                  <div key={pergunta.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {pergunta.texto}
                    </label>
                    {pergunta.tipo === 'texto_longo' ? (
                      <textarea
                        value={formData.respostas_extras.find(r => r.pergunta_id === pergunta.id)?.resposta || ''}
                        onChange={(e) => handleExtraAnswerChange(pergunta.id, e.target.value)}
                        className="neuro-input w-full p-3 text-gray-800 h-24 resize-none"
                        placeholder="Sua resposta..."
                      />
                    ) : (
                      <input
                        type="text"
                        value={formData.respostas_extras.find(r => r.pergunta_id === pergunta.id)?.resposta || ''}
                        onChange={(e) => handleExtraAnswerChange(pergunta.id, e.target.value)}
                        className="neuro-input w-full p-3 text-gray-800"
                        placeholder="Sua resposta..."
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="neuro-card p-4 bg-red-50 text-center">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="neuro-button pressed w-full py-4 text-gray-800 font-medium text-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              {submitting ? "Enviando..." : "Enviar Resposta"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}