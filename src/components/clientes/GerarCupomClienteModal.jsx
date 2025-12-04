
import React, { useState } from 'react';
import { X, Gift, MessageSquare, Sparkles } from 'lucide-react';

export default function GerarCupomClienteModal({ cliente, onClose, onSave }) {
  const [step, setStep] = useState(1); // 1: Cupom, 2: Mensagem
  const [formData, setFormData] = useState({
    nome: `Cupom Especial - ${cliente.nome_cliente}`,
    tipo_desconto: 'valor_fixo',
    valor_desconto: '',
    validade_dias: '30',
    minimo_compra: '',
    texto_cupom: 'Oferta especial para você!',
    observacao: ''
  });
  const [mensagemEscolhida, setMensagemEscolhida] = useState('template1');
  const [mensagemPersonalizada, setMensagemPersonalizada] = useState('');
  const [loading, setLoading] = useState(false);

  const templates = {
    template1: {
      nome: 'Parabéns Especial',
      texto: `🎉 Parabéns, ${cliente?.nome_cliente?.split(' ')[0]}!

Que alegria saber que hoje é seu dia especial! 🎂

Como presente, preparamos um cupom exclusivo para você:

Código: *[CÓDIGO_CUPOM]*
{DESCONTO_INFO}

{TEXTO_CUPOM}

Válido por {VALIDADE_DIAS} dias. Esperamos você aqui! 💝

Feliz aniversário! 🎈`
    },
    template2: {
      nome: 'Presente de Aniversário',
      texto: `🎁 Feliz Aniversário, ${cliente?.nome_cliente?.split(' ')[0]}!

Este é seu dia e queremos comemorar junto com você!

Seu presente especial chegou:

✨ Cupom: *[CÓDIGO_CUPOM]*
✨ {DESCONTO_INFO}

{TEXTO_CUPOM}

Use em até {VALIDADE_DIAS} dias e venha celebrar conosco! 🎉

Desejamos muito amor, saúde e felicidade! 💖`
    },
    template3: {
      nome: 'Surpresa de Aniversário',
      texto: `🌟 Surpresa, ${cliente?.nome_cliente?.split(' ')[0]}!

Hoje é seu aniversário e temos uma surpresa especial! 🎈

Preparamos este mimo com muito carinho:

🎊 *[CÓDIGO_CUPOM]*
🎊 {DESCONTO_INFO}

{TEXTO_CUPOM}

Aproveite nos próximos {VALIDADE_DIAS} dias!

Que este novo ano seja repleto de conquistas! 🌈✨`
    },
    personalizada: {
      nome: 'Mensagem Personalizada',
      texto: ''
    }
  };

  const handleNext = () => {
    if (!formData.valor_desconto || parseFloat(formData.valor_desconto) <= 0) {
      alert('Por favor, insira um valor de desconto válido.');
      return;
    }
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const cupomData = {
        ...formData,
        valor_desconto: parseFloat(formData.valor_desconto),
        validade_dias: parseInt(formData.validade_dias),
        minimo_compra: formData.minimo_compra ? parseFloat(formData.minimo_compra) : 0,
        codigo_prefixo: 'PRESENTE'
      };

      let mensagemFinal = '';
      if (mensagemEscolhida === 'personalizada') {
        mensagemFinal = mensagemPersonalizada;
      } else {
        mensagemFinal = templates[mensagemEscolhida].texto
          .replace('{DESCONTO_INFO}',
            cupomData.tipo_desconto === 'percentual'
              ? `${cupomData.valor_desconto}% de desconto`
              : `R$ ${cupomData.valor_desconto.toFixed(2)} de desconto`
          )
          .replace('{TEXTO_CUPOM}', cupomData.texto_cupom)
          .replace('{VALIDADE_DIAS}', cupomData.validade_dias);
      }

      await onSave(cupomData, mensagemFinal);
    } catch (error) {
      console.error('Erro ao gerar cupom:', error);
      alert('Erro ao gerar cupom. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="neuro-card p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="neuro-button p-2">
              {step === 1 ? <Gift className="w-5 h-5 text-purple-600" /> : <MessageSquare className="w-5 h-5 text-blue-600" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {step === 1 ? 'Configurar Cupom' : 'Personalizar Mensagem'}
              </h2>
              <p className="text-gray-600">Para {cliente.nome_cliente}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="neuro-button p-2 text-gray-600 hover:text-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Indicador de Passos */}
        <div className="flex items-center justify-center mb-8">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            1
          </div>
          <div className={`w-16 h-0.5 ${step >= 2 ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            2
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Desconto *
                </label>
                <select
                  required
                  value={formData.tipo_desconto}
                  onChange={(e) => setFormData({...formData, tipo_desconto: e.target.value})}
                  className="neuro-input w-full p-3 text-gray-800"
                >
                  <option value="valor_fixo">Valor Fixo (R$)</option>
                  <option value="percentual">Percentual (%)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor do Desconto *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formData.valor_desconto}
                  onChange={(e) => setFormData({...formData, valor_desconto: e.target.value})}
                  className="neuro-input w-full p-3 text-gray-800"
                  placeholder={formData.tipo_desconto === 'percentual' ? '15' : '25'}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Validade (dias) *
                </label>
                <select
                  value={formData.validade_dias}
                  onChange={(e) => setFormData({...formData, validade_dias: e.target.value})}
                  className="neuro-input w-full p-3 text-gray-800"
                >
                  <option value="7">7 dias</option>
                  <option value="15">15 dias</option>
                  <option value="30">30 dias</option>
                  <option value="60">60 dias</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compra Mínima
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.minimo_compra}
                  onChange={(e) => setFormData({...formData, minimo_compra: e.target.value})}
                  className="neuro-input w-full p-3 text-gray-800"
                  placeholder="Opcional"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensagem no Cupom
              </label>
              <textarea
                value={formData.texto_cupom}
                onChange={(e) => setFormData({...formData, texto_cupom: e.target.value})}
                className="neuro-input w-full p-3 text-gray-800 h-20 resize-none"
                placeholder="Mensagem que aparecerá junto com o cupom"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleNext}
                className="neuro-button pressed px-6 py-3 text-gray-800 font-medium flex items-center gap-2"
              >
                Próximo: Mensagem
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Escolha o Template da Mensagem</h3>
              <div className="grid grid-cols-1 gap-3 mb-6">
                {Object.entries(templates).map(([key, template]) => (
                  <label key={key} className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="template"
                      value={key}
                      checked={mensagemEscolhida === key}
                      onChange={(e) => setMensagemEscolhida(e.target.value)}
                      className="w-4 h-4 text-blue-600 mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium text-gray-800">{template.nome}</span>
                      </div>
                      {key !== 'personalizada' && (
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {template.texto.split('\n').slice(0, 2).join(' ').substring(0, 120)}...
                        </p>
                      )}
                      {key === 'personalizada' && (
                        <p className="text-sm text-gray-600">Escreva sua própria mensagem personalizada</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {mensagemEscolhida === 'personalizada' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sua Mensagem Personalizada
                </label>
                <textarea
                  value={mensagemPersonalizada}
                  onChange={(e) => setMensagemPersonalizada(e.target.value)}
                  className="neuro-input w-full p-3 h-32 resize-none text-sm"
                  placeholder="Digite sua mensagem. Use [CÓDIGO_CUPOM] para inserir o código do cupom."
                />
                <p className="text-xs text-blue-600 mt-2">
                  💡 Use <strong>[CÓDIGO_CUPOM]</strong> para inserir automaticamente o código do cupom.
                </p>
              </div>
            )}

            {mensagemEscolhida !== 'personalizada' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prévia da Mensagem
                </label>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-700 whitespace-pre-line bg-white p-3 rounded border">
                    {templates[mensagemEscolhida].texto
                      .replace('[CÓDIGO_CUPOM]', 'PRESENTE-XXXX')
                      .replace('{DESCONTO_INFO}',
                        formData.tipo_desconto === 'percentual'
                          ? `${formData.valor_desconto || '15'}% de desconto`
                          : `R$ ${(formData.valor_desconto || '25').toString().replace('.', ',')} de desconto`
                      )
                      .replace('{TEXTO_CUPOM}', formData.texto_cupom)
                      .replace('{VALIDADE_DIAS}', formData.validade_dias)
                    }
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleBack}
                className="neuro-button px-6 py-3 text-gray-700"
              >
                Voltar
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || (mensagemEscolhida === 'personalizada' && !mensagemPersonalizada.trim())}
                className="neuro-button pressed flex-1 py-3 text-gray-800 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  "Gerando..."
                ) : (
                  <>
                    <Gift className="w-4 h-4" />
                    Gerar e Enviar Cupom
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
