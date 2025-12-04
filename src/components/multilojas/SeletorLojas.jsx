import React, { useState, useEffect } from "react";
import { Store, ChevronDown, Plus } from "lucide-react";
import { User, Loja } from "@/entities/all";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function SeletorLojas({ currentUser, onLojaChange, onCreateLoja }) {
  const [lojas, setLojas] = useState([]);
  const [lojaAtiva, setLojaAtiva] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadLojas();
    }
  }, [currentUser]);

  const loadLojas = async () => {
    try {
      const lojasIds = currentUser.lojas_ids || [currentUser.loja_id].filter(Boolean);
      
      if (lojasIds.length === 0) {
        setLoading(false);
        return;
      }

      const lojasData = await Promise.all(
        lojasIds.map(id => Loja.filter({ id }))
      );
      
      const lojasFlat = lojasData.flat().filter(Boolean);
      setLojas(lojasFlat);
      
      // Define loja ativa
      const ativaId = currentUser.loja_ativa_id || currentUser.loja_id;
      const ativa = lojasFlat.find(l => l.id === ativaId) || lojasFlat[0];
      setLojaAtiva(ativa);
      
      if (onLojaChange && ativa) {
        onLojaChange(ativa);
      }
    } catch (error) {
      console.error("Erro ao carregar lojas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLoja = async (loja) => {
    setLojaAtiva(loja);
    
    // Atualiza loja ativa no usuário
    try {
      await User.updateMyUserData({ loja_ativa_id: loja.id });
      if (onLojaChange) {
        onLojaChange(loja);
      }
    } catch (error) {
      console.error("Erro ao atualizar loja ativa:", error);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-32"></div>
      </div>
    );
  }

  if (lojas.length === 0) {
    return (
      <div className="neuro-button p-3 text-gray-600">
        <Store className="w-5 h-5 mr-2" />
        Sem lojas
      </div>
    );
  }

  if (lojas.length === 1) {
    return (
      <div className="neuro-button p-3 text-gray-700">
        <Store className="w-5 h-5 mr-2" />
        <span className="truncate max-w-[150px]">{lojas[0].nome}</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="neuro-button p-3 text-gray-700 flex items-center gap-2 hover:shadow-lg transition-all">
          <Store className="w-5 h-5 text-blue-600" />
          <span className="truncate max-w-[150px]">
            {lojaAtiva ? lojaAtiva.nome : "Selecionar Loja"}
          </span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <div className="px-2 py-1.5 text-sm font-medium text-gray-500">
          Suas Lojas ({lojas.length})
        </div>
        <DropdownMenuSeparator />
        {lojas.map((loja) => (
          <DropdownMenuItem
            key={loja.id}
            onClick={() => handleSelectLoja(loja)}
            className={`cursor-pointer ${lojaAtiva?.id === loja.id ? 'bg-blue-50' : ''}`}
          >
            <Store className="w-4 h-4 mr-2" />
            <div className="flex-1">
              <div className="font-medium">{loja.nome}</div>
              {loja.slug && (
                <div className="text-xs text-gray-500">{loja.slug}</div>
              )}
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onCreateLoja}
          className="cursor-pointer text-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Criar Nova Loja
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}