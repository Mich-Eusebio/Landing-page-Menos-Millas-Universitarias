"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award,
  DollarSign,
  Instagram,
  MessageCircle,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default function DirectLinktreePage() {
  // Bank selection states
  const [selectedBank, setSelectedBank] = useState('');
  const [showBankSelect, setShowBankSelect] = useState(false);

  const handleBankRedirect = (e) => {
    e.preventDefault();
    if (selectedBank === 'Popular') {
      window.location.href = '/banco-popular';
    } else if (selectedBank === 'Banreservas') {
      window.location.href = '/banreservas';
    }
  };

  return (
    <main className="min-h-screen bg-[#050c18] text-slate-100 flex flex-col items-center justify-start p-4 md:p-6 relative overflow-hidden select-none">
      {/* Background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md mx-auto relative z-10 py-8 flex flex-col items-center min-h-[90vh]">
        {/* Navigation Logo / Back */}
        <Link 
          href="/" 
          className="flex items-center gap-2 mb-8 group hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-base shadow-lg shadow-blue-600/20 text-white">M</div>
          <span className="font-bold tracking-tight text-sm uppercase text-white">Michael <span className="text-blue-400">Eusebio</span></span>
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full flex flex-col items-center"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 mb-2 inline-block">
              Apoya mi camino
            </span>
            <h1 className="text-xl md:text-2xl font-black italic uppercase tracking-tight text-white leading-tight">
              Construyamos una realidad que no existe!
            </h1>
          </div>

          {/* Links list */}
          <div className="w-full space-y-6">
            
            {/* 1. Rifa Tech Premium */}
            <div className="w-full p-6 bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border border-amber-500/30 rounded-3xl relative overflow-hidden shadow-lg shadow-amber-500/5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-400 shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-amber-400">PARTICIPA EN LA RIFA TECH PREMIUM</h2>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Gana increíbles premios tecnológicos mientras ayudas a financiar el próximo capítulo de este sueño.
                  </p>
                </div>
              </div>
              <Link 
                href="/rifa"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase text-xs tracking-widest rounded-xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
              >
                Participar ahora →
              </Link>
            </div>

            {/* 2. Hacer un Aporte Alternativo */}
            <div className="w-full p-6 bg-white/5 border border-white/10 rounded-3xl relative overflow-hidden shadow-lg">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 shrink-0">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-white">💙 ¿PREFIERES HACER UN APORTE DIRECTO?</h2>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Si deseas apoyar sin participar en la rifa, puedes realizar una transferencia bancaria con el monto que prefieras. Cada aporte, sin importar su tamaño, me acerca un paso más a la universidad.
                  </p>
                </div>
              </div>

              {!showBankSelect ? (
                <button
                  onClick={() => setShowBankSelect(true)}
                  className="w-full py-3 bg-white/10 hover:bg-white/15 text-white border border-white/10 hover:border-white/20 font-black uppercase text-xs tracking-widest rounded-xl transition-all active:scale-98 flex items-center justify-center gap-2"
                >
                  Ver cuentas bancarias →
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pt-4 border-t border-white/5 space-y-4"
                >
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Elige tu Banco</h3>
                  <form onSubmit={handleBankRedirect} className="space-y-4">
                    <div className="relative">
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none font-medium"
                      >
                        <option value="">Selecciona un banco...</option>
                        <option value="Popular">Banco Popular</option>
                        <option value="Banreservas">Banreservas</option>
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                        ▼
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowBankSelect(false)}
                        className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs uppercase font-black tracking-wider transition-colors"
                      >
                        Atrás
                      </button>
                      <button
                        type="submit"
                        disabled={!selectedBank}
                        className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs uppercase font-black tracking-wider transition-colors"
                      >
                        Continuar
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </div>

            {/* 3. Sígueme en Instagram */}
            <div className="w-full p-6 bg-white/5 border border-white/10 rounded-3xl relative overflow-hidden shadow-lg">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-pink-500/10 border border-pink-500/20 rounded-xl flex items-center justify-center text-pink-400 shrink-0">
                  <Instagram className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-pink-400">📱 SIGUE EL CAMINO</h2>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Acompáñame en este proceso y conoce los proyectos, aprendizajes y avances que estoy construyendo antes de comenzar esta nueva etapa.
                  </p>
                </div>
              </div>
              <a
                href="https://instagram.com/mich_eusebio"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/20 hover:border-pink-500/30 font-black uppercase text-xs tracking-widest rounded-xl transition-all active:scale-98 flex items-center justify-center gap-2"
              >
                Seguir en Instagram →
              </a>
            </div>

            {/* 4. Sígueme en WhatsApp */}
            <div className="w-full p-6 bg-[#25d366]/5 border border-[#25d366]/20 rounded-3xl relative overflow-hidden shadow-lg">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-[#25d366]/10 rounded-xl flex items-center justify-center text-[#25d366] shrink-0">
                  <MessageCircle className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-[#25d366]">💬 SÍGUEME EN WHATSAPP</h2>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Escríbeme directamente por cualquier duda, para un aporte alternativo o simplemente para conectar.
                  </p>
                </div>
              </div>
              <a
                href="https://wa.me/18295705985"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-[#25d366]/10 hover:bg-[#25d366]/20 text-[#25d366] border border-[#25d366]/20 hover:border-[#25d366]/30 font-black uppercase text-xs tracking-widest rounded-xl transition-all active:scale-98 flex items-center justify-center gap-2"
              >
                Sígueme en WhatsApp →
              </a>
            </div>

          </div>
        </motion.div>

        {/* Footer */}
        <footer className="mt-auto pt-8 text-center text-[10px] uppercase tracking-widest text-slate-500 font-bold">
          © {new Date().getFullYear()} Michael Eusebio • Menos Millas Universitarias
        </footer>
      </div>
    </main>
  );
}
