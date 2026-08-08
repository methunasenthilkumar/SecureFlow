import React from 'react';

const StatCard = ({ title, value, change, icon: Icon, color = 'indigo' }) => {
  const colorMap = {
    indigo: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/30 text-indigo-400',
    cyan: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400',
    emerald: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
    amber: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400',
    rose: 'from-rose-500/20 to-red-500/10 border-rose-500/30 text-rose-400'
  };

  const bgStyle = colorMap[color] || colorMap.indigo;

  return (
    <div className={`p-5 rounded-2xl bg-gradient-to-br ${bgStyle} border glass-panel transition-all hover:scale-[1.02]`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</span>
        {Icon && (
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <h3 className="text-2xl font-bold tracking-tight text-white">{value}</h3>
        {change && (
          <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            {change}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
