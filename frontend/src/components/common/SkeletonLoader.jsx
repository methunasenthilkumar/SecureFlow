import React from 'react';

const SkeletonLoader = ({ count = 3, type = 'card' }) => {
  if (type === 'table') {
    return (
      <div className="space-y-3 animate-pulse">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-12 bg-slate-800/60 rounded-xl w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-32 bg-slate-800/60 rounded-2xl w-full" />
      ))}
    </div>
  );
};

export default SkeletonLoader;
