import React, { useState } from 'react';
import { X, Phone, Smartphone, CheckCircle } from 'lucide-react';

export default function ConectarWhatsAppModal({ onClose, onConnect }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleConnect = () => {
    setLoading(true);
    // Simular processo de conexão
    setTimeout(() => {
      setStep(3);
      setLoading(false);
      setTimeout(() => {
        onConnect();
      }, 2000);
    }, 3000);
  };

  const generateQRCode = () => {
    // Simulando um QR code do WhatsApp Web
    return "data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='200' height='200' fill='%23f0f0f0'/%3E%3Ctext x='100' y='100' text-anchor='middle' dy='0.3em' font-family='Arial, sans-serif' font-size='14' fill='%23666'%3EQR Code%3C/text%3E%3C/svg%3E";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="neuro-card p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Conectar WhatsApp</h2>
          <button
            onClick={onClose}
            className="neuro-button p-2 text-gray-600 hover:text-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 1 && (
          <div className="text-center space-y-6">
            <div className="neuro-button p-6 inline-block">
              <Phone className="w-16 h-16 text-green-600 mx-auto" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Como funciona?
              </h3>
              <div className="text-left space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">1</div>
                  <p>Escaneie o QR Code com seu celular</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">2</div>
                  <p>Autorize a conexão no WhatsApp</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">3</div>
                  <p>Pronto! Você poderá enviar mensagens direto do sistema</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="neuro-button pressed w-full py-3 text-gray-800 font-medium"
            >
              Continuar
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="text-center space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Escaneie o QR Code
              </h3>
              
              <div className="neuro-card p-4 inline-block mb-4">
                {loading ? (
                  <div className="w-48 h-48 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                ) : (
                  <img 
                    src={generateQRCode()} 
                    alt="QR Code WhatsApp" 
                    className="w-48 h-48"
                  />
                )}
              </div>
              
              <div className="text-xs text-gray-600 space-y-2">
                <p className="flex items-center justify-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  Abra o WhatsApp no seu celular
                </p>
                <p>Toque em ⋮ &gt; Dispositivos conectados &gt; Conectar dispositivo</p>
                <p>Aponte a câmera para o QR code acima</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="neuro-button flex-1 py-3 text-gray-700"
              >
                Voltar
              </button>
              <button
                onClick={handleConnect}
                disabled={loading}
                className="neuro-button pressed flex-1 py-3 text-gray-800 font-medium disabled:opacity-50"
              >
                {loading ? "Conectando..." : "Já escaneei"}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center space-y-6">
            <div className="neuro-button p-6 inline-block">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                WhatsApp Conectado!
              </h3>
              <p className="text-gray-600">
                Agora você pode enviar mensagens para seus leads diretamente do sistema.
              </p>
            </div>

            <div className="neuro-card p-4 bg-green-50">
              <p className="text-sm text-green-700">
                ✓ Conexão estabelecida com sucesso<br/>
                ✓ Pronto para enviar campanhas<br/>
                ✓ Histórico será salvo automaticamente
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}