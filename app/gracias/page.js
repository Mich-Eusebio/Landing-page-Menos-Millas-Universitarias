"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Sparkles, ChevronRight, Instagram, MessageCircle, Share2 } from 'lucide-react';

const GraciasPage = () => {
  return (
    <div className="min-h-screen bg-[#0a192f] text-slate-100 font-sans selection:bg-blue-500 selection:text-white relative overflow-hidden flex flex-col items-center justify-center p-6 text-center">
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/10 blur-[120px] rounded-full"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl mx-auto space-y-12 relative z-10"
      >
        <div className="flex justify-center">
          <div className="relative">
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-32 h-32 bg-blue-600/20 rounded-full blur-2xl absolute inset-0"
            ></motion.div>
            <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-600/40 relative border border-white/20">
              <Heart className="w-12 h-12 text-white fill-white animate-pulse" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest">
            <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> ¡Hito Completado!</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none text-white">
            ¡GRACIAS POR <span className="text-blue-400 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-500">CREER!</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100/70 leading-relaxed font-medium">
            Tu aporte no es solo una contribución, es el combustible que hace real esta historia. Acabas de asegurar un día más en mi camino profesional.
          </p>
        </div>

        <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-sm space-y-6">
          <p className="text-sm font-black uppercase tracking-widest text-blue-400">¿Qué sigue ahora?</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-6 bg-slate-900/50 rounded-2xl border border-white/5 text-left space-y-2">
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <Instagram className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-sm font-bold text-white">Actualización en IG</p>
              <p className="text-xs text-blue-100/40 leading-relaxed">Publicaré tu nombre en mis historias como patrocinador oficial.</p>
            </div>
            <div className="p-6 bg-slate-900/50 rounded-2xl border border-white/5 text-left space-y-2">
              <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-sm font-bold text-white">Mensaje Personal</p>
              <p className="text-xs text-blue-100/40 leading-relaxed">Cuando llegue ese día, recibirás un mensaje especial desde el campus.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link href="/" className="px-10 py-5 bg-white text-[#0a192f] font-black rounded-2xl shadow-xl hover:scale-105 transition-all uppercase tracking-widest text-xs">
            Volver al Inicio
          </Link>
          <button 
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Menos Millas Universitarias',
                  text: '¡Acabo de patrocinar un día de estudios de Michael Eusebio! Únete tú también.',
                  url: 'https://millasmichael.do/comprame-un-dia'
                });
              }
            }}
            className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 hover:scale-105 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" /> Compartir Proyecto
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default GraciasPage;
