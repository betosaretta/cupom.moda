import React from "react";
import { Clock, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function TrialStatusCard({ user, onManage }) {
  const getDaysRemaining = () => {
    if (!user.trial_ends_at) return 0;
    const today = new Date();
    const endDate = new Date(user.trial_ends_at);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getStatusInfo = () => {
    const daysRemaining = getDaysRemaining();
    
    switch (user.subscription_status) {
      case 'active':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          status: 'Ativo',
          message: 'Assinatura ativa'
        };
      case 'trial':
        if (daysRemaining <= 0) {
          return {
            icon: XCircle,
            color: 'text-red-600',
            bgColor: 'bg-red-100',
            status: 'Trial Expirado',
            message: 'Trial expirou'
          };
        } else if (daysRemaining <= 3) {
          return {
            icon: AlertTriangle,
            color: 'text-red-600',
            bgColor: 'bg-red-100',
            status: 'Trial Expirando',
            message: `${daysRemaining} ${daysRemaining === 1 ? 'dia' : 'dias'} restantes`
          };
        } else if (daysRemaining <= 7) {
          return {
            icon: AlertTriangle,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-100',
            status: 'Trial Ativo',
            message: `${daysRemaining} dias restantes`
          };
        } else {
          return {
            icon: Clock,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
            status: 'Trial Ativo',
            message: `${daysRemaining} dias restantes`
          };
        }
      case 'past_due':
        return {
          icon: AlertTriangle,
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
          status: 'Pagamento Atrasado',
          message: 'Necessita atenção'
        };
      case 'canceled':
        return {
          icon: XCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          status: 'Cancelado',
          message: 'Assinatura cancelada'
        };
      default:
        return {
          icon: XCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          status: 'Inativo',
          message: 'Sem assinatura'
        };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="neuro-card p-4 hover:shadow-lg transition-all cursor-pointer" onClick={() => onManage(user)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`neuro-button p-2 ${statusInfo.bgColor}`}>
            <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
          </div>
          <div>
            <p className="font-semibold text-gray-800">{user.full_name}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-sm font-semibold ${statusInfo.color}`}>
            {statusInfo.status}
          </p>
          <p className="text-xs text-gray-500">
            {statusInfo.message}
          </p>
          {user.trial_ends_at && (
            <p className="text-xs text-gray-400">
              Expira: {format(new Date(user.trial_ends_at), 'dd/MM/yyyy', { locale: ptBR })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}