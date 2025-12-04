import React, { useState, useEffect } from 'react';
import { Parceria } from '@/entities/all';
import { Gift, Star, ExternalLink, Calendar, Heart } from 'lucide-react';

export default function FeaturedOffer({ currentUser, onFavorite }) {
  const [featuredOffer, setFeaturedOffer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedOffer();
  }, []);

  const loadFeaturedOffer = async () => {
    try {
      const parcerias = await Parceria.filter({ ativa: true, destaque: true });
      
      if (parcerias.length > 0) {
        // Pegar uma oferta em destaque válida (dentro do período)
        const hoje = new Date();
        const validOffer = parcerias.find(p => {
          const inicio = p.data_inicio ? new Date(p.data_inicio) : null;
          const fim = p.data_fim ? new Date(p.data_fim) : null;
          
          if (inicio && hoje < inicio) return false;
          if (fim && hoje > fim) return false;
          return true;
        });
        
        if (validOffer) {
          setFeaturedOffer(validOffer);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar oferta em destaque:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!currentUser || !featuredOffer) return;
    
    try {
      await onFavorite(featuredOffer.id);
    } catch (error) {
      console.error('Erro ao favoritar oferta:', error);
    }
  };

  const isFavorite = currentUser?.favoritos_ofertas?.includes(featuredOffer?.id);

  if (loading || !featuredOffer) return null;

  const temValores = featuredOffer.valor_original && featuredOffer.valor_promocional;
  const desconto = temValores ? Math.round(((featuredOffer.valor_original - featuredOffer.valor_promocional) / featuredOffer.valor_original) * 100) : 0;

  return (
    <div className="neuro-card p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
        <h3 className="text-lg font-bold text-purple-900">Oferta em Destaque</h3>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Imagem */}
        <div className="relative flex-shrink-0">
          <img 
            src={featuredOffer.imagem_url || 'https://via.placeholder.com/300x200'} 
            alt={featuredOffer.titulo}
            className="w-full md:w-64 h-48 object-cover rounded-lg shadow-lg"
          />
          {temValores && desconto > 0 && (
            <div className="absolute top-3 right-3 bg-red-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
              -{desconto}%
            </div>
          )}
        </div>

        {/* Conteúdo */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="text-2xl font-bold text-gray-800 mb-2">{featuredOffer.titulo}</h4>
              <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                featuredOffer.categoria === 'roupas' ? 'bg-pink-100 text-pink-800' : 'bg-indigo-100 text-indigo-800'
              }`}>
                {featuredOffer.categoria === 'roupas' ? '👗 Cápsula de Roupas' : '💻 Software'}
              </span>
            </div>
            
            <button
              onClick={handleToggleFavorite}
              className={`neuro-button p-3 transition-colors ${
                isFavorite ? 'text-red-500' : 'text-gray-400'
              }`}
              title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Valores */}
          {temValores && (
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <span className="text-gray-500 line-through text-xl">
                  R$ {featuredOffer.valor_original.toFixed(2)}
                </span>
                <span className="text-green-600 font-bold text-3xl">
                  R$ {featuredOffer.valor_promocional.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-green-600 font-medium mt-1">
                Economize R$ {(featuredOffer.valor_original - featuredOffer.valor_promocional).toFixed(2)}
              </p>
            </div>
          )}

          <p className="text-gray-700 mb-4 leading-relaxed">
            {featuredOffer.descricao || 'Aproveite esta oferta exclusiva!'}
          </p>

          {/* Cupom */}
          {featuredOffer.codigo_cupom && (
            <div className="mb-4 inline-block">
              <div className="flex items-center gap-2 bg-green-50 border-2 border-green-200 rounded-lg px-4 py-2">
                <Gift className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-xs text-green-700 font-medium">Cupom Exclusivo</p>
                  <p className="text-lg font-bold text-green-800">{featuredOffer.codigo_cupom}</p>
                </div>
              </div>
            </div>
          )}

          {/* Validade */}
          {(featuredOffer.data_inicio || featuredOffer.data_fim) && (
            <div className="mb-4 text-sm text-gray-600 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {featuredOffer.data_inicio && `De ${new Date(featuredOffer.data_inicio).toLocaleDateString('pt-BR')}`}
              {featuredOffer.data_inicio && featuredOffer.data_fim && ' '}
              {featuredOffer.data_fim && `até ${new Date(featuredOffer.data_fim).toLocaleDateString('pt-BR')}`}
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3">
            <a
              href={featuredOffer.link}
              target="_blank"
              rel="noopener noreferrer"
              className="neuro-button pressed px-6 py-3 text-gray-800 font-medium inline-flex items-center gap-2"
            >
              <ExternalLink className="w-5 h-5" />
              Aproveitar Agora
            </a>
            
            <a
              href="/Configuracoes?tab=parceiros"
              className="neuro-button px-6 py-3 text-gray-700 font-medium"
            >
              Ver Todas as Ofertas
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}