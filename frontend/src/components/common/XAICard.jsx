import React from 'react';
import { AlertTriangle, AlertCircle, Info, ShieldAlert } from 'lucide-react';

const XAICard = ({ reason }) => {
  const { title, description, severity = 'MEDIUM' } = reason;

  const severityMap = {
    CRITICAL: { icon: ShieldAlert, color: 'text-rose-400 border-rose-500/40 bg-rose-500/10' },
    HIGH: { icon: AlertTriangle, color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' },
    MEDIUM: { icon: AlertCircle, color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
    LOW: { icon: Info, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' }
  };

  const current = severityMap[severity] || severityMap.MEDIUM;
  const Icon = current.icon;

  return (
    <div className={`p-4 rounded-xl border ${current.color} flex items-start gap-3 transition-all`}>
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm text-slate-100">{title}</h4>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border opacity-90">
            {severity}
          </span>
        </div>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export default XAICard;
