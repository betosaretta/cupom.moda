import Dashboard from './pages/Dashboard';
import Pesquisas from './pages/Pesquisas';
import PesquisaCliente from './pages/PesquisaCliente';
import Sucesso from './pages/Sucesso';
import Cupons from './pages/Cupons';
import AdminLojas from './pages/AdminLojas';
import GestaoAssinaturas from './pages/GestaoAssinaturas';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsuarios from './pages/AdminUsuarios';
import AdminConfiguracoes from './pages/AdminConfiguracoes';
import Configuracoes from './pages/Configuracoes';
import CupomPublico from './pages/CupomPublico';
import Clientes from './pages/Clientes';
import Vendas from './pages/Vendas';
import AdminAssinaturas from './pages/AdminAssinaturas';
import Home from './pages/Home';
import CapturaLeadCupom from './pages/CapturaLeadCupom';
import AdminParcerias from './pages/AdminParcerias';
import LGPD from './pages/LGPD';
import AdminLGPD from './pages/AdminLGPD';
import AdminParceiros from './pages/AdminParceiros';
import AdminCodigos from './pages/AdminCodigos';
import GestaoPlanos from './pages/GestaoPlanos';
import AdminPagamentos from './pages/AdminPagamentos';
import AdminTrials from './pages/AdminTrials';
import CadastroClientes from './pages/CadastroClientes';
import Ajuda from './pages/Ajuda';
import EmailMarketing from './pages/EmailMarketing';
import AdminFlodesk from './pages/AdminFlodesk';
import Relatorios from './pages/Relatorios';
import Suporte from './pages/Suporte';
import AdminChamados from './pages/AdminChamados';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Pesquisas": Pesquisas,
    "PesquisaCliente": PesquisaCliente,
    "Sucesso": Sucesso,
    "Cupons": Cupons,
    "AdminLojas": AdminLojas,
    "GestaoAssinaturas": GestaoAssinaturas,
    "AdminDashboard": AdminDashboard,
    "AdminUsuarios": AdminUsuarios,
    "AdminConfiguracoes": AdminConfiguracoes,
    "Configuracoes": Configuracoes,
    "CupomPublico": CupomPublico,
    "Clientes": Clientes,
    "Vendas": Vendas,
    "AdminAssinaturas": AdminAssinaturas,
    "Home": Home,
    "CapturaLeadCupom": CapturaLeadCupom,
    "AdminParcerias": AdminParcerias,
    "LGPD": LGPD,
    "AdminLGPD": AdminLGPD,
    "AdminParceiros": AdminParceiros,
    "AdminCodigos": AdminCodigos,
    "GestaoPlanos": GestaoPlanos,
    "AdminPagamentos": AdminPagamentos,
    "AdminTrials": AdminTrials,
    "CadastroClientes": CadastroClientes,
    "Ajuda": Ajuda,
    "EmailMarketing": EmailMarketing,
    "AdminFlodesk": AdminFlodesk,
    "Relatorios": Relatorios,
    "Suporte": Suporte,
    "AdminChamados": AdminChamados,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};