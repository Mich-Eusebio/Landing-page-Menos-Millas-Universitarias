import React from 'react';

const CalendarLegend = () => {
  const items = [
    { label: 'Disponible', color: 'bg-white/10 border-white/20' },
    { label: 'Seleccionado', color: 'bg-blue-600 border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.4)]' },
    { label: 'Ocupado', color: 'bg-red-500/20 border-red-500/40 opacity-50 grayscale' },
    { label: 'Día Especial', color: 'bg-white/10 border-amber-500/50 relative overflow-hidden', isSpecial: true },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-6 md:gap-12 py-8 border-b border-white/5">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-3">
          <div className={`w-5 h-5 rounded-md border ${item.color} flex items-center justify-center`}>
            {item.isSpecial && (
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            )}
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-white/60">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default CalendarLegend;
