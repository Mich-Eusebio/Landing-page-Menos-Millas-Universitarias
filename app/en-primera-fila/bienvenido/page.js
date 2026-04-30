"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Download, FolderLock, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function Bienvenido() {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 font-sans selection:bg-blue-500 selection:text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Glow Effects */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[20%] w-[50%] h-[50%] bg-blue-600/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[10%] w-[40%] h-[40%] bg-purple-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-2xl w-full relative z-10 space-y-16">
        
        {/* Header Success */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-6"
        >
          <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20 shadow-[0_0_50px_rgba(34,197,94,0.1)]">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-tight text-balance">
              Bienvenido a la Primera Fila. <br/>
              <span className="text-blue-500">Asiento Reservado.</span>
            </h1>
          </div>
        </motion.div>

        {/* Copy Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 space-y-8 backdrop-blur-xl"
        >
          <div className="space-y-6 text-lg text-white/70 font-medium leading-relaxed">
            <p className="text-2xl text-white font-black italic uppercase tracking-tighter">
              Ya estás adentro.
            </p>
            <p>
              Lo que acabas de hacer es algo que solo 100 personas van a poder hacer este año.
            </p>
            <p>
              Tu primera edición ya está lista. Descárgala abajo.
              <br/>
              El próximo domingo, la Semana 2 llega automático a tu email.
            </p>
            <p className="text-white/40 italic">
              Mientras tanto, aquí están todos los recursos:
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <Link 
              href="https://drive.google.com/drive/folders/1LlBJBz-hoaYfRFfN6Ra9bw6deg4BGdeK" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-6 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 hover:border-blue-500/40 rounded-2xl transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <FolderLock className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-black text-white uppercase tracking-widest">La Caja Negra</p>
                  <p className="text-[10px] text-blue-400/70 font-bold uppercase tracking-widest mt-0.5">Recursos y Plantillas</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-blue-400 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link 
              href="https://drive.google.com/drive/folders/1JxN90p9UR_0EkZw3v9kkOXAU" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Download className="w-5 h-5 text-white/60" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-black text-white uppercase tracking-widest">Todas las Ediciones</p>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5">Reportes Semanales</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-white/40 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="text-center space-y-6 pt-8"
        >
          <p className="text-sm text-white/40 font-medium max-w-sm mx-auto leading-relaxed">
            Si una edición te golpea, responde y cuéntame. Leo cada mensaje.
          </p>
          <div className="space-y-1">
            <p className="text-xs text-white/30 uppercase tracking-[0.3em] font-black">Vuela alto,</p>
            <p className="text-xl text-white italic font-black">Michael</p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
