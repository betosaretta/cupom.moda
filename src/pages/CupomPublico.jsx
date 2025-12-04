import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Cupom } from "@/entities/all";
import { Gift, Calendar, Scissors, CheckCircle } from "lucide-react";

export default function CupomPublico() {
    const [cupom, setCupom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const cupomId = params.get('id');

        if (cupomId) {
            const fetchCupom = async () => {
                try {
                    const data = await Cupom.filter({ id: cupomId });
                    if (data.length > 0) {
                        setCupom(data[0]);
                    } else {
                        setError("Cupom não encontrado ou inválido.");
                    }
                } catch (err) {
                    setError("Ocorreu um erro ao buscar o cupom.");
                } finally {
                    setLoading(false);
                }
            };
            fetchCupom();
        } else {
            setError("Nenhum cupom especificado.");
            setLoading(false);
        }
    }, [location]);

    const handleCopy = () => {
        navigator.clipboard.writeText(cupom.codigo_prefixo);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    
    if (loading) return <div className="text-center p-10">Carregando cupom...</div>;
    if (error) return <div className="text-center p-10 text-red-600">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="neuro-card max-w-md w-full p-8 text-center">
                <Gift className="w-16 h-16 mx-auto text-blue-600 mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 mb-2">{cupom.nome}</h1>
                <p className="text-gray-600 mb-6">{cupom.texto_cupom}</p>

                <div className="neuro-card p-6 border-2 border-dashed border-blue-300 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-50 p-1">
                        <Scissors className="w-6 h-6 text-gray-500" />
                    </div>
                    <p className="text-sm text-gray-500">Seu código de desconto é:</p>
                    <p className="text-4xl font-mono font-bold text-blue-700 my-3 tracking-widest">{cupom.codigo_prefixo}</p>
                    <button
                        onClick={handleCopy}
                        className="neuro-button pressed w-full py-3 text-gray-800 font-medium transition-all"
                    >
                        {copied ? (
                            <span className="flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5 text-green-600" /> Copiado!</span>
                        ) : "Copiar Código"}
                    </button>
                </div>

                <div className="mt-6 text-sm text-gray-500 space-y-2">
                    <p>
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Válido por <strong>{cupom.validade_dias} dias</strong> após a emissão.
                    </p>
                    {cupom.minimo_compra > 0 && (
                        <p>
                           Valor mínimo da compra: <strong>R$ {cupom.minimo_compra.toFixed(2)}</strong>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}