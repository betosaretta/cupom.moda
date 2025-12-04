import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Download, 
  Users, 
  Gift, 
  Target,
  BarChart3
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdvancedAnalytics({ respostas, cupons, pesquisas }) {
  const [dateRange, setDateRange] = useState('30'); // últimos 30 dias por padrão
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    calculateAnalytics();
  }, [dateRange, customStart, customEnd, respostas, cupons, pesquisas]);

  const getDateRange = () => {
    const now = new Date();
    
    if (dateRange === 'custom' && customStart && customEnd) {
      return {
        start: startOfDay(new Date(customStart)),
        end: endOfDay(new Date(customEnd))
      };
    }
    
    const days = parseInt(dateRange);
    return {
      start: startOfDay(subDays(now, days)),
      end: endOfDay(now)
    };
  };

  const calculateAnalytics = () => {
    const { start, end } = getDateRange();
    
    // Filtrar dados pelo período
    const filteredRespostas = respostas.filter(r => {
      const date = new Date(r.created_date);
      return isWithinInterval(date, { start, end });
    });

    // Métricas gerais
    const totalLeads = filteredRespostas.length;
    const cuponsGerados = filteredRespostas.filter(r => r.cupom_gerado).length;
    const cuponsUtilizados = filteredRespostas.filter(r => r.status_cupom === 'utilizado').length;
    const taxaResgateGeral = cuponsGerados > 0 ? ((cuponsUtilizados / cuponsGerados) * 100).toFixed(1) : 0;

    // Origem dos leads
    const origens = {
      pesquisa_nps: filteredRespostas.filter(r => r.origem === 'pesquisa_nps').length,
      campanha: filteredRespostas.filter(r => r.origem === 'campanha').length,
      manual: filteredRespostas.filter(r => r.origem === 'manual').length
    };

    // Performance por pesquisa
    const performancePesquisas = pesquisas.map(pesquisa => {
      const respostasPesquisa = filteredRespostas.filter(r => r.pesquisa_id === pesquisa.id);
      const totalRespostas = respostasPesquisa.length;
      const cuponsGeradosPesquisa = respostasPesquisa.filter(r => r.cupom_gerado).length;
      const cuponsUtilizadosPesquisa = respostasPesquisa.filter(r => r.status_cupom === 'utilizado').length;
      
      return {
        nome: pesquisa.titulo,
        respostas: totalRespostas,
        cuponsGerados: cuponsGeradosPesquisa,
        cuponsUtilizados: cuponsUtilizadosPesquisa,
        taxaResgate: cuponsGeradosPesquisa > 0 ? ((cuponsUtilizadosPesquisa / cuponsGeradosPesquisa) * 100).toFixed(1) : 0,
        nps: pesquisa.nps_score || 0
      };
    }).filter(p => p.respostas > 0);

    // Performance por cupom
    const performanceCupons = cupons.map(cupom => {
      const respostasCupom = filteredRespostas.filter(r => 
        r.cupom_id === cupom.id || 
        (r.cupom_gerado && r.cupom_gerado.startsWith(cupom.codigo_prefixo || cupom.nome.substring(0, 3).toUpperCase()))
      );
      const gerados = respostasCupom.filter(r => r.cupom_gerado).length;
      const utilizados = respostasCupom.filter(r => r.status_cupom === 'utilizado').length;
      
      return {
        nome: cupom.nome,
        gerados,
        utilizados,
        taxaResgate: gerados > 0 ? ((utilizados / gerados) * 100).toFixed(1) : 0
      };
    }).filter(c => c.gerados > 0);

    // Timeline de leads (últimos 30 pontos de dados)
    const timelineData = [];
    const days = dateRange === 'custom' 
      ? Math.ceil((end - start) / (1000 * 60 * 60 * 24))
      : parseInt(dateRange);
    
    const points = Math.min(days, 30);
    const interval = Math.ceil(days / points);
    
    for (let i = 0; i < points; i++) {
      const pointDate = subDays(end, (points - i - 1) * interval);
      const nextDate = subDays(end, (points - i - 2) * interval);
      
      const leadsNoPeriodo = filteredRespostas.filter(r => {
        const date = new Date(r.created_date);
        return date >= pointDate && date < nextDate;
      }).length;
      
      timelineData.push({
        data: format(pointDate, 'dd/MMM', { locale: ptBR }),
        leads: leadsNoPeriodo
      });
    }

    // Distribuição NPS
    const promotores = filteredRespostas.filter(r => r.nota >= 9).length;
    const neutros = filteredRespostas.filter(r => r.nota === 7 || r.nota === 8).length;
    const detratores = filteredRespostas.filter(r => r.nota <= 6).length;
    const npsScore = totalLeads > 0 ? Math.round(((promotores - detratores) / totalLeads) * 100) : 0;

    setAnalytics({
      totalLeads,
      cuponsGerados,
      cuponsUtilizados,
      taxaResgateGeral,
      origens,
      performancePesquisas,
      performanceCupons,
      timelineData,
      npsScore,
      promotores,
      neutros,
      detratores
    });
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const { start, end } = getDateRange();
      
      // Criar CSV com dados detalhados
      const csvData = [];
      csvData.push(['Relatório Avançado de Análises - Cupom.Moda']);
      csvData.push([`Período: ${format(start, 'dd/MM/yyyy')} a ${format(end, 'dd/MM/yyyy')}`]);
      csvData.push([]);
      
      csvData.push(['MÉTRICAS GERAIS']);
      csvData.push(['Total de Leads', analytics.totalLeads]);
      csvData.push(['Cupons Gerados', analytics.cuponsGerados]);
      csvData.push(['Cupons Utilizados', analytics.cuponsUtilizados]);
      csvData.push(['Taxa de Resgate', `${analytics.taxaResgateGeral}%`]);
      csvData.push(['NPS Score', analytics.npsScore]);
      csvData.push([]);
      
      csvData.push(['ORIGEM DOS LEADS']);
      csvData.push(['Pesquisas NPS', analytics.origens.pesquisa_nps]);
      csvData.push(['Campanhas', analytics.origens.campanha]);
      csvData.push(['Manual', analytics.origens.manual]);
      csvData.push([]);
      
      csvData.push(['PERFORMANCE POR PESQUISA']);
      csvData.push(['Pesquisa', 'Respostas', 'Cupons Gerados', 'Cupons Utilizados', 'Taxa Resgate', 'NPS']);
      analytics.performancePesquisas.forEach(p => {
        csvData.push([p.nome, p.respostas, p.cuponsGerados, p.cuponsUtilizados, `${p.taxaResgate}%`, p.nps]);
      });
      csvData.push([]);
      
      csvData.push(['PERFORMANCE POR CUPOM']);
      csvData.push(['Cupom', 'Gerados', 'Utilizados', 'Taxa Resgate']);
      analytics.performanceCupons.forEach(c => {
        csvData.push([c.nome, c.gerados, c.utilizados, `${c.taxaResgate}%`]);
      });
      
      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('Erro ao exportar relatório.');
    } finally {
      setExporting(false);
    }
  };

  if (!analytics) {
    return <div className="text-center py-8">Calculando análises...</div>;
  }

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
  
  const origensData = [
    { name: 'Pesquisas NPS', value: analytics.origens.pesquisa_nps, color: '#3b82f6' },
    { name: 'Campanhas', value: analytics.origens.campanha, color: '#8b5cf6' },
    { name: 'Manual', value: analytics.origens.manual, color: '#10b981' }
  ].filter(o => o.value > 0);

  return (
    <div className="space-y-6">
      {/* Cabeçalho com filtros */}
      <div className="neuro-card p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              Análises Avançadas
            </h2>
            <p className="text-gray-600 mt-1">Insights detalhados sobre o desempenho do seu negócio</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="neuro-button px-4 py-2"
            >
              <option value="7">Últimos 7 dias</option>
              <option value="15">Últimos 15 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="60">Últimos 60 dias</option>
              <option value="90">Últimos 90 dias</option>
              <option value="custom">Período personalizado</option>
            </select>
            
            {dateRange === 'custom' && (
              <>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="neuro-input px-3 py-2"
                />
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="neuro-input px-3 py-2"
                />
              </>
            )}
            
            <button
              onClick={handleExport}
              disabled={exporting}
              className="neuro-button pressed px-4 py-2 flex items-center gap-2 text-gray-800 font-medium"
            >
              <Download className="w-4 h-4" />
              {exporting ? 'Exportando...' : 'Exportar'}
            </button>
          </div>
        </div>
      </div>

      {/* Cards de métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="neuro-card p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total de Leads</h3>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{analytics.totalLeads}</p>
          <p className="text-xs text-gray-500 mt-1">No período selecionado</p>
        </div>

        <div className="neuro-card p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Cupons Gerados</h3>
            <Gift className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{analytics.cuponsGerados}</p>
          <p className="text-xs text-gray-500 mt-1">Ofertas entregues</p>
        </div>

        <div className="neuro-card p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Taxa de Resgate</h3>
            <Target className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{analytics.taxaResgateGeral}%</p>
          <p className="text-xs text-gray-500 mt-1">{analytics.cuponsUtilizados} cupons utilizados</p>
        </div>

        <div className="neuro-card p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">NPS Score</h3>
            <TrendingUp className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {analytics.npsScore > 0 ? '+' : ''}{analytics.npsScore}
          </p>
          <p className="text-xs text-gray-500 mt-1">Índice de satisfação</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline de Leads */}
        <div className="neuro-card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Evolução de Leads</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="data" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="leads" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Origem dos Leads */}
        <div className="neuro-card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Fonte de Aquisição</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={origensData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {origensData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance por Pesquisa */}
      {analytics.performancePesquisas.length > 0 && (
        <div className="neuro-card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance por Pesquisa</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-3 text-sm font-medium text-gray-700">Pesquisa</th>
                  <th className="text-center p-3 text-sm font-medium text-gray-700">Respostas</th>
                  <th className="text-center p-3 text-sm font-medium text-gray-700">Cupons Gerados</th>
                  <th className="text-center p-3 text-sm font-medium text-gray-700">Cupons Usados</th>
                  <th className="text-center p-3 text-sm font-medium text-gray-700">Taxa Resgate</th>
                  <th className="text-center p-3 text-sm font-medium text-gray-700">NPS</th>
                </tr>
              </thead>
              <tbody>
                {analytics.performancePesquisas.map((pesquisa, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-800">{pesquisa.nome}</td>
                    <td className="p-3 text-center text-gray-700">{pesquisa.respostas}</td>
                    <td className="p-3 text-center text-gray-700">{pesquisa.cuponsGerados}</td>
                    <td className="p-3 text-center text-gray-700">{pesquisa.cuponsUtilizados}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        parseFloat(pesquisa.taxaResgate) >= 20 ? 'bg-green-100 text-green-700' :
                        parseFloat(pesquisa.taxaResgate) >= 10 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {pesquisa.taxaResgate}%
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        pesquisa.nps >= 50 ? 'bg-green-100 text-green-700' :
                        pesquisa.nps >= 0 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {pesquisa.nps > 0 ? '+' : ''}{pesquisa.nps}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Performance por Cupom */}
      {analytics.performanceCupons.length > 0 && (
        <div className="neuro-card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance por Cupom</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.performanceCupons}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="nome" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
              />
              <Legend />
              <Bar dataKey="gerados" fill="#8b5cf6" name="Gerados" />
              <Bar dataKey="utilizados" fill="#10b981" name="Utilizados" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Insights e Recomendações */}
      <div className="neuro-card p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Insights e Recomendações
        </h3>
        <div className="space-y-3">
          {parseFloat(analytics.taxaResgateGeral) < 15 && (
            <div className="p-3 bg-white rounded-lg">
              <p className="text-sm text-gray-800">
                💡 <strong>Sua taxa de resgate está abaixo de 15%.</strong> Considere criar cupons mais atrativos 
                ou reduzir o valor mínimo de compra para aumentar a conversão.
              </p>
            </div>
          )}
          
          {analytics.npsScore < 50 && (
            <div className="p-3 bg-white rounded-lg">
              <p className="text-sm text-gray-800">
                💡 <strong>Seu NPS está abaixo de 50.</strong> Foque em entender os feedbacks dos detratores 
                e implemente melhorias para aumentar a satisfação.
              </p>
            </div>
          )}
          
          {analytics.origens.pesquisa_nps > analytics.origens.campanha * 2 && (
            <div className="p-3 bg-white rounded-lg">
              <p className="text-sm text-gray-800">
                🎯 <strong>Pesquisas NPS são sua principal fonte de leads.</strong> Continue investindo em 
                pesquisas de satisfação e considere criar mais campanhas diretas de cupons.
              </p>
            </div>
          )}
          
          {analytics.totalLeads > 50 && parseFloat(analytics.taxaResgateGeral) >= 20 && (
            <div className="p-3 bg-white rounded-lg">
              <p className="text-sm text-gray-800">
                🎉 <strong>Excelente desempenho!</strong> Você está capturando muitos leads e com ótima taxa 
                de conversão. Continue assim!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}