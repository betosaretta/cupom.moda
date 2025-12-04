import React, { useState, useEffect } from 'react';
import { ConfiguracaoLGPD } from '@/entities/all';
import { Shield, Save, Eye, Edit } from 'lucide-react';

export default function AdminLGPD() {
  const [lgpdConfig, setLgpdConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    conteudo: '',
    resumo_aceite: '',
    resumo_exportacao: '',
    versao: '1.0'
  });

  useEffect(() => {
    loadLGPDConfig();
  }, []);

  const loadLGPDConfig = async () => {
    try {
      const configs = await ConfiguracaoLGPD.list();
      if (configs.length > 0) {
        const config = configs[0];
        setLgpdConfig(config);
        setFormData(config);
      } else {
        setEditing(true); // Se não existe, entrar em modo de edição
      }
    } catch (error) {
      console.error("Erro ao carregar configuração LGPD:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        data_atualizacao: new Date().toISOString().split('T')[0]
      };

      if (lgpdConfig) {
        await ConfiguracaoLGPD.update(lgpdConfig.id, dataToSave);
      } else {
        await ConfiguracaoLGPD.create(dataToSave);
      }
      
      setEditing(false);
      await loadLGPDConfig();
      alert("Configurações LGPD salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar configurações.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestão de LGPD</h1>
          <p className="text-gray-600">Configure os textos e políticas de privacidade</p>
        </div>
        <div className="flex gap-3">
          <a 
            href="/LGPD" 
            target="_blank" 
            className="neuro-button px-4 py-2 flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Visualizar Página
          </a>
          {!editing ? (
            <button 
              onClick={() => setEditing(true)}
              className="neuro-button px-4 py-2 flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Editar
            </button>
          ) : (
            <button 
              onClick={handleSave}
              disabled={saving}
              className="neuro-button pressed px-4 py-2 flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          )}
        </div>
      </div>

      <div className="neuro-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="neuro-button p-3">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Configuração da Política de Privacidade</h2>
            <p className="text-gray-600">Gerencie o conteúdo exibido aos usuários</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título da Página
            </label>
            {editing ? (
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                className="neuro-input w-full p-3"
                placeholder="Política de Privacidade e Proteção de Dados"
              />
            ) : (
              <p className="text-gray-800 p-3 bg-gray-50 rounded">{lgpdConfig?.titulo}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Versão
            </label>
            {editing ? (
              <input
                type="text"
                value={formData.versao}
                onChange={(e) => setFormData({...formData, versao: e.target.value})}
                className="neuro-input w-32 p-3"
                placeholder="1.0"
              />
            ) : (
              <p className="text-gray-800 p-3 bg-gray-50 rounded w-32">{lgpdConfig?.versao}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conteúdo Completo (HTML permitido)
            </label>
            {editing ? (
              <textarea
                value={formData.conteudo}
                onChange={(e) => setFormData({...formData, conteudo: e.target.value})}
                className="neuro-input w-full p-3 h-64 resize-none font-mono text-sm"
                placeholder="Digite o conteúdo completo da política de privacidade..."
              />
            ) : (
              <div className="p-4 bg-gray-50 rounded max-h-64 overflow-y-auto">
                <div dangerouslySetInnerHTML={{ __html: lgpdConfig?.conteudo }} />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resumo para Aceite no Sistema
            </label>
            {editing ? (
              <textarea
                value={formData.resumo_aceite}
                onChange={(e) => setFormData({...formData, resumo_aceite: e.target.value})}
                className="neuro-input w-full p-3 h-24 resize-none"
                placeholder="Texto resumido que aparece no modal de aceite inicial..."
              />
            ) : (
              <p className="text-gray-800 p-3 bg-gray-50 rounded">{lgpdConfig?.resumo_aceite}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resumo para Exportação de Dados
            </label>
            {editing ? (
              <textarea
                value={formData.resumo_exportacao}
                onChange={(e) => setFormData({...formData, resumo_exportacao: e.target.value})}
                className="neuro-input w-full p-3 h-24 resize-none"
                placeholder="Texto específico para o modal de exportação de dados..."
              />
            ) : (
              <p className="text-gray-800 p-3 bg-gray-50 rounded">{lgpdConfig?.resumo_exportacao}</p>
            )}
          </div>
        </div>

        {editing && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => {
                  setEditing(false);
                  setFormData(lgpdConfig || {});
                }}
                className="neuro-button px-6 py-3 text-gray-700"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="neuro-button pressed px-6 py-3 text-gray-800 font-medium disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}