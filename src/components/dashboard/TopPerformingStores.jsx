import React, { useState, useEffect } from "react";
import { Pesquisa, Resposta, Loja } from "@/entities/all";
import { Store, TrendingUp } from "lucide-react";

export default function TopPerformingStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopStores();
  }, []);

  const loadTopStores = async () => {
    try {
      const pesquisas = await Pesquisa.list();
      const respostas = await Resposta.list();
      const lojas = await Loja.list();

      // Calcular NPS por loja
      const storeStats = lojas.map(loja => {
        const lojaPesquisas = pesquisas.filter(p => p.loja_id === loja.id);
        const lojaRespostas = respostas.filter(r => 
          lojaPesquisas.some(p => p.id === r.pesquisa_id)
        );

        const promotores = lojaRespostas.filter(r => r.nota >= 9).length;
        const detratores = lojaRespostas.filter(r => r.nota <= 6).length;
        const nps = lojaRespostas.length > 0 ? 
          Math.round(((promotores - detratores) / lojaRespostas.length) * 100) : 0;

        return {
          ...loja,
          totalRespostas: lojaRespostas.length,
          nps,
          promotores,
          detratores
        };
      });

      // Ordenar por NPS
      storeStats.sort((a, b) => b.nps - a.nps);
      setStores(storeStats.slice(0, 5));
    } catch (error) {
      console.error("Erro ao carregar lojas:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="neuro-card p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Lojas por NPS</h3>
      
      <div className="space-y-4">
        {stores.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhuma loja cadastrada ainda</p>
        ) : (
          stores.map((store, index) => (
            <div key={store.id} className="neuro-button p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="neuro-button p-2">
                    <Store className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{store.nome}</h4>
                    <p className="text-xs text-gray-600">
                      {store.totalRespostas} respostas
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <TrendingUp className={`w-4 h-4 ${
                      store.nps >= 50 ? 'text-green-600' : 
                      store.nps >= 0 ? 'text-yellow-600' : 'text-red-600'
                    }`} />
                    <span className={`font-bold ${
                      store.nps >= 50 ? 'text-green-600' : 
                      store.nps >= 0 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {store.nps > 0 ? '+' : ''}{store.nps}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">NPS Score</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}