import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Star, MessageCircle } from "lucide-react";

export default function RecentResponses({ responses }) {
  const getScoreColor = (nota) => {
    if (nota >= 9) return "text-green-600";
    if (nota <= 6) return "text-red-600";
    return "text-yellow-600";
  };

  const getScoreLabel = (nota) => {
    if (nota >= 9) return "Promotor";
    if (nota <= 6) return "Detrator";
    return "Neutro";
  };

  return (
    <div className="neuro-card p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Respostas Recentes</h3>
      
      <div className="space-y-4">
        {responses.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhuma resposta ainda</p>
        ) : (
          responses.map((response, index) => (
            <div key={response.id} className="neuro-button p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Star className={`w-4 h-4 ${getScoreColor(response.nota)}`} />
                  <span className={`font-semibold ${getScoreColor(response.nota)}`}>
                    {response.nota}/10
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getScoreColor(response.nota)} bg-opacity-10`}>
                    {getScoreLabel(response.nota)}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {format(new Date(response.created_date), "dd/MM HH:mm", { locale: ptBR })}
                </span>
              </div>
              
              <div className="text-sm text-gray-700 mb-2">
                <strong>{response.nome_cliente}</strong>
              </div>
              
              {response.comentario && (
                <div className="flex items-start gap-2 mt-2">
                  <MessageCircle className="w-3 h-3 text-gray-400 mt-0.5" />
                  <p className="text-xs text-gray-600 italic">
                    "{response.comentario}"
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}