import React from 'react';
import { Trophy } from 'lucide-react';

// Si COLORS no viene de una base de datos, defínelo aquí arriba
const COLORS = ['#2563eb', '#1e40af', '#60a5fa', '#3b82f6'];

const InitScreen = ({ onStart }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 text-center">
      <h1 className="text-4xl md:text-7xl lg:text-8xl font-black mb-8 leading-none tracking-tighter uppercase italic drop-shadow-2xl max-w-4xl">
        ¿SERÁS TÚ EL <span className="text-blue-600">GANADOR?</span>
      </h1>

      {/* Ruleta Decorativa */}
      <div className="relative mb-12 shrink-0 group">
        <div className="absolute inset-0 bg-blue-600/20 blur-[120px] rounded-full"></div>
        <div className="relative w-[30vh] h-[30vh] md:w-[40vh] md:h-[40vh] max-w-[400px] max-h-[400px]">
          <svg viewBox="0 0 100 100" className="w-full h-full opacity-80 animate-spin-slow">
            {[...Array(24)].map((_, i) => (
              <path 
                key={i} 
                d="M50 50 L50 0 A50 50 0 0 1 62.9 1.7 Z" 
                fill={COLORS[i % COLORS.length]} 
                transform={`rotate(${i * 15} 50 50)`} 
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 md:w-32 md:h-32 bg-white rounded-[2rem] md:rounded-[3rem] flex items-center justify-center shadow-2xl border-4 md:border-8 border-slate-900 rotate-[-12deg]">
              <Trophy className="text-blue-600 w-10 h-10 md:w-16 md:h-16" />
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onStart}
        className="group relative px-12 py-6 bg-blue-600 hover:bg-blue-500 rounded-[2rem] font-black text-2xl md:text-3xl transition-all shadow-[0_20px_50px_rgba(37,99,235,0.4)] active:scale-95 overflow-hidden"
      >
        COMENZAR SORTEO
      </button>
    </div>
  );
};

export default InitScreen;