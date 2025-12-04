import React, { useState, useEffect, useCallback } from "react";
import { Pesquisa } from "@/entities/Pesquisa";
import { Cupom } from "@/entities/Cupom";
import { User } from "@/entities/User";
import { Resposta } from "@/entities/Resposta";
import { Plus, AlertTriangle, Smile } from "lucide-react"; // Import Smile icon
import { useNavigate } from "react-router-dom";

import PesquisaCard from "../components/pesquisas/PesquisaCard";
import CriarPesquisaModal from "../components/pesquisas/CriarPesquisaModal";
import EditarPesquisaModal from "../components/pesquisas/EditarPesquisaModal";
import QRCodeModal from "../components/pesquisas/QRCodeModal";
import RespostasPesquisaModal from "../components/pesquisas/RespostasPesquisaModal";

export default function Pesquisas() {
  const [pesquisas, setPesquisas] = useState([]);
  const [cupons, setCupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPesquisa, setEditingPesquisa] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedPesquisa, setSelectedPesquisa] = useState(null);
  const [showRespostasModal, setShowRespostasModal] = useState(false);
  const [pesquisaForRespostas, setPesquisaForRespostas] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPesquisa, setDeletingPesquisa] = useState(null);
  const navigate = useNavigate();

  const loadData = useCallback(async (lojaId) => {
    try {
      const [pesquisasData, cuponsData] = await Promise.all([
        Pesquisa.filter({ loja_id: lojaId }, "-created_date").catch(() => []),
        Cupom.filter({ loja_id: lojaId, ativo: true }).catch(() => [])
      ]);
      
      const pesquisasComStats = await Promise.all(
        (pesquisasData || []).map(async (pesquisa) => {
          try {
            const respostas = await Resposta.filter({ pesquisa_id: pesquisa.id }).catch(() => []);
            const total = respostas.length;
            const promotores = respostas.filter(r => r.nota >= 9).length;
            const detratores = respostas.filter(r => r.nota <= 6).length;
            const nps = total > 0 ? Math.round(((promotores - detratores) / total) * 100) : 0;
            return { ...pesquisa, total_respostas: total, nps_score: nps };
          } catch (error) {
            return { ...pesquisa, total_respostas: 0, nps_score: 0 };
          }
        })
      );
      
      setPesquisas(pesquisasComStats);
      setCupons(cuponsData || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setPesquisas([]);
      setCupons([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUserAndData = useCallback(async () => {
    setLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);
      if (user?.loja_id) {
        await loadData(user.loja_id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Erro de autenticação em Pesquisas, redirecionando para login:", error);
      await User.loginWithRedirect(window.location.href);
    }
  }, [loadData]);

  useEffect(() => {
    loadUserAndData();
  }, [loadUserAndData]);

  const handleCreatePesquisa = async (data) => {
    try {
      await Pesquisa.create({ ...data, loja_id: currentUser.loja_id });
      setShowCreateModal(false);
      await loadData(currentUser.loja_id);
    } catch (error) {
      console.error("Erro ao criar pesquisa:", error);
      alert("Erro ao criar pesquisa. Tente novamente.");
    }
  };
  
  const handleEditPesquisa = (pesquisa) => {
    setEditingPesquisa(pesquisa);
    setShowEditModal(true);
  };
  
  const handleUpdatePesquisa = async (id, data) => {
    try {
      await Pesquisa.update(id, data);
      setShowEditModal(false);
      setEditingPesquisa(null);
      await loadData(currentUser.loja_id);
    } catch (error) {
      console.error("Erro ao atualizar pesquisa:", error);
      alert("Erro ao atualizar pesquisa. Tente novamente.");
    }
  };

  const handleDeleteRequest = (pesquisa) => {
    setDeletingPesquisa(pesquisa);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingPesquisa) return;
    try {
      const respostas = await Resposta.filter({ pesquisa_id: deletingPesquisa.id });
      if (respostas && respostas.length > 0) {
        await Promise.all(respostas.map(r => Resposta.delete(r.id)));
      }
      await Pesquisa.delete(deletingPesquisa.id);
      setShowDeleteModal(false);
      setDeletingPesquisa(null);
      await loadData(currentUser.loja_id);
    } catch (error) {
      console.error("Erro ao excluir pesquisa:", error);
      alert("Houve um erro ao excluir a pesquisa. Tente novamente.");
    }
  };

  const handleShowQR = async (pesquisa) => {
    setSelectedPesquisa(pesquisa);
    setShowQRModal(true);
  };

  const handleViewResponses = (pesquisa) => {
    setPesquisaForRespostas(pesquisa);
    setShowRespostasModal(true);
  };
  
  const handleDownloadA4 = (pesquisa) => {
    const qrUrl = `${window.location.origin}/PesquisaCliente?id=${pesquisa.id}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}&format=png&color=1F2937&bgcolor=FFFFFF&qzone=1`;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Por favor, permita pop-ups para imprimir o material.");
      return;
    }
    printWindow.document.write(`
      <html><head><title>Material de Divulgação</title><style>@page{size:A4;margin:0}body{margin:0;font-family:Arial,sans-serif;width:210mm;height:297mm;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);display:flex;align-items:center;justify-content:center}.container{background:white;padding:60px;border-radius:20px;box-shadow:0 20px 40px rgba(0,0,0,0.1);text-align:center;max-width:80%}.title{font-size:48px;font-weight:bold;color:#1f2937;margin-bottom:30px}.subtitle{font-size:24px;color:#4b5563;margin-bottom:40px}.qr-container{margin:40px 0;padding:20px;background:#f8fafc;border-radius:15px;display:inline-block}.qr-code{width:300px;height:300px;border-radius:10px}.instructions{font-size:32px;font-weight:600;color:#111827;margin-top:30px}.footer{margin-top:40px;font-size:18px;color:#6b7280}</style></head><body><div class="container"><h1 class="title">${pesquisa.titulo}</h1><p class="subtitle">Sua opinião é importante!<br>Responda nossa pesquisa.</p><div class="qr-container"><img src="${qrCodeUrl}" alt="QR Code da Pesquisa" class="qr-code"></div><h2 class="instructions">📱 Aponte a câmera e participe!</h2><div class="footer"><p>Escaneie o código com a câmera do seu celular</p></div></div><script>setTimeout(()=>{window.print()},500)</script></body></html>`);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="space-y-6"><div className="flex justify-between items-center"><div><h1 className="text-3xl font-bold text-gray-800 mb-2">Pesquisas</h1><p className="text-gray-600">Carregando suas pesquisas...</p></div></div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{[...Array(3)].map((_,i)=><div key={i} className="neuro-card p-6 animate-pulse"><div className="h-5 bg-gray-300 rounded mb-4 w-3/4"></div><div className="h-3 bg-gray-200 rounded mb-2"></div><div className="h-3 bg-gray-200 rounded mb-4 w-5/6"></div><div className="h-8 bg-gray-300 rounded mt-4"></div></div>)}</div></div>
    );
  }

  if (!currentUser?.loja_id) {
    return (
      <div className="space-y-6"><div className="flex justify-between items-center"><div><h1 className="text-3xl font-bold text-gray-800 mb-2">Pesquisas</h1><p className="text-gray-600">Configure sua loja para começar</p></div></div><div className="neuro-card p-12 text-center"><Smile className="w-16 h-16 text-gray-400 mx-auto mb-4"/><h3 className="text-xl font-semibold text-gray-800 mb-2">Crie pesquisas para entender seus clientes</h3><p className="text-gray-600 mb-6">Para criar pesquisas, você precisa primeiro configurar sua loja.</p><button onClick={()=>navigate("/Configuracoes")} className="neuro-button px-6 py-3 text-gray-700 font-medium">Ir para Configurações</button></div></div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Pesquisas de Satisfação</h1>
          <p className="text-gray-600">Entenda seus clientes e ofereça cupons como recompensa.</p>
        </div>

        <button onClick={()=>setShowCreateModal(true)} className="neuro-button px-6 py-3 text-gray-700 font-medium hover:text-gray-900 transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5"/>
          Criar Pesquisa
        </button>
      </div>

      {pesquisas.length===0?(
        <div className="neuro-card p-12 text-center">
          <Smile className="w-16 h-16 text-gray-400 mx-auto mb-4"/>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Sua primeira pesquisa está a um clique de distância!</h3>
          <p className="text-gray-600 mb-6">Crie uma pesquisa para saber o que seus clientes pensam e ofereça um cupom para quem responder.</p>
          <button onClick={()=>setShowCreateModal(true)} className="neuro-button pressed px-6 py-3 text-gray-800 font-medium">
            Criar Primeira Pesquisa
          </button>
        </div>
      ):(
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pesquisas.map((pesquisa)=>(
            <PesquisaCard key={pesquisa.id} pesquisa={pesquisa} cupom={cupons.find((c)=>c.id===pesquisa.cupom_id)} onShowQR={handleShowQR} onDownloadA4={()=>handleDownloadA4(pesquisa)} onEdit={()=>handleEditPesquisa(pesquisa)} onViewResponses={()=>handleViewResponses(pesquisa)} onDelete={()=>handleDeleteRequest(pesquisa)}/>
          ))}
        </div>
      )}

      {showCreateModal && (<CriarPesquisaModal onClose={()=>setShowCreateModal(false)} onSave={handleCreatePesquisa} cupons={cupons}/>)}
      {showEditModal && editingPesquisa && (<EditarPesquisaModal pesquisa={editingPesquisa} onClose={()=>{setShowEditModal(false);setEditingPesquisa(null);}} onSave={handleUpdatePesquisa} cupons={cupons}/>)}
      {showQRModal && selectedPesquisa && (<QRCodeModal pesquisa={selectedPesquisa} onClose={()=>setShowQRModal(false)}/>)}
      {showRespostasModal && pesquisaForRespostas && (<RespostasPesquisaModal pesquisa={pesquisaForRespostas} onClose={()=>{setShowRespostasModal(false);setPesquisaForRespostas(null);}}/>)}
      
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="neuro-card p-8 max-w-md w-full">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4"/>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Confirmar Exclusão</h2>
              <p className="text-gray-600 mb-4">Você tem certeza que deseja excluir a pesquisa "{deletingPesquisa?.titulo}"?</p>
              <p className="text-sm text-yellow-700 bg-yellow-100 p-3 rounded-lg">Atenção: Esta ação é irreversível e excluirá todas as respostas associadas a esta pesquisa.</p>
            </div>
            <div className="flex gap-4 mt-6">
              <button onClick={()=>setShowDeleteModal(false)} className="neuro-button w-full py-3">Cancelar</button>
              <button onClick={handleConfirmDelete} className="neuro-button pressed w-full py-3 bg-red-500 text-white hover:bg-red-600">Sim, Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}