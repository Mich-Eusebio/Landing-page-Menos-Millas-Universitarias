import React from 'react';
import { History, Trophy, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

const Sidebar = ({ sidebarOpen, setSidebarOpen, activeWinners, setGanadorActual, setView }) => {
  return (
    <aside className={`
      fixed md:relative z-40 h-full bg-slate-950/95 border-r border-white/10 backdrop-blur-2xl transition-all duration-500 ease-in-out
      ${sidebarOpen ? 'w-80 translate-x-0' : 'w-0 -translate-x-full md:w-20 md:translate-x-0'}
    `}>
      <div className={`p-6 h-full flex flex-col ${!sidebarOpen && 'md:hidden'}`}>
        <div className="flex items-center gap-3 mb-10 shrink-0">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <History className="text-white" size={20} />
          </div>
          <div className="text-left">
            <span className="font-black text-[10px] uppercase tracking-widest text-blue-500 block">Sorteos</span>
            <span className="font-black text-xs uppercase tracking-widest text-white block">En Espera</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar text-left">
          {activeWinners.length === 0 ? (
            <div className="text-center py-16 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
              <Trophy className="mx-auto mb-4 opacity-5" size={48} />
              <p className="text-[10px] font-black uppercase opacity-20 tracking-tighter">Sin pendientes</p>
            </div>
          ) : (
            activeWinners.map((w) => (
              <button
                key={w.id}
                onClick={() => { setGanadorActual(w); setView('status'); }}
                className="w-full text-left p-5 rounded-[2rem] bg-slate-800/40 border border-white/5 hover:border-blue-500/50 hover:bg-slate-800 transition-all group"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider truncate mr-2">{w.premio}</span>
                  <Clock size={12} className="text-rose-500 shrink-0" />
                </div>
                <p className="font-black text-lg leading-tight mb-3 group-hover:text-blue-400 transition-colors uppercase italic">{w.userName}</p>
                {/* Asumo que CountdownDisplay es otro componente */}
                <div className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 w-full py-2 rounded-xl text-center border border-rose-500/20 uppercase">
                   <span>Tiempo expiración...</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-1/2 -right-12 -translate-y-1/2 w-12 h-24 bg-blue-600 hover:bg-blue-500 border-y border-r border-white/20 rounded-r-3xl flex items-center justify-center shadow-xl z-50 transition-all active:scale-95"
      >
        {sidebarOpen ? <ChevronLeft size={32} /> : <ChevronRight size={32} />}
      </button>
    </aside>
  );
};

export default Sidebar;