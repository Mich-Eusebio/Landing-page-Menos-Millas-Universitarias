"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, Copy, Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function BanreservasPage() {
  const [copiedField, setCopiedField] = useState(null);

  const bankDetails = {
    banco: 'Banreservas',
    cuenta: '9607058204',
    tipo: 'Ahorro',
    titular: 'Michael Eusebio',
    cedula: '402-3402480-6',
    cedulaRaw: '40234024806'
  };

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background gradients for premium feel */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[150px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Back Link */}
        <Link 
          href="/comprame-un-dia"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-6 text-xs uppercase tracking-widest font-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Calendario
        </Link>

        {/* Main Bank Card */}
        <div className="bg-[#0c0c0c] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-blue-600/10 transition-all duration-500" />
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Cuenta de Transferencia</p>
              <h1 className="text-2xl font-black italic uppercase tracking-tight text-white">{bankDetails.banco}</h1>
            </div>
          </div>

          <div className="space-y-6">
            {/* Account Number */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex justify-between items-center group/item hover:border-white/10 transition-colors">
              <div>
                <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Número de Cuenta</p>
                <p className="text-lg font-black text-white tracking-wider mt-1">{bankDetails.cuenta}</p>
              </div>
              <button
                onClick={() => copyToClipboard(bankDetails.cuenta, 'cuenta')}
                className="p-3 bg-white/5 hover:bg-blue-600/20 border border-white/5 hover:border-blue-500/30 rounded-xl text-white/40 hover:text-blue-400 transition-all active:scale-95 flex items-center justify-center min-w-[44px]"
                title="Copiar número de cuenta"
              >
                <AnimatePresence mode="wait">
                  {copiedField === 'cuenta' ? (
                    <motion.div key="check" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
                      <Check className="w-4 h-4 text-green-400" />
                    </motion.div>
                  ) : (
                    <motion.div key="copy" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
                      <Copy className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>

            {/* Titular & Tipo */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Titular</p>
                <div className="flex items-center justify-between mt-1 gap-1">
                  <p className="text-[10px] font-black text-white uppercase tracking-wider truncate">{bankDetails.titular}</p>
                  <button 
                    onClick={() => copyToClipboard(bankDetails.titular, 'titular')}
                    className="p-1 hover:text-blue-400 text-white/20 transition-colors"
                  >
                    {copiedField === 'titular' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Tipo de Cuenta</p>
                <p className="text-[10px] font-black text-white uppercase tracking-widest mt-2">{bankDetails.tipo}</p>
              </div>
            </div>

            {/* Cédula */}
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex justify-between items-center group/item hover:border-white/10 transition-colors">
              <div>
                <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Cédula de Identidad</p>
                <p className="text-sm font-black text-white tracking-wider mt-1">{bankDetails.cedula}</p>
              </div>
              <button
                onClick={() => copyToClipboard(bankDetails.cedulaRaw, 'cedula')}
                className="p-3 bg-white/5 hover:bg-blue-600/20 border border-white/5 hover:border-blue-500/30 rounded-xl text-white/40 hover:text-blue-400 transition-all active:scale-95 flex items-center justify-center min-w-[44px]"
                title="Copiar cédula"
              >
                <AnimatePresence mode="wait">
                  {copiedField === 'cedula' ? (
                    <motion.div key="check" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
                      <Check className="w-4 h-4 text-green-400" />
                    </motion.div>
                  ) : (
                    <motion.div key="copy" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
                      <Copy className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
