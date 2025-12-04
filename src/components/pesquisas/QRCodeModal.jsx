import React from 'react';
import { X } from 'lucide-react';

export default function QRCodeModal({ pesquisa, onClose }) {
  if (!pesquisa) return null;

  const qrUrl = `${window.location.origin}/PesquisaCliente?id=${pesquisa.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrUrl)}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="neuro-card p-8 max-w-md w-full text-center">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">QR Code da Pesquisa</h2>
          <button 
            onClick={onClose} 
            className="neuro-button p-2 text-gray-600 hover:text-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{pesquisa.titulo}</h3>
          <p className="text-gray-600 mb-4">
            Aponte a câmera do seu celular para o código abaixo.
          </p>
        </div>
        
        <div className="p-6 neuro-card inline-block mb-6">
          <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64 mx-auto rounded-lg" />
        </div>
        
        <div className="flex gap-3">
          <a 
            href={qrUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="neuro-button pressed flex-1 py-3 text-gray-800 font-medium text-center"
          >
            Testar Link
          </a>
          <button 
            onClick={onClose} 
            className="neuro-button flex-1 py-3 text-gray-700"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}