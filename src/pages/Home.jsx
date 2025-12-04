
import React, { useState, useEffect } from "react";
import { User } from "@/entities/all";
import { createPageUrl } from "@/utils";
import { 
  Gift, 
  Users, 
  TrendingUp, 
  Star, 
  Check, 
  ArrowRight, 
  QrCode,
  BarChart3,
  Smartphone,
  Shield,
  Zap,
  Target,
  Clock
} from "lucide-react";

export default function Home() {
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        await User.me();
        window.location.href = createPageUrl('Dashboard');
      } catch (error) {
        // User not authenticated, allow the page to render.
        setLoading(false);
      }
    };
    checkAuthAndRedirect();
  }, []);

  const handleGetStarted = async () => {
    setLoading(true);
    try {
      await User.loginWithRedirect(window.location.origin + createPageUrl('Dashboard'));
    } catch (error) {
      console.error("Erro no login:", error);
      setLoading(false);
    }
  };

  const features = [
    {
      icon: QrCode,
      title: "QR Codes Inteligentes na Vitrine",
      description: "Transforme sua vitrine em uma máquina de leads. Coloque QR codes que capturam dados dos clientes e oferecem cupons instantâneos."
    },
    {
      icon: Gift,
      title: "Cupons Personalizados para Vitrine",
      description: "Crie cupons de desconto exclusivos para exibir na vitrine, atraindo clientes com ofertas irresistíveis."
    },
    {
      icon: BarChart3,
      title: "Pesquisas NPS que Convertem",
      description: "Colete feedback dos clientes e recompense com cupons. Melhore seu atendimento enquanto gera novas vendas."
    },
    {
      icon: Smartphone,
      title: "WhatsApp Integrado",
      description: "Receba leads e cupons diretamente no WhatsApp. Inicie conversas personalizadas e feche mais vendas."
    },
    {
      icon: Users,
      title: "Gestão Completa de Clientes",
      description: "Acompanhe histórico de compras, aniversários e preferências. Crie campanhas direcionadas que realmente funcionam."
    },
    {
      icon: Target,
      title: "Campanhas que Geram Resultados",
      description: "Múltiplos tipos de cupons para diferentes estratégias: promoções, liquidações, fidelização e muito mais."
    }
  ];

  const stats = [
    { number: "10.000+", label: "Leads Gerados", icon: Users },
    { number: "500+", label: "Lojas Ativas", icon: Gift },
    { number: "85%", label: "Taxa de Conversão", icon: TrendingUp },
    { number: "4.8", label: "Avaliação Média", icon: Star }
  ];

  const plans = [
    {
      name: "Plano Único",
      price: "149", // Updated price
      period: "mês",
      description: "Tudo que você precisa para crescer",
      features: [
        "Pesquisas NPS ilimitadas",
        "Cupons de desconto ilimitados",
        "Leads ilimitados",
        "WhatsApp integrado",
        "Dashboard completo",
        "Suporte prioritário"
      ],
      popular: true
    }
  ];

  const testimonials = [
    {
      name: "Maria Silva",
      role: "Proprietária - Boutique Elegante",
      content: "Com o Cupom.Moda aumentamos nossos leads em 300% e as vendas em 150%. A integração com WhatsApp é perfeita!",
      rating: 5
    },
    {
      name: "João Santos",
      role: "Gerente - Moda Center",
      content: "Ferramenta indispensável! Os cupons gerados pelas pesquisas NPS trouxeram clientes que nunca esperávamos.",
      rating: 5
    },
    {
      name: "Ana Costa",
      role: "Empresária - Look Fashion",
      content: "Simples de usar e muito eficiente. Nossos clientes adoram receber os cupons após dar feedback.",
      rating: 5
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: '#f8fafc'}}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Redirecionando para seu teste gratuito...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{background: '#f8fafc'}}>
      <header className="neuro-card sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="neuro-button p-2 mr-3">
                <Gift className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xl font-bold text-gray-800">Cupom.Moda</span>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900">Funcionalidades</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">Preços</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900">Depoimentos</a>
            </nav>
            
            <div className="flex items-center">
               <button
                onClick={handleGetStarted}
                disabled={loading}
                className="neuro-button pressed px-6 py-2 font-medium text-gray-800 flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? "Aguarde..." : "Começar Agora"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Transforme Sua <span className="text-blue-600">Vitrine</span> em uma <span className="text-purple-600">Máquina de Vendas</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto">
              Crie <strong>cupons exclusivos</strong> para sua vitrine e <strong>pesquisas inteligentes</strong> com QR codes. 
              Capture leads qualificados, colete feedback valioso e transforme visitantes em clientes fiéis.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button 
                onClick={handleGetStarted}
                disabled={loading}
                className="neuro-button pressed px-10 py-5 text-gray-800 font-bold text-xl flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all"
              >
                <Zap className="w-6 h-6" />
                {loading ? "Iniciando..." : "Testar 14 Dias GRÁTIS"}
              </button>
            </div>

            <div className="flex flex-col items-center text-sm text-gray-600 mb-8 space-y-2">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="font-medium">14 dias grátis • Sem cartão de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Após o período: apenas R$ 149/mês • Cancele quando quiser</span> {/* Updated price */}
              </div>
            </div>

            <div className="neuro-card p-6 bg-gradient-to-r from-green-50 to-blue-50 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-700"><strong>+500 lojas</strong> já usam</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-gray-700"><strong>4.8/5</strong> avaliação</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-700"><strong>+10k leads</strong> gerados</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="neuro-card p-6 mb-4 inline-block">
                  <stat.icon className="w-8 h-8 text-blue-600 mx-auto" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Cupons + Pesquisas = <span className="text-blue-600">Mais Vendas</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A combinação perfeita para lojas de moda: atraia clientes com cupons na vitrine e melhore continuamente com feedback inteligente.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="neuro-card p-8 hover:shadow-xl transition-all duration-300">
                <div className="neuro-button p-3 w-fit mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nova seção explicativa */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Como Funciona na Prática?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                💰 Cupons Estratégicos para Vitrine
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-xs font-bold text-blue-600">1</span>
                  </div>
                  <p className="text-gray-700">
                    <strong>Crie cupons irresistíveis:</strong> "10% OFF na primeira compra", "Compre 2 leve 3", "R$ 50 OFF acima de R$ 200"
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-xs font-bold text-blue-600">2</span>
                  </div>
                  <p className="text-gray-700">
                    <strong>Imprima materiais profissionais:</strong> Cartazes A4 com QR codes para colar na vitrine, balcão e provadores
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-xs font-bold text-blue-600">3</span>
                  </div>
                  <p className="text-gray-700">
                    <strong>Capture dados valiosos:</strong> Cliente escaneia, cadastra dados e recebe o cupom no WhatsApp
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                📊 Pesquisas que Melhoram seu Negócio
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-xs font-bold text-purple-600">1</span>
                  </div>
                  <p className="text-gray-700">
                    <strong>Feedback inteligente:</strong> "De 0 a 10, o quanto recomendaria nossa loja?" + perguntas personalizadas
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-xs font-bold text-purple-600">2</span>
                  </div>
                  <p className="text-gray-700">
                    <strong>Recompense a participação:</strong> Cliente responde e ganha cupom exclusivo na hora
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-xs font-bold text-purple-600">3</span>
                  </div>
                  <p className="text-gray-700">
                    <strong>Melhore continuamente:</strong> Veja seu NPS, identifique problemas e fidelize clientes satisfeitos
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <div className="neuro-card p-8 bg-gradient-to-r from-green-50 to-blue-50 max-w-2xl mx-auto">
              <h4 className="text-xl font-bold text-gray-900 mb-4">🎯 Resultado Garantido</h4>
              <p className="text-gray-700 mb-4">
                <strong>Mais leads, mais feedback, mais vendas.</strong> Suas campanhas funcionam 24/7, mesmo quando a loja está fechada.
              </p>
              <button 
                onClick={handleGetStarted}
                disabled={loading}
                className="neuro-button pressed px-8 py-3 text-gray-800 font-bold flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
              >
                <Zap className="w-5 h-5" />
                {loading ? "Iniciando..." : "Começar Agora - É Grátis!"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simples de Implementar
            </h2>
            <p className="text-xl text-gray-600">
              Em 3 passos você transforma sua loja em uma máquina de conversão
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="neuro-card p-8 mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <QrCode className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Configure Cupons e Pesquisas</h3>
                <p className="text-gray-600">Crie ofertas atrativas e pesquisas inteligentes em minutos. Personalize tudo para sua marca.</p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="neuro-card p-8 mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">2</span>
                </div>
                <Gift className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Imprima e Cole na Vitrine</h3>
                <p className="text-gray-600">Baixe materiais profissionais em A4 e posicione estrategicamente na loja para máxima visibilidade.</p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="neuro-card p-8 mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">3</span>
                </div>
                <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Acompanhe Resultados</h3>
                <p className="text-gray-600">Veja leads chegando, feedback em tempo real e vendas aumentando através do dashboard completo.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Preço simples e justo
            </h2>
            <p className="text-xl text-gray-600">
              Comece grátis hoje. Sem compromisso, sem pegadinhas.
            </p>
          </div>
          
          <div className="max-w-lg mx-auto">
            {plans.map((plan, index) => (
              <div key={index} className="neuro-card p-8 border-2 border-blue-200 relative overflow-hidden">
                {/* Badge de destaque */}
                <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 text-sm font-bold transform rotate-45 translate-x-1/4 -translate-y-1/4 origin-bottom-left">
                  MAIS POPULAR
                </div>
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-center justify-center mb-4">
                    <span className="text-5xl font-extrabold text-gray-900">R$ {plan.price}</span>
                    <span className="text-gray-600 ml-2 text-lg">/{plan.period}</span>
                  </div>
                  
                  {/* Destaque do teste grátis */}
                  <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full inline-block mb-4">
                    <span className="font-bold">✨ Primeiros 14 dias GRÁTIS</span>
                  </div>
                  
                  <p className="text-gray-600">{plan.description}</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button 
                  onClick={handleGetStarted}
                  disabled={loading}
                  className="neuro-button pressed w-full py-5 text-gray-800 font-bold text-xl flex items-center justify-center gap-3 disabled:opacity-50 mb-4"
                >
                  <Zap className="w-6 h-6" />
                  {loading ? "Iniciando..." : "Começar Teste Grátis Agora"}
                </button>
                
                <p className="text-center text-xs text-gray-500">
                  Configuração em 2 minutos • Suporte incluído • Sem fidelidade
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-xl text-gray-600">
              Mais de 500 lojas já transformaram suas vendas
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="neuro-card p-8">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/5 rounded-full"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Pronto para <span className="text-yellow-300">triplicar</span> suas vendas?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Mais de 500 lojistas já transformaram feedback em vendas reais. Seja o próximo!
          </p>
          
          {/* CTA principal com mais destaque */}
          <div className="space-y-6">
            <button 
              onClick={handleGetStarted}
              disabled={loading}
              className="neuro-card bg-white hover:bg-gray-50 text-gray-900 font-bold text-2xl px-12 py-6 flex items-center justify-center gap-4 mx-auto transition-all transform hover:scale-105 shadow-2xl disabled:opacity-50"
            >
              <Zap className="w-8 h-8 text-blue-600" />
              {loading ? "Iniciando seu teste..." : "COMEÇAR AGORA - 100% GRÁTIS"}
            </button>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-blue-100 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>Sem risco • Sem cartão</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>Ativação em 2 minutos</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>Suporte incluído</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="neuro-button p-2 mr-3">
                  <Gift className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-xl font-bold">Cupom.Moda</span>
              </div>
              <p className="text-gray-400">
                Transforme feedback em vendas com a plataforma mais completa para lojas de moda.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white">Funcionalidades</a></li>
                <li><a href="#pricing" className="hover:text-white">Preços</a></li>
                <li><a href="#" className="hover:text-white">Integrações</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white">Contato</a></li>
                <li><a href="/LGPD" className="hover:text-white">Privacidade</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-gray-400">
                <li>contato@cupom.moda</li>
                <li>(11) 99999-9999</li>
                <li>São Paulo, SP</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Cupom.Moda. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
