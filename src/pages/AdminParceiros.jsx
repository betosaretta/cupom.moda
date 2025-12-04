import React, { useState, useEffect } from 'react';
import { Parceiro, User } from '@/entities/all';
import { Plus, Edit, Trash2, Users, DollarSign, Building } from 'lucide-react';

const ParceiroModal = ({ parceiro, onClose, onSave }) => {
    const [formData, setFormData] = useState(parceiro || {
        nome: '',
        email: '',
        cnpj: '',
        telefone: '',
        comissao_percentual: 10,
        forma_pagamento: 'pix',
        dados_bancarios: '',
        ativo: true,
        observacoes: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="neuro-card p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    {parceiro ? 'Editar' : 'Novo'} Parceiro
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nome do Parceiro *
                            </label>
                            <input 
                                type="text" 
                                required
                                value={formData.nome} 
                                onChange={e => setFormData({...formData, nome: e.target.value})} 
                                className="neuro-input w-full p-3" 
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email *
                            </label>
                            <input 
                                type="email" 
                                required
                                value={formData.email} 
                                onChange={e => setFormData({...formData, email: e.target.value})} 
                                className="neuro-input w-full p-3" 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                CNPJ
                            </label>
                            <input 
                                type="text" 
                                value={formData.cnpj} 
                                onChange={e => setFormData({...formData, cnpj: e.target.value})} 
                                className="neuro-input w-full p-3"
                                placeholder="00.000.000/0000-00"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Telefone
                            </label>
                            <input 
                                type="text" 
                                value={formData.telefone} 
                                onChange={e => setFormData({...formData, telefone: e.target.value})} 
                                className="neuro-input w-full p-3"
                                placeholder="(00) 90000-0000"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Comissão (%) *
                            </label>
                            <input 
                                type="number" 
                                min="0"
                                max="100"
                                step="0.1"
                                required
                                value={formData.comissao_percentual} 
                                onChange={e => setFormData({...formData, comissao_percentual: parseFloat(e.target.value)})} 
                                className="neuro-input w-full p-3"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Forma de Pagamento
                            </label>
                            <select 
                                value={formData.forma_pagamento} 
                                onChange={e => setFormData({...formData, forma_pagamento: e.target.value})} 
                                className="neuro-input w-full p-3"
                            >
                                <option value="pix">PIX</option>
                                <option value="ted">TED</option>
                                <option value="boleto">Boleto</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Dados Bancários
                        </label>
                        <textarea 
                            value={formData.dados_bancarios} 
                            onChange={e => setFormData({...formData, dados_bancarios: e.target.value})} 
                            className="neuro-input w-full p-3 h-24 resize-none"
                            placeholder="Banco, agência, conta, PIX..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Observações
                        </label>
                        <textarea 
                            value={formData.observacoes} 
                            onChange={e => setFormData({...formData, observacoes: e.target.value})} 
                            className="neuro-input w-full p-3 h-20 resize-none"
                            placeholder="Observações adicionais..."
                        />
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
                            Parceiro Ativo
                        </label>
                    </div>

                    <div className="flex gap-3 pt-6">
                        <button 
                            type="submit" 
                            className="neuro-button pressed flex-1 py-3 text-gray-800 font-medium"
                        >
                            {parceiro ? 'Salvar Alterações' : 'Criar Parceiro'}
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

export default function AdminParceiros() {
    const [parceiros, setParceiros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingParceiro, setEditingParceiro] = useState(null);

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
            const parceirosData = await Parceiro.list('-created_date');
            setParceiros(parceirosData);
        } catch (error) {
            console.error('Erro ao carregar parceiros:', error);
        }
    };

    const handleSave = async (data) => {
        try {
            if (editingParceiro) {
                await Parceiro.update(editingParceiro.id, data);
            } else {
                await Parceiro.create(data);
            }
            setShowModal(false);
            setEditingParceiro(null);
            await loadData();
        } catch (error) {
            console.error('Erro ao salvar parceiro:', error);
            alert('Erro ao salvar parceiro. Tente novamente.');
        }
    };

    const handleEdit = (parceiro) => {
        setEditingParceiro(parceiro);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este parceiro?')) {
            try {
                await Parceiro.delete(id);
                await loadData();
            } catch (error) {
                console.error('Erro ao excluir parceiro:', error);
                alert('Erro ao excluir parceiro. Tente novamente.');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando parceiros...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Gestão de Parceiros</h1>
                    <p className="text-gray-600">Gerencie parceiros e suas comissões</p>
                </div>
                <button 
                    onClick={() => { setEditingParceiro(null); setShowModal(true); }}
                    className="neuro-button pressed px-6 py-3 flex items-center gap-2 text-gray-800 font-medium"
                >
                    <Plus className="w-5 h-5" /> Novo Parceiro
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="neuro-card p-6">
                    <div className="flex items-center gap-3">
                        <div className="neuro-button p-3">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total de Parceiros</p>
                            <p className="text-2xl font-bold text-gray-800">{parceiros.length}</p>
                        </div>
                    </div>
                </div>

                <div className="neuro-card p-6">
                    <div className="flex items-center gap-3">
                        <div className="neuro-button p-3">
                            <Building className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Parceiros Ativos</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {parceiros.filter(p => p.ativo).length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="neuro-card p-6">
                    <div className="flex items-center gap-3">
                        <div className="neuro-button p-3">
                            <DollarSign className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Comissão Média</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {parceiros.length > 0 ? 
                                    (parceiros.reduce((acc, p) => acc + p.comissao_percentual, 0) / parceiros.length).toFixed(1) + '%'
                                    : '0%'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lista de Parceiros */}
            <div className="neuro-card p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Lista de Parceiros</h3>
                
                {parceiros.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhum parceiro cadastrado</h3>
                        <p className="text-gray-600 mb-6">Comece criando o primeiro parceiro</p>
                        <button
                            onClick={() => { setEditingParceiro(null); setShowModal(true); }}
                            className="neuro-button pressed px-6 py-3 text-gray-800 font-medium"
                        >
                            Criar Primeiro Parceiro
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {parceiros.map(parceiro => (
                            <div key={parceiro.id} className="neuro-button p-6 grid grid-cols-1 lg:grid-cols-6 gap-4 items-center">
                                <div className="lg:col-span-2">
                                    <div className="flex items-center gap-3">
                                        <div className="neuro-button p-2">
                                            <Building className="w-4 h-4 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">{parceiro.nome}</p>
                                            <p className="text-sm text-gray-600">{parceiro.email}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600">Comissão</p>
                                    <p className="font-semibold text-purple-600">{parceiro.comissao_percentual}%</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600">Pagamento</p>
                                    <p className="font-medium text-gray-700">{parceiro.forma_pagamento.toUpperCase()}</p>
                                </div>

                                <div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        parceiro.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {parceiro.ativo ? 'Ativo' : 'Inativo'}
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(parceiro)}
                                        className="neuro-button p-2 text-gray-600 hover:text-gray-800"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(parceiro.id)}
                                        className="neuro-button p-2 text-red-600 hover:text-red-800"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <ParceiroModal 
                    parceiro={editingParceiro}
                    onClose={() => setShowModal(false)} 
                    onSave={handleSave} 
                />
            )}
        </div>
    );
}