import React from 'react';

const RiskMeter = ({ score = 0, size = 'md' }) => {
  const normalizedScore = Math.min(Math.max(score, 0), 100);
  
  let colorClass = 'text-emerald-500';
  let level = 'LOW RISK';

  if (normalizedScore >= 75) {
    colorClass = 'text-rose-500';
    level = 'CRITICAL FRAUD RISK';
  } else if (normalizedScore >= 50) {
    colorClass = 'text-rose-400';
    level = 'HIGH RISK';
  } else if (normalizedScore >= 25) {
    colorClass = 'text-amber-400';
    level = 'MEDIUM RISK';
  }

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative flex items-center justify-center">
        <svg className="w-36 h-36 transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            className="text-slate-800"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            className={`transition-all duration-1000 ease-out ${colorClass}`}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-3xl font-extrabold tracking-tight ${colorClass}`}>
            {normalizedScore}
          </span>
          <span className="text-[10px] uppercase font-bold text-slate-400">/ 100</span>
        </div>
      </div>
      <div className={`mt-2 font-bold text-xs tracking-wider uppercase ${colorClass}`}>
        {level}
      </div>
    </div>
  );
};

export default RiskMeter;
