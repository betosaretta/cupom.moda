import React from 'react';
import { Gift, BarChart, QrCode, FileText, Edit, Trash2, Users } from 'lucide-react';

export default function PesquisaCard({ pesquisa, cupom, onShowQR, onDownloadA4, onEdit, onViewResponses, onDelete }) {
  return (
    <div className="neuro-card p-6 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold text-gray-800 pr-4">{pesquisa.titulo}</h3>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${pesquisa.ativa ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
            {pesquisa.ativa ? 'Ativa' : 'Inativa'}
          </span>
        </div>
        
        <div className="space-y-3 text-sm text-gray-600 mb-6">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span>{pesquisa.total_respostas || 0} respostas</span>
          </div>
          <div className="flex items-center gap-2">
            <BarChart className="w-4 h-4 text-gray-400" />
            <span>Índice de Satisfação: {pesquisa.nps_score > 0 ? '+' : ''}{pesquisa.nps_score || 0}</span>
          </div>
          {cupom && (
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-gray-400" />
              <span>Recompensa: {cupom.nome}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex gap-2">
          <button onClick={onShowQR} className="neuro-button flex-1 py-2 text-sm text-gray-700 flex items-center justify-center gap-2">
            <QrCode className="w-4 h-4"/> Ver QR Code
          </button>
          <button onClick={onDownloadA4} className="neuro-button flex-1 py-2 text-sm text-gray-700 flex items-center justify-center gap-2">
            <FileText className="w-4 h-4"/> Imprimir
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={onViewResponses} className="neuro-button flex-1 py-2 text-sm text-gray-700">Ver Respostas</button>
          <button onClick={onEdit} className="neuro-button p-2 text-gray-700"><Edit className="w-4 h-4"/></button>
          <button onClick={onDelete} className="neuro-button p-2 text-red-500"><Trash2 className="w-4 h-4"/></button>
        </div>
      </div>
    </div>
  );
}