"use client";
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Download, 
  ArrowRight, 
  ExternalLink, 
  MessageCircle, 
  Instagram, 
  Award,
  DollarSign,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { downloadResilienceGuide } from '../../lib/apis/leadmagnets';

export default function LinktreePage() {
  // Page states: 'video', 'download', or 'links'
  const [pageState, setPageState] = useState('video');
  
  // Video state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef(null);

  // Bank selection states
  const [selectedBank, setSelectedBank] = useState('');
  const [showBankSelect, setShowBankSelect] = useState(false);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    // Transition to download page automatically when video ends
    setPageState('download');
  };

  const handleDownload = () => {
    // Download the PDF
    downloadResilienceGuide();
    
    // Immediately transition to the Linktree links page
    setPageState('links');
  };

  const handleBankRedirect = (e) => {
    e.preventDefault();
    if (selectedBank === 'Popular') {
      window.location.href = '/banco-popular';
    } else if (selectedBank === 'Banreservas') {
      window.location.href = '/banreservas';
    }
  };

  const remainingTime = Math.max(0, Math.ceil(duration - currentTime));

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

        <AnimatePresence mode="wait">
          {pageState === 'video' && (
            <motion.div 
              key="video-state"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5 }}
              className="w-full flex flex-col items-center"
            >
              {/* Header */}
              <div className="text-center mb-6">
                <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 mb-2 inline-block">
                  Presentación
                </span>
                <h1 className="text-xl md:text-2xl font-black italic uppercase tracking-tight text-white leading-tight">
                  El primer ciego dominicano que hace software
                </h1>
                <p className="text-sm font-medium text-slate-400 mt-2">
                  ¿Cómo lo hace?
                </p>
              </div>

              {/* Video Player */}
              <div className="w-full aspect-[9/16] max-h-[480px] bg-black/40 border border-white/15 rounded-3xl overflow-hidden shadow-2xl relative group mb-4">
                <video
                  ref={videoRef}
                  src="/blind_coder_viral.mp4"
                  className="w-full h-full object-cover"
                  playsInline
                  onClick={handlePlayPause}
                  onEnded={handleVideoEnded}
                  onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
                  onLoadedMetadata={(e) => setDuration(e.target.duration)}
                />
                
                {/* Custom Overlay Controls */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 pointer-events-none">
                  {!isPlaying && (
                    <button 
                      onClick={handlePlayPause}
                      className="absolute inset-0 m-auto w-16 h-16 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center shadow-xl shadow-blue-600/40 pointer-events-auto transition-transform active:scale-95 animate-pulse"
                    >
                      <Play className="w-6 h-6 fill-current ml-1" />
                    </button>
                  )}
                  
                  {isPlaying && (
                    <button 
                      onClick={handlePlayPause}
                      className="absolute top-4 right-4 p-3 bg-black/40 hover:bg-black/60 text-white rounded-full pointer-events-auto transition-opacity opacity-0 group-hover:opacity-100"
                    >
                      <Pause className="w-4 h-4" />
                    </button>
                  )}
                  
                  {/* Copy Text Overlay */}
                  <div className="text-center bg-black/40 backdrop-blur-md border border-white/5 py-2 px-4 rounded-xl mx-auto max-w-[90%]">
                    <p className="text-xs font-semibold text-slate-300">
                      {isPlaying && remainingTime > 0 ? (
                        <span>Al final tengo algo para ti (<strong className="text-blue-400 font-extrabold">{remainingTime}s</strong>)</span>
                      ) : (
                        <span>Al final tengo algo para ti</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Direct Skip button for those who already watched */}
              <button 
                onClick={() => setPageState('download')}
                className="mt-6 text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors uppercase tracking-wider font-semibold"
              >
                Saltar video <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}

          {pageState === 'download' && (
            <motion.div 
              key="download-state"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5 }}
              className="w-full flex flex-col items-center"
            >
              {/* Header */}
              <div className="text-center mb-8">
                <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 mb-2 inline-block">
                  Regalo Especial
                </span>
                <h1 className="text-xl md:text-2xl font-black italic uppercase tracking-tight text-white leading-tight">
                  Descarga mi guía de resiliencia que me llevó al top mundial de las universidades del mundo
                </h1>
              </div>

              {/* PDF Download Call to Action Card */}
              <div className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400 mb-6 mx-auto">
                  <Download className="w-8 h-8" />
                </div>
                
                <h3 className="text-base font-black uppercase tracking-wider text-amber-400 mb-2">Guía de Resiliencia</h3>
                <p className="text-xs text-slate-300 mb-6 leading-relaxed">
                  Descubre los 7 consejos que utilicé para superar las barreras de accesibilidad y ser admitido en la Universidad de Colorado Boulder.
                </p>
                
                <button
                  onClick={handleDownload}
                  className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase text-xs tracking-widest rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4 text-slate-950" />
                  Descargar Guía (PDF)
                </button>
              </div>
            </motion.div>
          )}

          {pageState === 'links' && (
            <motion.div 
              key="links-state"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5 }}
              className="w-full flex flex-col items-center"
            >
              {/* Header */}
              <div className="text-center mb-8">
                <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 mb-2 inline-block">
                  Apoya mi camino
                </span>
                <h1 className="text-xl md:text-2xl font-black italic uppercase tracking-tight text-white leading-tight">
                  Ayúdame a llegar a una de las mejores universidades del mundo
                </h1>
              </div>

              {/* Links list */}
              <div className="w-full space-y-4">
                {/* 1. Rifa Tech Premium */}
                <Link 
                  href="/rifa"
                  className="block w-full p-5 bg-gradient-to-r from-amber-500/10 to-yellow-500/5 hover:from-amber-500/20 hover:to-yellow-500/10 border border-amber-500/30 hover:border-amber-500/50 rounded-2xl transition-all group relative overflow-hidden shadow-lg shadow-amber-500/5"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-400">
                        <Award className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <h2 className="text-sm font-black uppercase tracking-wider text-amber-400">Rifa Tech Premium</h2>
                        <p className="text-xs text-slate-300">Participa por increíbles premios tecnológicos.</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                {/* 2. Hacer un Aporte Alternativo */}
                {!showBankSelect ? (
                  <button
                    onClick={() => setShowBankSelect(true)}
                    className="w-full p-5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl transition-all group text-left flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-sm font-black uppercase tracking-wider text-white">Aporte Independiente / Alternativo</h2>
                        <p className="text-xs text-slate-400">Elige tu banco preferido para transferir.</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5"
                  >
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Elige tu Banco</h3>
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

                {/* 3. Sígueme en WhatsApp */}
                <a
                  href="https://wa.me/18295705985"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full p-5 bg-[#25d366]/10 hover:bg-[#25d366]/20 border border-[#25d366]/30 hover:border-[#25d366]/50 rounded-2xl transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#25d366]/20 rounded-xl flex items-center justify-center text-[#25d366]">
                        <MessageCircle className="w-5 h-5 fill-current" />
                      </div>
                      <div className="text-left">
                        <h2 className="text-sm font-black uppercase tracking-wider text-[#25d366]">Sígueme en WhatsApp</h2>
                        <p className="text-xs text-slate-300">Escríbeme de manera directa.</p>
                      </div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-[#25d366]" />
                  </div>
                </a>

                {/* 4. Sígueme en Instagram */}
                <a
                  href="https://instagram.com/mich_eusebio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full p-5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-pink-500/10 border border-pink-500/20 rounded-xl flex items-center justify-center text-pink-400">
                        <Instagram className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <h2 className="text-sm font-black uppercase tracking-wider text-pink-400">Sígueme en Instagram</h2>
                        <p className="text-xs text-slate-400">Sigue mi día a día y mis proyectos.</p>
                      </div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-slate-400" />
                  </div>
                </a>
              </div>

              {/* Volver a la presentación */}
              <button 
                onClick={() => setPageState('video')}
                className="mt-8 text-xs text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-wider font-semibold"
              >
                Volver a la presentación
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="mt-auto pt-8 text-center text-[10px] uppercase tracking-widest text-slate-500 font-bold">
          © {new Date().getFullYear()} Michael Eusebio • Menos Millas Universitarias
        </footer>
      </div>
    </main>
  );
}
