import React from 'react';

const Badge = ({ type, text }) => {
  const normalized = (type || text || '').toUpperCase();

  let styleClass = 'bg-slate-800 text-slate-300 border-slate-700';

  if (['APPROVED', 'GENUINE', 'LOW', 'ACTIVE'].includes(normalized)) {
    styleClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  } else if (['PENDING_REVIEW', 'MEDIUM', 'PENDING'].includes(normalized)) {
    styleClass = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  } else if (['REJECTED', 'FRAUD', 'HIGH', 'CRITICAL', 'SUSPENDED'].includes(normalized)) {
    styleClass = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${styleClass}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
      {text || type}
    </span>
  );
};

export default Badge;
