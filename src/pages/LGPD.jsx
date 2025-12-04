import React, { useState, useEffect } from "react";
import { ConfiguracaoLGPD } from "@/entities/all";
import { Shield, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function LGPD() {
  const [lgpdData, setLgpdData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLGPD();
  }, []);

  const loadLGPD = async () => {
    try {
      const configs = await ConfiguracaoLGPD.list();
      if (configs.length > 0) {
        setLgpdData(configs[0]);
      } else {
        // LGPD padrão caso não tenha sido configurada
        setLgpdData({
          titulo: "Política de Privacidade e Proteção de Dados - Cupom.Moda",
          conteudo: `
            <h2>1. INFORMAÇÕES GERAIS</h2>
            <p>A presente Política de Privacidade contém informações sobre coleta, uso, armazenamento, tratamento e proteção dos dados pessoais dos usuários e visitantes do aplicativo Cupom.Moda, com a finalidade de demonstrar absoluta transparência quanto ao assunto e esclarecer a todos interessados sobre os tipos de dados que são coletados, os motivos da coleta e a forma como os usuários podem gerenciar ou excluir as suas informações pessoais.</p>
            
            <h2>2. COMO RECOLHEMOS OS DADOS PESSOAIS DO USUÁRIO E DO VISITANTE?</h2>
            <p>Os dados pessoais do usuário e visitante são recolhidos pela plataforma da seguinte forma:</p>
            <ul>
              <li>Quando o usuário cria uma conta/perfil na plataforma Cupom.Moda: estes dados são os dados de identificação básicos, como nome, e-mail, CNPJ da empresa. A partir deles, podemos identificar o usuário e o visitante, além de garantir uma maior segurança e bem-estar às suas necessidades. Ficam cientes os usuários e visitantes de que seu perfil na plataforma estará acessível a todos demais usuários e visitantes da plataforma Cupom.Moda.</li>
              <li>Quando um visitante acessa páginas do nosso site: as informações sobre interação e acesso são coletadas pela empresa para garantir uma melhor experiência ao usuário e visitante. Estes dados podem tratar sobre as palavras-chaves utilizadas em uma busca, o compartilhamento de um documento específico, comentários, visualizações de páginas, perfis, a URL de onde o usuário e visitante provêm, o navegador que utilizam e seus IPs de acesso, dentre outras que poderão ser armazenadas e retidas.</li>
            </ul>

            <h2>3. QUAIS DADOS PESSOAIS RECOLHEMOS SOBRE O USUÁRIO E VISITANTE?</h2>
            <p>Os dados pessoais do usuário e visitante recolhidos são os seguintes:</p>
            <ul>
              <li>Dados para a criação da conta/perfil na plataforma Cupom.Moda: nome, e-mail, CNPJ, telefone;</li>
              <li>Dados para otimização da navegação: acesso a páginas, IP do computador, localização aproximada, dentre outros;</li>
              <li>Dados de clientes das lojas: nome, WhatsApp, e-mail, respostas de pesquisas de satisfação;</li>
              <li>Dados financeiros: informações de pagamento processadas através do Stripe.</li>
            </ul>

            <h2>4. PARA QUE FINALIDADES UTILIZAMOS OS DADOS PESSOAIS DO USUÁRIO E VISITANTE?</h2>
            <p>Os dados pessoais do usuário e do visitante coletados e armazenados pela plataforma Cupom.Moda têm por finalidade:</p>
            <ul>
              <li>Bem-estar do usuário e visitante: aprimorar o produto e/ou serviço oferecido, facilitar, agilizar e cumprir os compromissos estabelecidos entre o usuário e a empresa, melhorar a experiência dos usuários e fornecer funcionalidades específicas a depender das características básicas do usuário.</li>
              <li>Melhorias da plataforma: compreender como o usuário utiliza os serviços da plataforma, para ajudar no desenvolvimento de negócios e técnicas.</li>
              <li>Comercial: os dados são usados para personalizar o conteúdo oferecido e gerar subsídio à plataforma para a melhora da qualidade no funcionamento dos serviços.</li>
              <li>Previsão do perfil do usuário: tratamento automatizados de dados pessoais para avaliar o uso na plataforma.</li>
              <li>Dados de terceiros: a plataforma Cupom.Moda recebe dados de terceiros, como plataformas de pagamento, para processar transações e manter a segurança.</li>
            </ul>

            <h2>5. POR QUANTO TEMPO OS DADOS PESSOAIS FICAM ARMAZENADOS?</h2>
            <p>Os dados pessoais do usuário e visitante são armazenados pela plataforma durante o período necessário para a prestação do serviço ou o cumprimento das finalidades previstas no presente documento, conforme o disposto no inciso I do artigo 15 da Lei 13.709/18.</p>

            <h2>6. SEGURANÇA DOS DADOS PESSOAIS ARMAZENADOS</h2>
            <p>A plataforma se compromete a aplicar as medidas técnicas e organizativas aptas a proteger os dados pessoais de acessos não autorizados e de situações de destruição, perda, alteração, comunicação ou difusão de tais dados.</p>

            <h2>7. COMPARTILHAMENTO DOS DADOS</h2>
            <p>O compartilhamento de dados do usuário ocorre apenas nas seguintes situações:</p>
            <ul>
              <li>Quando solicitado por lei ou por ordem judicial;</li>
              <li>Com prestadores de serviços essenciais (como processadores de pagamento);</li>
              <li>Com o consentimento explícito do usuário.</li>
            </ul>

            <h2>8. OS DADOS PESSOAIS ARMAZENADOS SERÃO TRANSFERIDOS A TERCEIROS?</h2>
            <p>Os dados pessoais podem ser compartilhados com terceiros apenas nas seguintes hipóteses:</p>
            <ul>
              <li>Comunicação a terceiros quando autorizada pelos usuários ou necessária para a prestação do serviço;</li>
              <li>Com empresas parceiras para melhorar nossos serviços, sempre respeitando a privacidade dos dados;</li>
              <li>Para cumprir obrigação legal ou regulamentária;</li>
              <li>Em caso de reestruturação societária.</li>
            </ul>

            <h2>9. CONSENTIMENTO</h2>
            <p>Ao utilizar os serviços e fornecer as informações pessoais na plataforma, o usuário está consentindo com a presente Política de Privacidade.</p>

            <h2>10. ALTERAÇÕES PARA ESSA POLÍTICA DE PRIVACIDADE</h2>
            <p>Reservamos o direito de modificar essa Política de Privacidade a qualquer tempo. As alterações e esclarecimentos vão surtir efeito imediatamente após sua publicação na plataforma.</p>

            <h2>11. JURISDIÇÃO PARA RESOLUÇÃO DE CONFLITOS</h2>
            <p>Para a solução de controvérsias decorrentes do presente instrumento será aplicado integralmente o Direito brasileiro.</p>

            <h2>12. COMO ENTRAR EM CONTATO CONOSCO</h2>
            <p>Se você tiver alguma dúvida sobre esta Política de Privacidade, entre em contato conosco através do e-mail: contato@cupom.moda</p>
          `
        });
      }
    } catch (error) {
      console.error("Erro ao carregar LGPD:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: '#f8fafc'}}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{background: '#f8fafc'}}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="neuro-card p-8">
          <div className="flex items-center gap-4 mb-8">
            <Link to="/Dashboard" className="neuro-button p-2">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="neuro-button p-3">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{lgpdData?.titulo}</h1>
              <p className="text-gray-600">Última atualização: {lgpdData?.data_atualizacao ? new Date(lgpdData.data_atualizacao).toLocaleDateString('pt-BR') : 'N/A'}</p>
            </div>
          </div>
          
          <div 
            className="prose prose-lg max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: lgpdData?.conteudo || '' }}
          />
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Versão {lgpdData?.versao || '1.0'} - Em caso de dúvidas, entre em contato conosco.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}