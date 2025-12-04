
import React, { useState, useEffect } from "react";
import { X, Star, MessageCircle, Calendar, User, TrendingUp, Download, Gift } from "lucide-react";
import { Resposta } from "@/entities/Resposta";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function RespostasPesquisaModal({ pesquisa, onClose }) {
  const [respostas, setRespostas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todas');
  const [stats, setStats] = useState({
    total: 0,
    promotores: 0,
    neutros: 0,
    detratores: 0,
    nps: 0
  });

  useEffect(() => {
    if (pesquisa) {
      loadRespostas();
    }
  }, [pesquisa]);

  const loadRespostas = async () => {
    setLoading(true);
    try {
      const respostasData = await Resposta.filter({ pesquisa_id: pesquisa.id }, '-created_date');
      setRespostas(respostasData);
      
      const total = respostasData.length;
      const promotores = respostasData.filter(r => r.nota >= 9).length;
      const detratores = respostasData.filter(r => r.nota <= 6).length;
      const neutros = total - promotores - detratores;
      const nps = total > 0 ? Math.round(((promotores - detratores) / total) * 100) : 0;
      
      setStats({ total, promotores, neutros, detratores, nps });
    } catch (error) {
      console.error("Erro ao carregar respostas:", error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (nota) => {
    if (nota >= 9) return "text-green-600 bg-green-100";
    if (nota <= 6) return "text-red-600 bg-red-100";
    return "text-yellow-600 bg-yellow-100";
  };

  const getScoreLabel = (nota) => {
    if (nota >= 9) return "Promotor";
    if (nota <= 6) return "Detrator";
    return "Neutro";
  };

  const respostasFiltradas = respostas.filter(resposta => {
    if (filtro === 'todas') return true;
    if (filtro === 'promotores') return resposta.nota >= 9;
    if (filtro === 'detratores') return resposta.nota <= 6;
    if (filtro === 'neutros') return resposta.nota >= 7 && resposta.nota <= 8;
    return true;
  });

  const exportarRespostas = () => {
    const headers = ['Nome', 'WhatsApp', 'Email', 'Nota', 'Categoria', 'Comentário', 'Data'];
    let csvContent = headers.join(',') + '\n';
    
    respostas.forEach(resposta => {
      const row = [
        resposta.nome_cliente || '',
        resposta.whatsapp || '',
        resposta.email_cliente || '',
        resposta.nota || '',
        getScoreLabel(resposta.nota),
        (resposta.comentario || '').replace(/,/g, ';'),
        format(new Date(resposta.created_date), 'dd/MM/yyyy HH:mm', { locale: ptBR })
      ];
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `respostas-${pesquisa.titulo.toLowerCase().replace(/\s+/g, '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!pesquisa) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="neuro-card w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{pesquisa.titulo}</h2>
              <p className="text-gray-600">Respostas da pesquisa</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={exportarRespostas}
                className="neuro-button px-4 py-2 text-gray-700 flex items-center gap-2"
                disabled={respostas.length === 0}
              >
                <Download className="w-4 h-4" />
                Exportar CSV
              </button>
              <button
                onClick={onClose}
                className="neuro-button p-2 text-gray-600 hover:text-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.promotores}</p>
              <p className="text-sm text-gray-600">Promotores</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.neutros}</p>
              <p className="text-sm text-gray-600">Neutros</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.detratores}</p>
              <p className="text-sm text-gray-600">Detratores</p>
            </div>
            <div className="text-center">
              <p className={`text-2xl font-bold ${stats.nps >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.nps > 0 ? '+' : ''}{stats.nps}
              </p>
              <p className="text-sm text-gray-600">NPS Score</p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFiltro('todas')}
              className={`neuro-button px-4 py-2 text-sm ${
                filtro === 'todas' ? 'pressed text-blue-600' : 'text-gray-700'
              }`}
            >
              Todas ({stats.total})
            </button>
            <button
              onClick={() => setFiltro('promotores')}
              className={`neuro-button px-4 py-2 text-sm ${
                filtro === 'promotores' ? 'pressed text-green-600' : 'text-gray-700'
              }`}
            >
              Promotores ({stats.promotores})
            </button>
            <button
              onClick={() => setFiltro('neutros')}
              className={`neuro-button px-4 py-2 text-sm ${
                filtro === 'neutros' ? 'pressed text-yellow-600' : 'text-gray-700'
              }`}
            >
              Neutros ({stats.neutros})
            </button>
            <button
              onClick={() => setFiltro('detratores')}
              className={`neuro-button px-4 py-2 text-sm ${
                filtro === 'detratores' ? 'pressed text-red-600' : 'text-gray-700'
              }`}
            >
              Detratores ({stats.detratores})
            </button>
          </div>
        </div>

        {/* Lista de Respostas */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando respostas...</p>
            </div>
          ) : respostasFiltradas.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {respostas.length === 0 ? 'Nenhuma resposta ainda' : 'Nenhuma resposta neste filtro'}
              </h3>
              <p className="text-gray-600">
                {respostas.length === 0 
                  ? 'Compartilhe o link da pesquisa para começar a receber respostas.' 
                  : 'Tente outro filtro para ver mais respostas.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {respostasFiltradas.map((resposta) => {
                return (
                <div key={resposta.id} className="neuro-button p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(resposta.nota)}`}>
                        <Star className="w-4 h-4 inline mr-1" />
                        {resposta.nota}/10
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${getScoreColor(resposta.nota)}`}>
                        {getScoreLabel(resposta.nota)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(resposta.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-800">{resposta.nome_cliente}</span>
                    <span className="text-gray-600">• {resposta.whatsapp}</span>
                    {resposta.email_cliente && (
                      <span className="text-gray-600">• {resposta.email_cliente}</span>
                    )}
                  </div>
                  
                  {resposta.comentario && (
                    <div className="flex items-start gap-2 mt-3 p-3 bg-gray-50 rounded-lg">
                      <MessageCircle className="w-4 h-4 text-gray-500 mt-0.5" />
                      <p className="text-sm text-gray-700 italic">"{resposta.comentario}"</p>
                    </div>
                  )}

                  {resposta.respostas_extras && resposta.respostas_extras.filter(r => r.resposta).length > 0 && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg space-y-2">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">Perguntas Adicionais:</h4>
                      {pesquisa.perguntas_extras.map((pergunta) => {
                         const respostaCliente = resposta.respostas_extras.find(r => r.pergunta_id === pergunta.id);
                         if (!respostaCliente || !respostaCliente.resposta) return null;

                         return (
                          <div key={pergunta.id}>
                            <p className="text-xs text-blue-700 font-semibold">{pergunta.texto}</p>
                            <p className="text-sm text-gray-800 italic">"{respostaCliente.resposta}"</p>
                          </div>
                         )
                      })}
                    </div>
                  )}

                  {resposta.cupom_gerado && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-orange-600">
                      <Gift className="w-4 h-4" />
                      <span>Cupom gerado: <strong>{resposta.cupom_gerado}</strong></span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        resposta.status_cupom === 'utilizado' ? 'bg-green-100 text-green-800' :
                        resposta.status_cupom === 'expirado' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {resposta.status_cupom === 'utilizado' ? 'Utilizado' :
                         resposta.status_cupom === 'expirado' ? 'Expirado' : 'Ativo'}
                      </span>
                    </div>
                  )}
                </div>
              )})}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
