import React, { useState } from 'react';
import { BookOpen, Youtube, Sparkles } from 'lucide-react';
import GuiaPassoAPasso from '../components/ajuda/GuiaPassoAPasso';
import TutoriaisEmVideo from '../components/ajuda/TutoriaisEmVideo';
import AssistenteIA from '../components/ajuda/AssistenteIA';

export default function Ajuda() {
  const [activeTab, setActiveTab] = useState('passo-a-passo');

  const tabs = [
    { id: 'passo-a-passo', label: 'Ajuda Passo a Passo', icon: BookOpen },
    { id: 'videos', label: 'Tutoriais em Vídeo', icon: Youtube },
    { id: 'ia', label: 'Assistente Inteligente', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen p-6" style={{ background: '#f8fafc' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800">Central de Ajuda</h1>
          <p className="text-lg text-gray-600 mt-2">
            Tire suas dúvidas e aprenda a usar todo o potencial da plataforma.
          </p>
        </div>

        <div className="flex justify-center space-x-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`neuro-button px-6 py-3 flex items-center gap-2 transition-all ${
                activeTab === tab.id ? 'pressed text-blue-600' : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="neuro-card p-8">
          {activeTab === 'passo-a-passo' && <GuiaPassoAPasso />}
          {activeTab === 'videos' && <TutoriaisEmVideo />}
          {activeTab === 'ia' && <AssistenteIA />}
        </div>
      </div>
    </div>
  );
}