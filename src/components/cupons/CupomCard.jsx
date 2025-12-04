
import React from "react";
import { Gift, Calendar, DollarSign, Percent, Edit, Trash2, QrCode, Printer } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function CupomCard({ cupom, onEdit, onDelete, onShowQrCode, onPrintCupom }) {
  const getTypeIcon = (tipo) => {
    switch (tipo) {
      case 'percentual':
        return <Percent className="w-4 h-4" />;
      case 'valor_fixo':
        return <DollarSign className="w-4 h-4" />;
      default:
        return <Gift className="w-4 h-4" />;
    }
  };

  const getTypeColor = (tipo) => {
    switch (tipo) {
      case 'percentual':
        return 'text-blue-600';
      case 'valor_fixo':
        return 'text-green-600';
      default:
        return 'text-purple-600';
    }
  };

  return (
    <TooltipProvider>
      <div className="neuro-card p-6 hover:shadow-lg transition-all duration-300 flex flex-col h-full">
        <div className="flex-grow">
          <h3 className="text-lg font-bold text-gray-800 mb-4">{cupom.nome}</h3>

          {/* Valor do Desconto */}
          <div className="neuro-card p-4 mb-4 text-center bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className={`neuro-button p-2 ${getTypeColor(cupom.tipo_desconto)}`}>
                {getTypeIcon(cupom.tipo_desconto)}
              </div>
            </div>
            <div className={`text-3xl font-bold ${getTypeColor(cupom.tipo_desconto)} mb-1`}>
              {cupom.valor_desconto}{cupom.tipo_desconto === 'percentual' ? '%' : 'R$'}
            </div>
            <p className="text-sm text-gray-600">
              {cupom.tipo_desconto === 'percentual' ? 'DE DESCONTO' : 'DESCONTO FIXO'}
            </p>
          </div>

          {/* Detalhes */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Válido por {cupom.validade_dias} dias</span>
            </div>

            {cupom.minimo_compra > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <DollarSign className="w-4 h-4" />
                <span>Compra mínima: R$ {cupom.minimo_compra.toFixed(2)}</span>
              </div>
            )}

            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Prefixo: <span className="font-mono">{cupom.codigo_prefixo}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Texto personalizado */}
        {cupom.texto_cupom && (
          <div className="mt-4 neuro-card p-3">
            <p className="text-sm text-gray-700 italic">
              "{cupom.texto_cupom}"
            </p>
          </div>
        )}

        {/* Botões de Ação - Padronizado na parte de baixo */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-auto">
          <span className={`text-xs px-2 py-1 rounded-full ${
            cupom.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {cupom.ativo ? "Ativo" : "Inativo"}
          </span>
          <div className="flex items-center gap-2">
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onPrintCupom && onPrintCupom(cupom)}
                  className="neuro-button p-2 text-gray-600 hover:text-gray-800"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent><p>Imprimir material</p></TooltipContent>
            </Tooltip>

            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onShowQrCode(cupom)}
                  className="neuro-button p-2 text-gray-600 hover:text-gray-800"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent><p>Ver QR Code da campanha</p></TooltipContent>
            </Tooltip>

            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onEdit(cupom)}
                  className="neuro-button p-2 text-gray-600 hover:text-gray-800"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent><p>Editar cupom</p></TooltipContent>
            </Tooltip>

            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onDelete(cupom)}
                  className="neuro-button p-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent><p>Excluir cupom</p></TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
