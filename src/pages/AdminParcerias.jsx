
import React, { useState, useEffect } from 'react';
import { Parceria, NotificacaoParceria, User } from '@/entities/all';
import { Plus, Edit, Trash2, Calendar, Tag, Star, Bell, Upload, X } from 'lucide-react';
import { Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { recommendOffers } from '@/functions/recommendOffers';

// Modal aprimorado para criar/editar parcerias
const ParceriaModal = ({ parceria, onClose, onSave }) => {
    const [formData, setFormData] = useState(parceria || {
        titulo: '',
        descricao: '',
        link: '',
        imagem_url: '',
        categoria: 'roupas',
        codigo_cupom: '',
        valor_original: '',
        valor_promocional: '',
        data_inicio: '',
        data_fim: '',
        ativa: true,
        destaque: false
    });
    const [enviarNotificacao, setEnviarNotificacao] = useState(!parceria); // true se for nova oferta
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imagePreview, setImagePreview] = useState(parceria?.imagem_url || '');

    useEffect(() => {
        // Update image preview if formData.imagem_url changes externally (e.g., when editing an existing partnership)
        if (formData.imagem_url !== imagePreview) {
            setImagePreview(formData.imagem_url);
        }
    }, [formData.imagem_url, imagePreview]); // Added imagePreview to dependencies to avoid stale closure warning, though it's set internally

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tipo de arquivo
        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione apenas arquivos de imagem.');
            return;
        }

        // Validar tamanho (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('A imagem deve ter no máximo 5MB.');
            return;
        }

        setUploadingImage(true);
        try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            setFormData({ ...formData, imagem_url: file_url });
            setImagePreview(file_url);
        } catch (error) {
            console.error('Erro ao fazer upload da imagem:', error);
            alert('Erro ao fazer upload da imagem. Tente novamente.');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleRemoveImage = () => {
        setFormData({ ...formData, imagem_url: '' });
        setImagePreview('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData, enviarNotificacao);
    };

    const calcularDesconto = () => {
        if (formData.valor_original && formData.valor_promocional) {
            const original = parseFloat(formData.valor_original);
            const promocional = parseFloat(formData.valor_promocional);

            if (original > 0 && promocional < original) {
                const desconto = ((original - promocional) / original) * 100;
                return Math.round(desconto);
            }
        }
        return 0;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="neuro-card p-8 max-w-3xl w-full max-h-screen overflow-y-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    {parceria ? 'Editar' : 'Nova'} Oferta de Parceria
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Título da Oferta *
                            </label>
                            <input
                                type="text"
                                value={formData.titulo}
                                onChange={e => setFormData({...formData, titulo: e.target.value})}
                                className="neuro-input w-full p-3"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Categoria *
                            </label>
                            <select
                                value={formData.categoria}
                                onChange={e => setFormData({...formData, categoria: e.target.value})}
                                className="neuro-input w-full p-3"
                            >
                                <option value="roupas">Cápsula de Roupas</option>
                                <option value="software">Software</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Descrição
                        </label>
                        <textarea
                            value={formData.descricao}
                            onChange={e => setFormData({...formData, descricao: e.target.value})}
                            className="neuro-input w-full p-3 h-24 resize-none"
                            placeholder="Descreva os benefícios da oferta..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Link da Oferta *
                        </label>
                        <input
                            type="url"
                            value={formData.link}
                            onChange={e => setFormData({...formData, link: e.target.value})}
                            className="neuro-input w-full p-3"
                            required
                        />
                    </div>

                    {/* Área de Upload de Imagem */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Imagem da Oferta
                        </label>

                        {imagePreview ? (
                            <div className="neuro-card p-4">
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-48 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute top-2 right-2 neuro-button p-2 bg-red-500 text-white hover:bg-red-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="neuro-card p-6 border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        id="image-upload"
                                        disabled={uploadingImage}
                                    />
                                    <label
                                        htmlFor="image-upload"
                                        className="flex flex-col items-center justify-center cursor-pointer"
                                    >
                                        {uploadingImage ? (
                                            <div className="text-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                                <p className="text-sm text-gray-600">Fazendo upload...</p>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload className="w-12 h-12 text-gray-400 mb-2" />
                                                <p className="text-sm font-medium text-gray-700 mb-1">
                                                    Clique para fazer upload
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    PNG, JPG ou GIF (máx. 5MB)
                                                </p>
                                            </>
                                        )}
                                    </label>
                                </div>

                                <div className="text-center">
                                    <span className="text-sm text-gray-500">ou</span>
                                </div>

                                <input
                                    type="url"
                                    value={formData.imagem_url}
                                    onChange={e => {
                                        setFormData({...formData, imagem_url: e.target.value});
                                        setImagePreview(e.target.value);
                                    }}
                                    className="neuro-input w-full p-3"
                                    placeholder="Cole a URL da imagem aqui"
                                />
                            </div>
                        )}
                    </div>

                    {/* Seção de Valores */}
                    <div className="neuro-card p-4 bg-blue-50">
                        <h4 className="font-medium text-blue-800 mb-4">💰 Valores da Oferta</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Valor Original (R$)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.valor_original}
                                    onChange={e => setFormData({...formData, valor_original: parseFloat(e.target.value) || ''})}
                                    className="neuro-input w-full p-3"
                                    placeholder="Ex: 299.00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Valor Promocional (R$)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.valor_promocional}
                                    onChange={e => setFormData({...formData, valor_promocional: parseFloat(e.target.value) || ''})}
                                    className="neuro-input w-full p-3"
                                    placeholder="Ex: 199.00"
                                />
                            </div>
                        </div>

                        {formData.valor_original && formData.valor_promocional && parseFloat(formData.valor_promocional) < parseFloat(formData.valor_original) && (
                            <div className="mt-3 p-3 bg-green-100 rounded-lg text-center">
                                <p className="text-green-800 font-bold text-lg">
                                    🎉 Desconto de {calcularDesconto()}% na oferta!
                                </p>
                                <p className="text-green-700 text-sm mt-1">
                                    Economia de R$ {(parseFloat(formData.valor_original) - parseFloat(formData.valor_promocional)).toFixed(2)}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Código do Cupom
                            </label>
                            <input
                                type="text"
                                value={formData.codigo_cupom}
                                onChange={e => setFormData({...formData, codigo_cupom: e.target.value})}
                                className="neuro-input w-full p-3"
                                placeholder="Ex: DESCONTO20"
                            />
                        </div>

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
                    </div>

                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.ativa}
                                onChange={e => setFormData({...formData, ativa: e.target.checked})}
                                className="rounded"
                            />
                            <span className="text-sm text-gray-700">Oferta Ativa</span>
                        </label>

                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.destaque}
                                onChange={e => setFormData({...formData, destaque: e.target.checked})}
                                className="rounded"
                            />
                            <span className="text-sm text-gray-700">Destacar Oferta</span>
                        </label>
                    </div>

                    {!parceria && (
                        <div className="neuro-card p-4 bg-blue-50 border-2 border-blue-200">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={enviarNotificacao}
                                    onChange={e => setEnviarNotificacao(e.target.checked)}
                                    className="rounded"
                                />
                                <div>
                                    <span className="text-sm font-medium text-blue-800 flex items-center gap-2">
                                        <Bell className="w-4 h-4" />
                                        Notificar todos os usuários sobre esta nova oferta
                                    </span>
                                    <p className="text-xs text-blue-600 mt-1">
                                        Uma notificação será exibida no sistema para todos os clientes
                                    </p>
                                </div>
                            </label>
                        </div>
                    )}

                    <div className="flex justify-end gap-4 pt-6 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="neuro-button px-6 py-3 text-gray-700"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="neuro-button pressed px-6 py-3 text-gray-800 font-medium"
                            disabled={uploadingImage}
                        >
                            {uploadingImage ? 'Aguarde...' : 'Salvar Oferta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function AdminParcerias() {
    const [parcerias, setParcerias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingParceria, setEditingParceria] = useState(null);
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [recommendations, setRecommendations] = useState(null);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);

    useEffect(() => {
        checkAdminAndLoadParcerias();
        loadUsers();
    }, []);

    const checkAdminAndLoadParcerias = async () => {
        try {
            const user = await User.me();
            const adminEmails = ["robertosaretta@gmail.com"];
            const isAdmin = user.app_role === 'super_admin' || adminEmails.includes(user.email);

            if (!isAdmin) {
                window.location.href = '/Dashboard';
                return;
            }

            await loadParcerias();
        } catch (error) {
            console.error("Erro de autenticação:", error);
            window.location.href = '/Dashboard';
        } finally {
            setLoading(false);
        }
    };

    const loadParcerias = async () => {
        const data = await Parceria.list('-created_date');
        setParcerias(data);
    };

    const loadUsers = async () => {
        try {
            const allUsers = await User.list();
            setUsers(allUsers.filter(u => u.subscription_status === 'trial' || u.subscription_status === 'active'));
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
        }
    };

    const handleGenerateRecommendations = async (userId) => {
        setLoadingRecommendations(true);
        setSelectedUser(userId);
        setRecommendations(null); // Clear previous recommendations
        try {
            const { data } = await recommendOffers({ userId });
            setRecommendations(data);
        } catch (error) {
            console.error('Erro ao gerar recomendações:', error);
            alert('Erro ao gerar recomendações com IA.');
        } finally {
            setLoadingRecommendations(false);
        }
    };

    const handleSave = async (data, enviarNotificacao = false) => {
        try {
            let savedParceria;

            if (editingParceria) {
                await Parceria.update(editingParceria.id, data);
            } else {
                savedParceria = await Parceria.create(data);

                // Se deve enviar notificação, criar para todos os usuários
                if (enviarNotificacao && savedParceria) {
                    await NotificacaoParceria.create({
                        parceria_id: savedParceria.id,
                        titulo: '🎁 Nova Oferta Exclusiva Disponível!',
                        mensagem: `Confira: ${data.titulo}. Aproveite esta nova oportunidade nas suas configurações.`,
                        lida: false
                    });
                }
            }

            setShowModal(false);
            setEditingParceria(null);
            await loadParcerias();
        } catch (error) {
            console.error('Erro ao salvar oferta:', error);
            alert('Erro ao salvar oferta. Tente novamente.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir esta oferta?')) {
            await Parceria.delete(id);
            await loadParcerias();
        }
    };

    const handleEdit = (parceria) => {
        setEditingParceria(parceria);
        setShowModal(true);
    };

    const handleAddNew = () => {
        setEditingParceria(null);
        setShowModal(true);
    };

    const isOfertaValida = (parceria) => {
        if (!parceria.data_inicio && !parceria.data_fim) return true;
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0); // Normalize 'hoje' to start of day for comparison
        const inicio = parceria.data_inicio ? new Date(parceria.data_inicio) : null;
        if (inicio) inicio.setHours(0,0,0,0);
        const fim = parceria.data_fim ? new Date(parceria.data_fim) : null;
        if (fim) fim.setHours(23,59,59,999); // Normalize 'fim' to end of day for comparison

        if (inicio && hoje < inicio) return false;
        if (fim && hoje > fim) return false;
        return true;
    };

    const getDiscountPercentage = (original, promotional) => {
        if (original && promotional && promotional < original) {
            const originalFloat = parseFloat(original);
            const promotionalFloat = parseFloat(promotional);
            if (originalFloat > 0) {
                return Math.round(((originalFloat - promotionalFloat) / originalFloat) * 100);
            }
        }
        return 0;
    };


    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando ofertas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Gestão de Ofertas de Parceiros</h1>
                    <p className="text-gray-600">Gerencie as ofertas disponíveis para os clientes</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowRecommendations(!showRecommendations)}
                        className={`neuro-button px-6 py-3 flex items-center gap-2 font-medium ${
                            showRecommendations ? 'pressed text-purple-600' : 'text-gray-700'
                        }`}
                    >
                        <Sparkles className="w-5 h-5" />
                        Recomendações IA
                    </button>
                    <button
                        onClick={handleAddNew}
                        className="neuro-button pressed px-6 py-3 flex items-center gap-2 text-gray-800 font-medium"
                    >
                        <Plus className="w-5 h-5" /> Nova Oferta
                    </button>
                </div>
            </div>

            {showRecommendations && (
                <div className="neuro-card p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200">
                    <h2 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                        <Sparkles className="w-6 h-6" />
                        Sistema de Recomendações com IA
                    </h2>
                    <p className="text-purple-700 mb-6">
                        Selecione um usuário para receber recomendações personalizadas de ofertas baseadas em IA
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Seletor de Usuário */}
                        <div className="neuro-card p-4 bg-white">
                            <h3 className="font-semibold text-gray-800 mb-4">Selecionar Usuário</h3>
                            <div className="max-h-96 overflow-y-auto space-y-2">
                                {users.map(u => (
                                    <button
                                        key={u.id}
                                        onClick={() => handleGenerateRecommendations(u.id)}
                                        disabled={loadingRecommendations}
                                        className={`w-full text-left p-3 rounded-lg transition-all ${
                                            selectedUser === u.id
                                                ? 'bg-purple-100 border-2 border-purple-300'
                                                : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-800">{u.full_name}</p>
                                                <p className="text-sm text-gray-600">{u.email}</p>
                                            </div>
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                u.subscription_status === 'active'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-blue-100 text-blue-700'
                                            }`}>
                                                {u.subscription_status === 'active' ? 'Ativo' : 'Trial'}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Recomendações */}
                        <div className="neuro-card p-4 bg-white">
                            <h3 className="font-semibold text-gray-800 mb-4">Recomendações Geradas</h3>

                            {loadingRecommendations ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                                    <p className="text-gray-600">Analisando perfil e gerando recomendações...</p>
                                </div>
                            ) : recommendations ? (
                                <div className="space-y-4">
                                    {/* Perfil do Usuário */}
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <h4 className="font-semibold text-blue-800 mb-2">Perfil do Cliente</h4>
                                        <div className="text-sm text-blue-700 space-y-1">
                                            <p><strong>Setor:</strong> {recommendations.user_profile.setor}</p>
                                            <p><strong>Porte:</strong> {recommendations.user_profile.porte}</p>
                                            <p><strong>Score de Engajamento:</strong> {recommendations.user_profile.engagement_score}/100</p>
                                            <p><strong>Risco:</strong> <span className={`px-2 py-0.5 rounded ${
                                                recommendations.user_profile.nivel_risco === 'critico' ? 'bg-red-200 text-red-800' :
                                                recommendations.user_profile.nivel_risco === 'alto' ? 'bg-orange-200 text-orange-800' :
                                                recommendations.user_profile.nivel_risco === 'medio' ? 'bg-yellow-200 text-yellow-800' :
                                                'bg-green-200 text-green-800'
                                            }`}>
                                                {recommendations.user_profile.nivel_risco}
                                            </span></p>
                                        </div>
                                    </div>

                                    {/* Insights Gerais */}
                                    <div className="p-3 bg-purple-50 rounded-lg">
                                        <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                                            <Sparkles className="w-4 h-4" />
                                            Insights da IA
                                        </h4>
                                        <p className="text-sm text-purple-700 leading-relaxed">{recommendations.insights}</p>
                                    </div>

                                    {/* Ofertas Recomendadas */}
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-3">Ofertas Recomendadas</h4>
                                        <div className="space-y-3">
                                            {recommendations.recomendacoes.map((rec, index) => (
                                                <div key={index} className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex-1">
                                                            <h5 className="font-semibold text-gray-800">{rec.oferta.titulo}</h5>
                                                            <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                                                                rec.oferta.categoria === 'roupas' ? 'bg-pink-100 text-pink-800' : 'bg-indigo-100 text-indigo-800'
                                                            }`}>
                                                                {rec.oferta.categoria === 'roupas' ? '👗 Roupas' : '💻 Software'}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-1">
                                                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                                                rec.prioridade === 'alta' ? 'bg-red-100 text-red-700' :
                                                                rec.prioridade === 'media' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-green-100 text-green-700'
                                                            }`}>
                                                                {rec.prioridade}
                                                            </span>
                                                            <span className="text-sm font-semibold text-purple-600">
                                                                {rec.score_relevancia}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                                                        <strong>Por quê:</strong> {rec.motivo}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                    <p>Selecione um usuário para ver recomendações</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="neuro-card p-6">
                    <div className="flex items-center gap-3">
                        <div className="neuro-button p-3">
                            <Tag className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total de Ofertas</p>
                            <p className="text-2xl font-bold text-gray-800">{parcerias.length}</p>
                        </div>
                    </div>
                </div>

                <div className="neuro-card p-6">
                    <div className="flex items-center gap-3">
                        <div className="neuro-button p-3">
                            <Star className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Em Destaque</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {parcerias.filter(p => p.destaque).length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="neuro-card p-6">
                    <div className="flex items-center gap-3">
                        <div className="neuro-button p-3">
                            <Tag className="w-6 h-6 text-pink-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Roupas</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {parcerias.filter(p => p.categoria === 'roupas').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="neuro-card p-6">
                    <div className="flex items-center gap-3">
                        <div className="neuro-button p-3">
                            <Tag className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Softwares</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {parcerias.filter(p => p.categoria === 'software').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="neuro-card p-6">
                {parcerias.length === 0 ? (
                    <div className="text-center py-12">
                        <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhuma oferta cadastrada</h3>
                        <p className="text-gray-600 mb-6">Comece criando a primeira oferta de parceiro</p>
                        <button
                            onClick={handleAddNew}
                            className="neuro-button pressed px-6 py-3 text-gray-800 font-medium"
                        >
                            Criar Primeira Oferta
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {parcerias.map(p => (
                            <div key={p.id} className="neuro-button p-6 hover:shadow-lg transition-all">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <img
                                            src={p.imagem_url || 'https://via.placeholder.com/100'}
                                            alt={p.titulo}
                                            className="w-24 h-24 object-cover rounded-lg"
                                        />
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-800">{p.titulo}</h3>
                                            <p className="text-sm text-gray-600 mb-2">{p.descricao}</p>
                                            <a href={p.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 truncate max-w-xs block">{p.link}</a>

                                            <div className="flex items-center gap-2 mt-3 flex-wrap">
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    p.categoria === 'roupas' ? 'bg-pink-100 text-pink-800' : 'bg-indigo-100 text-indigo-800'
                                                }`}>
                                                    {p.categoria === 'roupas' ? '👗 Roupas' : '💻 Software'}
                                                </span>

                                                {p.destaque && (
                                                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 text-xs rounded-full flex items-center gap-1">
                                                        <Star className="w-3 h-3" /> Destaque
                                                    </span>
                                                )}

                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    p.ativa && isOfertaValida(p) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {p.ativa && isOfertaValida(p) ? 'Ativa' : 'Inativa'}
                                                </span>

                                                {p.valor_original && p.valor_promocional && parseFloat(p.valor_promocional) < parseFloat(p.valor_original) && (
                                                    <span className="bg-purple-100 text-purple-800 px-2 py-1 text-xs rounded-full">
                                                        -{getDiscountPercentage(p.valor_original, p.valor_promocional)}%
                                                    </span>
                                                )}
                                            </div>

                                            {p.codigo_cupom && (
                                                <div className="mt-2">
                                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded">
                                                        Cupom: {p.codigo_cupom}
                                                    </span>
                                                </div>
                                            )}

                                            {(p.valor_original || p.valor_promocional) && (
                                                <div className="mt-2 text-sm text-gray-700 flex items-center gap-1">
                                                    {p.valor_original && <span className={`text-gray-500 ${p.valor_promocional ? 'line-through' : ''}`}>R$ {parseFloat(p.valor_original).toFixed(2)}</span>}
                                                    {p.valor_promocional && <span className="font-bold text-green-700">R$ {parseFloat(p.valor_promocional).toFixed(2)}</span>}
                                                </div>
                                            )}

                                            {(p.data_inicio || p.data_fim) && (
                                                <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {p.data_inicio && `De ${new Date(p.data_inicio).toLocaleDateString('pt-BR')}`}
                                                    {p.data_inicio && p.data_fim && ' '}
                                                    {p.data_fim && `até ${new Date(p.data_fim).toLocaleDateString('pt-BR')}`}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(p)}
                                            className="neuro-button p-2 text-gray-600 hover:text-gray-800"
                                            title="Editar"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(p.id)}
                                            className="neuro-button p-2 text-red-600 hover:text-red-800"
                                            title="Excluir"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <ParceriaModal
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                    parceria={editingParceria}
                />
            )}
        </div>
    );
}
