"use client";
import React from 'react';

const OldProgressBar = ({ progressData }) => {
  return (
    <section className="py-12 px-6 bg-slate-950/20 relative z-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-blue-400 mb-1">Estado de la meta</h3>
            <div className="text-3xl font-black text-white">PROGRESO ACADÉMICO</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-amber-400">{progressData.totalPercentage}%</div>
            <div className="text-xs font-bold uppercase tracking-widest opacity-40">Completado</div>
          </div>
        </div>

        <div className="relative h-16 bg-white/5 rounded-3xl p-2 border border-white/10 flex gap-2">
          {[1, 2, 3, 4].map((year) => (
            <div key={year} className="flex-1 relative group">
              <div className="absolute inset-0 bg-white/5 rounded-2xl border border-white/5"></div>
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest opacity-30 group-hover:opacity-100 transition-opacity">
                Año {year}
              </div>
              <div
                className={`absolute inset-0 rounded-2xl transition-all duration-1000 flex items-center justify-center overflow-hidden ${progressData.totalPercentage >= (year * 25) ? 'bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]' :
                  progressData.totalPercentage > ((year - 1) * 25) ? 'bg-gradient-to-r from-green-500 to-transparent' : ''
                  }`}
                style={{
                  width: progressData.totalPercentage > ((year - 1) * 25) && progressData.totalPercentage < (year * 25)
                    ? `${(progressData.totalPercentage - (year - 1) * 25) / 25 * 100}%`
                    : progressData.totalPercentage >= (year * 25) ? '100%' : '0%'
                }}
              >
                {progressData.totalPercentage > ((year - 1) * 25) && progressData.totalPercentage < (year * 25) && (
                  <span className="text-[10px] font-black text-white relative z-20 animate-pulse">
                    {progressData.currentYearProgress}%
                  </span>
                )}
                {progressData.totalPercentage > ((year - 1) * 25) && (
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:20px_20px] animate-[shimmer_2s_linear_infinite]"></div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-2 mt-4 text-center">
          <div className="text-[10px] font-bold uppercase tracking-tighter opacity-40">Freshman</div>
          <div className="text-[10px] font-bold uppercase tracking-tighter opacity-40">Sophomore</div>
          <div className="text-[10px] font-bold uppercase tracking-tighter opacity-40">Junior</div>
          <div className="text-[10px] font-bold uppercase tracking-tighter opacity-40">Senior</div>
        </div>
      </div>
    </section>
  );
};

export default OldProgressBar;
