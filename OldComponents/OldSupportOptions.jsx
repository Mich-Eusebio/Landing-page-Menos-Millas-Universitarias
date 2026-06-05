"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, Check, Calendar, Newspaper, MessageCircle } from 'lucide-react';

const OldSupportOptions = () => {
  return (
    <section id="apoyar" className="py-32 px-6 bg-[#050b16] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] bg-blue-600/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto text-center relative z-10">
        <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-4 leading-none">ELIGE TU <span className="text-blue-400">IMPACTO</span></h2>
        <p className="text-blue-100/60 text-lg mb-20 max-w-2xl mx-auto">No es una donación. Es tu lugar en una historia que estamos escribiendo juntos.</p>

        <div className="grid lg:grid-cols-2 gap-6 max-w-4xl mx-auto mb-32">
          <motion.div
            id="comprame-un-dia"
            whileHover={{ y: -10 }}
            className="p-10 rounded-[2.5rem] bg-blue-700 text-left flex flex-col h-full shadow-2xl relative group"
          >
            <div className="absolute top-6 right-6 w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 group-hover:bg-white transition-colors">
              <Calendar className="w-6 h-6 text-white group-hover:text-blue-700" />
            </div>
            <div className="flex-grow">
              <span className="inline-block px-3 py-1.5 rounded-full bg-white/10 text-white text-[9px] font-black uppercase tracking-widest mb-4 border border-white/10">
                Patrocinio Directo
              </span>
              <h3 className="text-3xl font-black uppercase tracking-tighter mb-2 text-white">Cómprame un día</h3>
              <div className="text-4xl font-black text-white mb-6 tracking-tighter italic">RD$3,000 <span className="text-base text-white/40 font-medium not-italic">/ día</span></div>

              <div className="space-y-4 text-white/80 text-sm leading-relaxed mb-8 font-medium">
                <p>Invierte un día de mis estudios y a cambio yo te dedico esa fecha públicamente.</p>
                <div className="text-xs italic border-l-2 border-white/40 pl-4 bg-white/5 py-2.5 space-y-1.5 text-white/70">
                  <p>"Voy a estudiar ingeniería en Nueva York. Ciego. Dominicano. Sin mapa."</p>
                  <p className="opacity-50">El día que llegué al campus. El día de mi primer examen. El día que entregué mi primer proyecto.</p>
                </div>
                <p className="font-bold text-white">Tú puedes ser parte de uno de esos días. No es una donación. Es tu lugar en mi historia.</p>
                <p className="text-xs text-white/70 italic">Cuando ese día llegue — te mando una foto, un audio, un momento real. Tuyo.</p>
              </div>
            </div>

            <Link href="/comprame-un-dia" className="w-full py-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-center text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2">
              Ver días disponibles <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ y: -10 }}
            className="p-10 rounded-[2.5rem] bg-amber-400 text-left flex flex-col h-full shadow-2xl relative group"
          >
            <div className="absolute top-6 right-6 w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Newspaper className="w-6 h-6 text-amber-400" />
            </div>
            <div className="flex-grow">
              <h3 className="text-3xl font-black uppercase tracking-tighter mb-2 text-slate-900">En primera fila</h3>
              <div className="text-4xl font-black text-slate-900 mb-6 tracking-tighter italic">RD$2,000 <span className="text-base text-slate-700/60 font-medium not-italic">/ mes</span></div>

              <div className="space-y-4 text-slate-800 text-sm leading-relaxed mb-8 font-medium">
                <p>Cada semana te informo desde adentro: lo que aprendo en tecnología y negocios, lo que escucho, lo que vivo. <span className="text-slate-900 font-bold underline decoration-slate-900/30 underline-offset-4">No es inspiración genérica.</span> Es el journey sin filtro de alguien abriendo un camino que no existía.</p>
                <ul className="space-y-2 mt-4">
                  <li className="flex items-center gap-3 font-bold text-slate-900"><Check className="w-4 h-4 text-slate-900" /> Reporte semanal desde adentro</li>
                  <li className="flex items-center gap-3 font-bold text-slate-900"><Check className="w-4 h-4 text-slate-900" /> Acceso a La Caja Negra (Recursos)</li>
                  <li className="flex items-center gap-3 font-bold text-slate-900"><Check className="w-4 h-4 text-slate-900" /> Tu nombre en el Muro de Fundadores</li>
                </ul>
                <p className="text-[9px] uppercase font-black tracking-widest text-slate-900/40 mt-4 italic">Cancela cuando quieras.</p>
              </div>
            </div>

            <Link href="/en-primera-fila" className="w-full py-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-center text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20 transition-all flex items-center justify-center gap-2">
              Unirse ahora <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        <div className="max-w-2xl mx-auto text-center mt-16 pt-16 border-t border-white/5">
          <h3 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-white mb-2">¿Tienes dudas?</h3>
          <p className="text-blue-100/60 text-lg mb-8">Prefiero explicártelo yo mismo.</p>
          <a
            href="https://wa.me/18295705985?text=Hola%20Michael!%20Tengo%20algunas%20dudas%20sobre%20cómo%20apoyar%20tu%20camino%20a%20Colorado."
            target="_blank"
            className="inline-flex items-center gap-4 px-10 py-5 bg-green-600 hover:bg-green-500 text-white font-black rounded-2xl shadow-2xl shadow-green-600/20 transition-all uppercase tracking-widest text-sm group"
          >
            <MessageCircle className="w-5 h-5 fill-white" />
            HABLEMOS
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default OldSupportOptions;
