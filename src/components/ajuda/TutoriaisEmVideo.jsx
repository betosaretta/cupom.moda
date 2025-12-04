import React from 'react';
import { Video } from 'lucide-react';

export default function TutoriaisEmVideo() {
  const videos = [
    { title: "Visão Geral da Plataforma", duration: "3:15" },
    { title: "Como Criar sua Primeira Pesquisa", duration: "2:40" },
    { title: "Gerenciando e Criando Cupons", duration: "4:05" },
    { title: "Validando um Cupom na Venda", duration: "1:50" },
    { title: "Entendendo o Cadastro de Clientes", duration: "3:30" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-800">Vídeos Rápidos</h3>
        <p className="text-gray-600">Aprenda de forma visual com nossos tutoriais.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video, index) => (
          <div key={index} className="neuro-button p-4 text-center cursor-pointer hover:shadow-lg transition-shadow">
            <div className="bg-gray-200 rounded-lg h-32 flex items-center justify-center mb-4">
              <Video className="w-12 h-12 text-gray-400" />
            </div>
            <h4 className="font-semibold text-gray-800">{video.title}</h4>
            <p className="text-sm text-gray-500 mt-1">{video.duration}</p>
            <p className="text-xs text-blue-600 font-bold mt-2">EM BREVE</p>
          </div>
        ))}
      </div>
    </div>
  );
}