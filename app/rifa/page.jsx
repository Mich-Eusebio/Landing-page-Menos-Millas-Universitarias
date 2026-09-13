"use client";
import React from 'react';
import { MessageCircle, Ticket, Heart } from 'lucide-react';

const RifaFinalizada = () => {
  const telefono = "18295705985"; // Formato internacional
  const mensaje = encodeURIComponent("Hola Michael, vi que la rifa ya terminó pero me gustaría hacer un aporte para apoyarte con tus estudios.");
  const whatsappUrl = `https://wa.me/${telefono}?text=${mensaje}`;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* Encabezado con Icono */}
        <div className="bg-amber-50 p-8 flex justify-center">
          <div className="relative">
            <Ticket className="w-16 h-16 text-amber-500 rotate-12" />
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              CERRADO
            </div>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">
            ¡La rifa ha concluido!
          </h1>
          
          <p className="text-slate-600 mb-6 leading-relaxed">
            Ya no hay más tickets disponibles porque el sorteo ha finalizado oficialmente. 
            Muchas gracias a todos los que participaron y me ayudaron en este camino.
          </p>

          <div className="h-px bg-slate-100 w-full mb-6" />

          {/* Sección de Aporte Voluntario */}
          <div className="bg-blue-50 rounded-2xl p-5 mb-8">
            <div className="flex justify-center mb-2">
              <Heart className="w-6 h-6 text-blue-600 fill-blue-600" />
            </div>
            <p className="text-blue-900 font-medium text-sm">
              ¿Aún quieres colaborar?
            </p>
            <p className="text-blue-700 text-xs mt-1">
              Si deseas hacer un aporte directo para mi proyecto universitario, puedes contactarme directamente.
            </p>
          </div>

          {/* Botón de WhatsApp */}
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-200"
          >
            <MessageCircle className="w-6 h-6" />
            Contáctame por WhatsApp
          </a>
          
          <p className="text-slate-400 text-[10px] mt-6 uppercase tracking-widest">
            Millas Universitarias • 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default RifaFinalizada;