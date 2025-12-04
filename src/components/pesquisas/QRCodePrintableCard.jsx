import React, { forwardRef } from 'react';
import { Camera, Gift, ScanLine } from 'lucide-react';

const QRCodePrintableCard = forwardRef(({ pesquisa, surveyUrl, loja, cupom, onQrLoad }, ref) => {
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(surveyUrl)}&format=png&color=1F2937&bgcolor=FFFFFF&qzone=1`;

  return (
    <div ref={ref} className="bg-white p-8 w-full max-w-lg aspect-[1/1.414] flex flex-col items-center justify-between font-sans shadow-lg rounded-xl border border-gray-200">
      <header className="text-center w-full">
        <div className="flex items-center justify-center gap-3 mb-4">
          {loja?.logo_url ? (
            <img src={loja.logo_url} alt={loja.nome} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border">
              <Camera className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-800">{loja?.nome || "Nome da Loja"}</h1>
        </div>
        <h2 className="text-4xl font-extrabold text-gray-900 leading-tight">Sua opinião vale prêmios!</h2>
        <p className="text-lg text-gray-600 mt-2">{pesquisa.titulo}</p>
      </header>

      <main className="my-8 flex flex-col items-center">
        <div className="p-3 bg-white rounded-lg shadow-inner border border-gray-200">
          <img 
            src={qrCodeUrl} 
            alt="QR Code da Pesquisa" 
            className="w-56 h-56 mx-auto"
            onLoad={onQrLoad}
          />
        </div>
        <div className="mt-4 text-center">
          <div className="flex justify-center items-center gap-2">
            <ScanLine className="w-8 h-8 text-gray-700" />
            <p className="text-2xl font-semibold text-gray-800">Aponte sua câmera aqui</p>
          </div>
          <p className="text-gray-500">e responda nossa pesquisa rápida.</p>
        </div>
      </main>
      
      <footer className="w-full text-center">
        {cupom && (
          <div className="w-full p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg border-2 border-dashed border-blue-300">
            <div className="flex items-center justify-center gap-4">
              <Gift className="w-10 h-10 text-blue-600" />
              <div>
                <p className="text-sm font-bold text-blue-800">E GANHE AGORA</p>
                <p className="font-extrabold text-3xl text-blue-700">
                  {cupom.valor_desconto}{cupom.tipo_desconto === 'percentual' ? '%' : ' R$'} DE DESCONTO
                </p>
              </div>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
});

export default QRCodePrintableCard;