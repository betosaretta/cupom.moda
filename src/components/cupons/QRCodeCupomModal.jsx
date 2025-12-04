
import React from 'react';
import { X, Download } from 'lucide-react';

export default function QRCodeCupomModal({ cupom, onClose }) {
  // CORREÇÃO: O link agora aponta para a nova página de captura
  const qrUrl = `${window.location.origin}/CapturaLeadCupom?cupomId=${cupom.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrUrl)}&format=png`;
  
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title></title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
            body { font-family: 'Inter', sans-serif; text-align: center; margin: 20px; background: #f8fafc; }
            .container { background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); max-width: 400px; margin: 0 auto; }
            h1 { font-size: 24px; font-weight: 700; color: #1f2937; margin-bottom: 10px; }
            p { font-size: 16px; color: #6b7280; margin-bottom: 20px; }
            img { border-radius: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${cupom.nome}</h1>
            <p>Aponte a câmera para este QR Code para resgatar seu cupom!</p>
            <img src="${qrCodeUrl}" alt="QR Code do Cupom" id="qrImage" />
          </div>
          <script>
            const qrImage = document.getElementById('qrImage');
            if (qrImage.complete) {
              setTimeout(() => { window.print(); window.close(); }, 500);
            } else {
              qrImage.onload = () => {
                 setTimeout(() => { window.print(); window.close(); }, 500);
              };
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="neuro-card p-8 max-w-md w-full text-center">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">QR Code do Cupom</h2>
          <button 
            onClick={onClose} 
            className="neuro-button p-2 text-gray-600 hover:text-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{cupom.nome}</h3>
          <p className="text-gray-600 mb-4">
            Aponte a câmera do celular para este código para resgatar o cupom.
          </p>
        </div>
        
        <div className="p-6 neuro-card inline-block mb-6">
          <img 
            src={qrCodeUrl} 
            alt="QR Code do Cupom" 
            className="w-64 h-64 mx-auto rounded-lg"
          />
        </div>
        
        <div className="space-y-3">
          <div className="flex gap-3">
            <a 
              href={qrCodeUrl}
              download={`qrcode-${cupom.nome.replace(/\s+/g, '-')}.png`}
              className="neuro-button flex-1 py-3 text-gray-700 hover:text-gray-900 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Baixar PNG
            </a>
            <a 
              href={qrUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="neuro-button pressed flex-1 py-3 text-gray-800 font-medium text-center"
            >
              Testar Link
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
