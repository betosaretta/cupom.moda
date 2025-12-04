import React, { useState, useEffect } from 'react';
import { User, Indicacao } from '@/entities/all';
import { Gift, Copy, Users, Calendar, Check, Share2 } from 'lucide-react';

export default function ReferralCard() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [indicacoes, setIndicacoes] = useState([]);
    const [creditsEarned, setCreditsEarned] = useState(0);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const userData = await User.me();
                setUser(userData);
                
                // Carregar indicações feitas por este usuário
                if (userData.referral_code) {
                    const minhasIndicacoes = await Indicacao.filter({ referrer_user_id: userData.id });
                    setIndicacoes(minhasIndicacoes);
                    
                    // Contar créditos aplicados
                    const creditosAplicados = minhasIndicacoes.filter(i => i.status === 'credit_applied').length;
                    setCreditsEarned(creditosAplicados);
                }
            } catch (error) {
                console.error("Failed to load user for referral card", error);
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, []);

    const generateReferralCode = async () => {
        setGenerating(true);
        try {
            const baseName = user.full_name.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '');
            const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
            const newCode = `${baseName}${randomSuffix}`;

            await User.updateMyUserData({ referral_code: newCode });
            const updatedUser = await User.me();
            setUser(updatedUser);
        } catch (error) {
            console.error("Failed to generate referral code", error);
            alert("Não foi possível gerar seu código. Tente novamente.");
        } finally {
            setGenerating(false);
        }
    };
    
    const copyToClipboard = () => {
        const realLink = `${window.location.origin}/Home?ref=${user?.referral_code}`;
        navigator.clipboard.writeText(realLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    
    const shareViaWhatsApp = () => {
        const realLink = `${window.location.origin}/Home?ref=${user?.referral_code}`;
        const message = `Olá! 👋\n\nEstou usando o Cupom.Moda para capturar mais clientes e aumentar minhas vendas. É incrível!\n\n🎁 Cadastre-se usando meu link e ganhe 1 MÊS GRÁTIS para experimentar:\n${realLink}\n\nVocê vai adorar! 🚀`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };
    
    if (loading) {
        return <div className="neuro-card p-6 animate-pulse h-48"></div>;
    }

    const referralLink = `cupom.moda/ref/${user?.referral_code}`;
    const totalCredits = user?.referral_credit_months || 0;

    return (
        <div className="neuro-card p-8 bg-gradient-to-br from-blue-50 to-purple-100 border-2 border-white">
            <div className="flex items-center gap-4 mb-4">
                <div className="neuro-button p-3 bg-yellow-400 text-white">
                    <Gift className="w-8 h-8" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-gray-800">Indique e Ganhe!</h3>
                    <p className="text-gray-600">Ganhe 1 mês de crédito para cada amigo que assinar.</p>
                </div>
            </div>

            {/* Área de Status dos Créditos */}
            {totalCredits > 0 && (
                <div className="neuro-card p-4 bg-green-50 border-2 border-green-200 mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Check className="w-6 h-6 text-green-600" />
                        <h4 className="text-lg font-bold text-green-800">
                            Parabéns! Você ganhou {totalCredits} {totalCredits === 1 ? 'mês' : 'meses'} de crédito!
                        </h4>
                    </div>
                    <p className="text-green-700 text-sm">
                        Seus créditos serão aplicados automaticamente nas próximas faturas.
                    </p>
                </div>
            )}

            {/* Estatísticas das Indicações */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="neuro-card p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        <span className="text-2xl font-bold text-blue-600">{indicacoes.length}</span>
                    </div>
                    <p className="text-sm text-gray-600">Amigos Indicados</p>
                </div>
                <div className="neuro-card p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-green-600" />
                        <span className="text-2xl font-bold text-green-600">{creditsEarned}</span>
                    </div>
                    <p className="text-sm text-gray-600">Créditos Ganhos</p>
                </div>
            </div>

            {/* Explicação do Programa */}
            <div className="text-center bg-white/50 p-4 rounded-lg my-6">
                <p className="text-sm text-gray-700 mb-2">
                    Seu amigo ganha <strong className="text-blue-600">1 mês grátis</strong> para começar, e você ganha 
                    <strong className="text-blue-600"> 1 mês de crédito</strong> na sua fatura após o primeiro pagamento dele.
                </p>
            </div>

            {user?.referral_code ? (
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Compartilhe seu Link de Indicação</label>
                        <div className="flex items-center gap-2 mt-1">
                            <input
                                type="text"
                                readOnly
                                value={referralLink}
                                className="neuro-input w-full p-3 text-gray-800 bg-white"
                            />
                            <button 
                                onClick={copyToClipboard} 
                                className="neuro-button p-3"
                                title="Copiar Link"
                            >
                                {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-gray-700" />}
                            </button>
                        </div>
                    </div>

                    {/* Botão de Compartilhar no WhatsApp */}
                    <button
                        onClick={shareViaWhatsApp}
                        className="neuro-button pressed w-full py-4 text-gray-800 font-bold text-lg flex items-center justify-center gap-2"
                    >
                        <Share2 className="w-5 h-5" />
                        Compartilhar via WhatsApp
                    </button>

                    {/* Lista de Indicações */}
                    {indicacoes.length > 0 && (
                        <div className="neuro-card p-4 bg-white/70">
                            <h4 className="font-medium text-gray-800 mb-3">Suas Indicações</h4>
                            <div className="space-y-2">
                                {indicacoes.map((indicacao, index) => (
                                    <div key={indicacao.id} className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">Indicação #{index + 1}</span>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            indicacao.status === 'credit_applied' 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {indicacao.status === 'credit_applied' ? 'Crédito Aplicado' : 'Aguardando Pagamento'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <button
                    onClick={generateReferralCode}
                    disabled={generating}
                    className="neuro-button pressed w-full py-4 text-gray-800 font-bold text-lg flex items-center justify-center gap-2"
                >
                    {generating ? 'Gerando...' : 'Gerar Meu Link de Indicação'}
                </button>
            )}
        </div>
    );
}