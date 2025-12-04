import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Cupom } from "@/entities/Cupom";
import { User } from "@/entities/User";
import { Plus, Gift, AlertTriangle } from "lucide-react";
import { createPageUrl } from "@/utils";

import CupomCard from "../components/cupons/CupomCard";
import CriarCupomModal from "../components/cupons/CriarCupomModal";
import EditarCupomModal from "../components/cupons/EditarCupomModal";
import QRCodeCupomModal from "../components/cupons/QRCodeCupomModal";

export default function Cupons() {
  const [cupons, setCupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCupom, setEditingCupom] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedCupomForQr, setSelectedCupomForQr] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCupom, setDeletingCupom] = useState(null);
  const navigate = useNavigate();

  const loadData = useCallback(async (lojaId) => {
    try {
      const cuponsData = await Cupom.filter({ loja_id: lojaId }, "-created_date");
      setCupons(cuponsData);
    } catch (error) {
      console.error("Erro ao carregar cupons:", error);
    }
  }, []);

  const loadUserAndData = useCallback(async () => {
    setLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);
      if (user?.loja_id) {
        await loadData(user.loja_id);
      }
    } catch (error) {
      console.error("Erro de autenticação em Cupons, redirecionando para login:", error);
      await User.loginWithRedirect(window.location.href);
    } finally {
      setLoading(false);
    }
  }, [loadData]);

  useEffect(() => {
    loadUserAndData();
  }, [loadUserAndData]);

  const handleCreateCupom = async (data) => {
    try {
      if (!currentUser?.loja_id) {
        alert("Você precisa ter uma loja cadastrada para criar cupons. Vá em Configurações para criar sua loja.");
        return;
      }
      
      const cupomData = {
        ...data,
        loja_id: currentUser.loja_id,
      };
      
      await Cupom.create(cupomData);
      await loadData(currentUser.loja_id);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Erro ao criar cupom:", error);
      alert("Erro ao criar cupom: " + (error.message || "Verifique os dados e tente novamente."));
    }
  };

  const handleEditCupom = (cupom) => {
    setEditingCupom(cupom);
    setShowEditModal(true);
  };

  const handleUpdateCupom = async (id, data) => {
    try {
      await Cupom.update(id, data);
      await loadData(currentUser.loja_id);
      setShowEditModal(false);
      setEditingCupom(null);
    } catch (error) {
      console.error("Erro ao atualizar cupom:", error);
      alert("Erro ao atualizar cupom. Tente novamente.");
    }
  };

  const handleDeleteRequest = (cupom) => {
    setDeletingCupom(cupom);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCupom) return;

    try {
      await Cupom.delete(deletingCupom.id);
      setShowDeleteModal(false);
      setDeletingCupom(null);
      await loadData(currentUser.loja_id);
    } catch (error) {
      console.error("Erro ao excluir cupom:", error);
      alert("Houve um erro ao excluir o cupom. Tente novamente.");
    }
  };

  const handleShowQrCode = (cupom) => {
    setSelectedCupomForQr(cupom);
    setShowQrModal(true);
  };

  const handlePrintCupom = (cupom) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Por favor, permita pop-ups para imprimir o cupom.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Cupom - ${cupom.nome}</title>
          <style>
            @page { size: A4; margin: 0; }
            @media print {
              @page { margin: 0; }
              body { -webkit-print-color-adjust: exact; }
            }
            body { 
              margin: 0; 
              font-family: 'Arial', sans-serif; 
              width: 210mm; 
              height: 297mm; 
              background: linear-gradient(135deg, #f3e7e9 0%, #e3eeff 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20mm;
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 20px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              text-align: center;
              width: 100%;
              max-width: 500px;
              border: 1px solid #eee;
            }
            .title {
              font-size: 32px;
              font-weight: bold;
              color: #1f2937;
              margin-bottom: 20px;
              line-height: 1.2;
            }
            .discount-box {
              padding: 20px;
              margin: 20px 0;
              border: 3px dashed #667eea;
              border-radius: 15px;
            }
            .discount {
              font-size: 60px;
              font-weight: 900;
              color: #dc2626;
              line-height: 1;
            }
            .description {
              font-size: 18px;
              color: #4b5563;
              margin-bottom: 30px;
              line-height: 1.4;
            }
            .scan-box {
              background: #f8fafc;
              padding: 30px 20px;
              border-radius: 15px;
              margin-top: 30px;
            }
            .scan-title {
              font-size: 40px;
              font-weight: 900;
              color: #3b82f6;
              margin-bottom: 20px;
              text-transform: uppercase;
              letter-spacing: 2px;
            }
            .qr-code {
              width: 200px;
              height: 200px;
              border-radius: 10px;
              border: 5px solid white;
              box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            }
            .validity {
              margin-top: 30px;
              font-size: 16px;
              color: #6b7280;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="title">${cupom.nome}</h1>
            
            <div class="discount-box">
              <div class="discount">
                ${cupom.valor_desconto}${cupom.tipo_desconto === 'percentual' ? '%' : 'R$'} OFF
              </div>
              <p class="description">${cupom.texto_cupom || 'Aproveite seu desconto!'}</p>
            </div>
            
            <div class="scan-box">
              <h2 class="scan-title">Escaneie e Ganhe!</h2>
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}/CapturaLeadCupom?cupomId=${cupom.id}`)}&format=png&color=1F2937&bgcolor=FFFFFF&qzone=1"
                   alt="QR Code do Cupom" 
                   class="qr-code" />
            </div>
            
            <div class="validity">
              Válido por ${cupom.validade_dias} dias.
              ${cupom.minimo_compra > 0 ? `Compra mínima: R$ ${cupom.minimo_compra.toFixed(2)}.` : ''}
            </div>
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
              }, 500);
            }
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  const handleShowCreateModal = async () => {
    if (!currentUser) {
      alert("Você precisa estar logado para criar cupons.");
      return;
    }
    if (!currentUser.loja_id) {
      alert("Você precisa ter uma loja cadastrada para criar cupons. Vá para 'Minha Conta' para cadastrar sua loja.");
      navigate(createPageUrl('Configuracoes'));
      return;
    }

    const limite = currentUser.limite_cupons_ativos || 10;
    const cuponsAtivos = cupons.filter(c => c.ativo).length;
    if (cuponsAtivos >= limite) {
        alert(`Você atingiu o limite de ${limite} cupons ativos. Para criar um novo, por favor, desative um cupom existente ou contate o suporte para aumentar seu limite.`);
        return;
    }
    
    setShowCreateModal(true);
    };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-xl text-gray-700">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Cupons de Desconto</h1>
          <p className="text-gray-600">Crie e gerencie as promoções que atraem clientes.</p>
        </div>

        <button
          onClick={handleShowCreateModal}
          className="neuro-button pressed px-6 py-3 text-gray-800 font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Criar Cupom
        </button>
      </div>

      {!currentUser?.loja_id ? (
        <div className="neuro-card p-12 text-center border-2 border-orange-200 bg-orange-50">
          <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Conta Não Configurada</h3>
          <p className="text-gray-600 mb-6 max-w-lg mx-auto">
            Sua conta de usuário não está associada a nenhuma loja. Por favor, contate o administrador do sistema para que ele vincule sua conta a uma loja no painel de "Gestão de Clientes".
          </p>
        </div>
      ) : cupons.length === 0 ? (
        <div className="neuro-card p-12 text-center">
          <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Crie sua primeira oferta!</h3>
          <p className="text-gray-600 mb-6">
            Crie um cupom de desconto para usar nas suas pesquisas ou para campanhas na sua vitrine.
          </p>
          <button
            onClick={handleShowCreateModal}
            className="neuro-button pressed px-6 py-3 text-gray-800 font-medium"
          >
            Criar Primeiro Cupom
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cupons.map((cupom) => (
            <CupomCard
              key={cupom.id}
              cupom={cupom}
              onEdit={handleEditCupom}
              onDelete={handleDeleteRequest}
              onShowQrCode={handleShowQrCode}
              onPrintCupom={handlePrintCupom}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CriarCupomModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateCupom}
        />
      )}

      {showEditModal && editingCupom && (
        <EditarCupomModal
          cupom={editingCupom}
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdateCupom}
        />
      )}

      {showQrModal && selectedCupomForQr && (
        <QRCodeCupomModal
          cupom={selectedCupomForQr}
          onClose={() => setShowQrModal(false)}
        />
      )}
      
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="neuro-card p-8 max-w-md w-full">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-2">Excluir Cupom</h2>
              <p className="text-gray-600 mb-4">
                Você tem certeza que deseja excluir o cupom "{deletingCupom?.nome}"?
              </p>
              <p className="text-sm text-yellow-700 bg-yellow-100 p-3 rounded-lg mb-6">
                Atenção: Se este cupom estiver vinculado a pesquisas, elas deixarão de oferecer a recompensa.
              </p>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="neuro-button w-full py-3"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="neuro-button pressed w-full py-3 bg-red-500 text-white hover:bg-red-600"
              >
                Excluir Cupom
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}