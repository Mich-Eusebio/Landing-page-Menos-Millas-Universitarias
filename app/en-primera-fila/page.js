"use client";
import React from 'react';
import { Loader2, Newspaper } from 'lucide-react';

export default function EnPrimeraFila() {
  return (
    <div className="min-h-screen bg-[#0a192f] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-amber-400/20 rounded-3xl flex items-center justify-center mb-8 border border-amber-400/20">
        <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
      </div>
      <h1 className="text-3xl font-black uppercase tracking-tighter mb-4">En Primera Fila</h1>
      <p className="text-blue-100/60 max-w-md mb-12">
        Estamos configurando el sistema de suscripciones para el newsletter semanal. ¡Muy pronto podrás unirte como un Early Believer!
      </p>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <input 
          type="email" 
          placeholder="Tu correo electrónico" 
          className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-amber-400 text-center"
        />
        <button className="px-10 py-5 bg-amber-400 text-slate-900 rounded-2xl font-black uppercase tracking-widest transition-all">
          Notificarme al lanzar
        </button>
      </div>
    </div>
  );
}
