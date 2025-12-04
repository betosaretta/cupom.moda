import React, { useState, useEffect } from 'react';
import { CodigoPromocional } from '@/entities/CodigoPromocional';
import { Parceiro } from '@/entities/Parceiro';
import { UsoCodigoPromocional } from '@/entities/UsoCodigoPromocional';
import { User } from '@/entities/User';
import { Plus, Edit, Trash2, Code, DollarSign, Users, BarChart3 } from 'lucide-react';

const CodigoModal = ({ codigo, parceiros, onClose, onSave }) => {
    const [formData, setFormData] = useState(codigo || {
        parceiro_id: '',
        codigo: '',
        descricao: '',
        tipo_desconto: 'percentual',
        valor_desconto: 0,
        limite_usos: 0,
        data_inicio: '',
        data_fim: '',
        ativo: true,
        comissao_por_uso: 0
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="neuro-card p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    {codigo ? 'Editar' : 'Novo'} Código Promocional
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Parceiro *
                            </label>
                            <select
                                required
                                value={formData.parceiro_id}
                                onChange={e => setFormData({...formData, parceiro_id: e.target.value})}
                                className="neuro-input w-full p-3"
                            >
                                <option value="">Selecione um parceiro</option>
                                {parceiros.map(p => (
                                    <option key={p.id} value={p.id}>{p.nome}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Código *
                            </label>
                            <input 
                                type="text" 
                                required
                                value={formData.codigo} 
                                onChange={e => setFormData({...formData, codigo: e.target.value.toUpperCase()})} 
                                className="neuro-input w-full p-3"
                                placeholder="DESCONTO20"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Descrição
                        </label>
                        <input 
                            type="text" 
                            value={formData.descricao} 
                            onChange={e => setFormData({...formData, descricao: e.target.value})} 
                            className="neuro-input w-full p-3"
                            placeholder="Descrição do código promocional"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de Desconto *
                            </label>
                            <select
                                required
                                value={formData.tipo_desconto}
                                onChange={e => setFormData({...formData, tipo_desconto: e.target.value})}
                                className="neuro-input w-full p-3"
                            >
                                <option value="percentual">Percentual (%)</option>
                                <option value="valor_fixo">Valor Fixo (R$)</option>
                                <option value="meses_gratis">Meses Grátis</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Valor do Desconto *
                            </label>
                            <input 
                                type="number" 
                                min="0"
                                step="0.01"
                                required
                                value={formData.valor_desconto} 
                                onChange={e => setFormData({...formData, valor_desconto: parseFloat(e.target.value)})} 
                                className="neuro-input w-full p-3"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Limite de Usos
                            </label>
                            <input 
                                type="number" 
                                min="0"
                                value={formData.limite_usos} 
                                onChange={e => setFormData({...formData, limite_usos: parseInt(e.target.value)})} 
                                className="neuro-input w-full p-3"
                                placeholder="0 = ilimitado"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Data de Início
                            </label>
                            <input 
                                type="date" 
                                value={formData.data_inicio} 
                                onChange={e => setFormData({...formData, data_inicio: e.target.value})} 
                                className="neuro-input w-full p-3"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Data de Fim
                            </label>
                            <input 
                                type="date" 
                                value={formData.data_fim} 
                                onChange={e => setFormData({...formData, data_fim: e.target.value})} 
                                className="neuro-input w-full p-3"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Comissão por Uso (R$)
                            </label>
                            <input 
                                type="number" 
                                min="0"
                                step="0.01"
                                value={formData.comissao_por_uso} 
                                onChange={e => setFormData({...formData, comissao_por_uso: parseFloat(e.target.value)})} 
                                className="neuro-input w-full p-3"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input 
                            type="checkbox" 
                            id="ativo"
                            checked={formData.ativo} 
                            onChange={e => setFormData({...formData, ativo: e.target.checked})} 
                            className="rounded"
                        />
                        <label htmlFor="ativo" className="text-sm text-gray-700">
                            Código Ativo
                        </label>
                    </div>

                    <div className="flex gap-3 pt-6">
                        <button 
                            type="submit" 
                            className="neuro-button pressed flex-1 py-3 text-gray-800 font-medium"
                        >
                            {codigo ? 'Salvar Alterações' : 'Criar Código'}
                        </button>
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="neuro-button flex-1 py-3 text-gray-700"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function AdminCodigos() {
    const [codigos, setCodigos] = useState([]);
    const [parceiros, setParceiros] = useState([]);
    const [usos, setUsos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingCodigo, setEditingCodigo] = useState(null);

    useEffect(() => {
        checkAdminAndLoadData();
    }, []);

    const checkAdminAndLoadData = async () => {
        try {
            const user = await User.me();
            setCurrentUser(user);
            
            const adminEmails = ["robertosaretta@gmail.com"];
            const isAdmin = adminEmails.includes(user.email);
            
            if (!isAdmin) {
                window.location.href = '/Dashboard';
                return;
            }
            
            await loadData();
        } catch (error) {
            console.error("Erro de autenticação:", error);
            window.location.href = '/Dashboard';
        } finally {
            setLoading(false);
        }
    };

    const loadData = async () => {
        try {
            const [codigosData, parceirosData, usosData] = await Promise.all([
                CodigoPromocional.list('-created_date'),
                Parceiro.list(),
                UsoCodigoPromocional.list('-created_date')
            ]);
            setCodigos(codigosData);
            setParceiros(parceirosData);
            setUsos(usosData);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    };

    const handleSave = async (data) => {
        try {
            if (editingCodigo) {
                await CodigoPromocional.update(editingCodigo.id, data);
            } else {
                await CodigoPromocional.create(data);
            }
            setShowModal(false);
            setEditingCodigo(null);
            await loadData();
        } catch (error) {
            console.error('Erro ao salvar código:', error);
            alert('Erro ao salvar código. Tente novamente.');
        }
    };

    const handleEdit = (codigo) => {
        setEditingCodigo(codigo);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este código?')) {
            try {
                await CodigoPromocional.delete(id);
                await loadData();
            } catch (error) {
                console.error('Erro ao excluir código:', error);
                alert('Erro ao excluir código. Tente novamente.');
            }
        }
    };

    const getParceiroName = (parceiroId) => {
        const parceiro = parceiros.find(p => p.id === parceiroId);
        return parceiro ? parceiro.nome : 'Parceiro não encontrado';
    };

    const getCodigoStats = (codigoId) => {
        const codigoUsos = usos.filter(u => u.codigo_promocional_id === codigoId);
        return {
            totalUsos: codigoUsos.length,
            comissaoTotal: codigoUsos.reduce((acc, u) => acc + (u.comissao_gerada || 0), 0)
        };
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando códigos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Códigos Promocionais</h1>
                    <p className="text-gray-600">Gerencie códigos promocionais e suas comissões</p>
                </div>
                <button 
                    onClick={() => { setEditingCodigo(null); setShowModal(true); }}
                    className="neuro-button pressed px-6 py-3 flex items-center gap-2 text-gray-800 font-medium"
                >
                    <Plus className="w-5 h-5" /> Novo Código
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="neuro-card p-6">
                    <div className="flex items-center gap-3">
                        <div className="neuro-button p-3">
                            <Code className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total de Códigos</p>
                            <p className="text-2xl font-bold text-gray-800">{codigos.length}</p>
                        </div>
                    </div>
                </div>

                <div className="neuro-card p-6">
                    <div className="flex items-center gap-3">
                        <div className="neuro-button p-3">
                            <BarChart3 className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Códigos Ativos</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {codigos.filter(c => c.ativo).length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="neuro-card p-6">
                    <div className="flex items-center gap-3">
                        <div className="neuro-button p-3">
                            <Users className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total de Usos</p>
                            <p className="text-2xl font-bold text-gray-800">{usos.length}</p>
                        </div>
                    </div>
                </div>

                <div className="neuro-card p-6">
                    <div className="flex items-center gap-3">
                        <div className="neuro-button p-3">
                            <DollarSign className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Comissões</p>
                            <p className="text-2xl font-bold text-gray-800">
                                R$ {usos.reduce((acc, u) => acc + (u.comissao_gerada || 0), 0).toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="neuro-card p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Lista de Códigos</h3>
                
                {codigos.length === 0 ? (
                    <div className="text-center py-12">
                        <Code className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhum código cadastrado</h3>
                        <p className="text-gray-600 mb-6">Comece criando o primeiro código promocional</p>
                        <button
                            onClick={() => { setEditingCodigo(null); setShowModal(true); }}
                            className="neuro-button pressed px-6 py-3 text-gray-800 font-medium"
                        >
                            Criar Primeiro Código
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {codigos.map(codigo => {
                            const stats = getCodigoStats(codigo.id);
                            return (
                                <div key={codigo.id} className="neuro-button p-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-8 gap-4 items-center">
                                        <div className="lg:col-span-2">
                                            <div className="flex items-center gap-3">
                                                <div className="neuro-button p-2">
                                                    <Code className="w-4 h-4 text-gray-600" />
                                                </div>
                                                <div>
                                                    <p className="font-mono font-bold text-blue-600">{codigo.codigo}</p>
                                                    <p className="text-sm text-gray-600">{codigo.descricao}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-600">Parceiro</p>
                                            <p className="font-medium text-gray-700">{getParceiroName(codigo.parceiro_id)}</p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-600">Desconto</p>
                                            <p className="font-semibold text-green-600">
                                                {codigo.valor_desconto}
                                                {codigo.tipo_desconto === 'percentual' ? '%' : 
                                                 codigo.tipo_desconto === 'valor_fixo' ? 'R$' : ' meses'}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-600">Usos</p>
                                            <p className="font-semibold text-purple-600">
                                                {stats.totalUsos}
                                                {codigo.limite_usos > 0 && `/${codigo.limite_usos}`}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-600">Comissão</p>
                                            <p className="font-semibold text-orange-600">R$ {stats.comissaoTotal.toFixed(2)}</p>
                                        </div>

                                        <div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                codigo.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {codigo.ativo ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(codigo)}
                                                className="neuro-button p-2 text-gray-600 hover:text-gray-800"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(codigo.id)}
                                                className="neuro-button p-2 text-red-600 hover:text-red-800"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {showModal && (
                <CodigoModal 
                    codigo={editingCodigo}
                    parceiros={parceiros}
                    onClose={() => setShowModal(false)} 
                    onSave={handleSave} 
                />
            )}
        </div>
    );
}