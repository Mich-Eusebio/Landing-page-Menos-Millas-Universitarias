"use client";
import React from 'react';
import { Loader2, MessageCircle } from 'lucide-react';

export default function ComprameUnDia() {
  return (
    <div className="min-h-screen bg-[#0a192f] text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-blue-600/20 rounded-3xl flex items-center justify-center mb-8 border border-blue-500/20">
        <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
      </div>
      <h1 className="text-3xl font-black uppercase tracking-tighter mb-4">Cómprame un día</h1>
      <p className="text-blue-100/60 max-w-md mb-12">
        Estamos preparando el calendario de días disponibles. Si quieres reservar una fecha especial ahora mismo, contáctame directamente por WhatsApp.
      </p>
      <a 
        href="https://wa.me/18295705985?text=Hola%20Michael!%20Quiero%20comprarte%20un%20d%C3%ADa%20de%20estudios.%20Dime%20qu%C3%A9%20fechas%20hay%20disponibles."
        className="px-10 py-5 bg-green-600 hover:bg-green-500 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 transition-all"
      >
        <MessageCircle className="w-6 h-6" /> Reservar por WhatsApp
      </a>
    </div>
  );
}
