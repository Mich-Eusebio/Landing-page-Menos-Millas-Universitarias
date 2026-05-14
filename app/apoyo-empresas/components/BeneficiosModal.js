import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Linkedin, Instagram, Mail } from 'lucide-react';
import Image from 'next/image';
import modalCopy from '../modalcoppy.json';

const BeneficiosModal = ({ isOpen, onClose, planKey }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const beneficios = planKey ? modalCopy.beneficios[planKey] : [];

  useEffect(() => {
    if (isOpen) {
      setActiveTabIndex(0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  const nombresPlanes = modalCopy.nombresPlanes;

  if (!isOpen) return null;

  const currentTab = beneficios[activeTabIndex];

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000] bg-[#081F3A]/98 backdrop-blur-xl flex items-center justify-center p-4 md:p-8"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-[#0B2545] w-full max-w-6xl h-[85vh] md:h-[80vh] rounded-[2.5rem] border border-[#E0B44C]/30 flex flex-col md:flex-row overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.9)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Tab Menu */}
          <div className="w-full md:w-[320px] bg-black/20 border-b md:border-b-0 md:border-r border-white/5 p-4 md:p-8 overflow-x-auto md:overflow-y-auto flex md:flex-col gap-2">
            {beneficios.map((tab, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTabIndex(idx)}
                className={`flex-shrink-0 md:flex-shrink text-left px-6 py-4 rounded-xl transition-all flex items-center gap-4 text-sm md:text-base border-l-4 ${
                  activeTabIndex === idx 
                    ? 'bg-[#10B981]/10 border-[#10B981] text-white font-bold' 
                    : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="whitespace-nowrap">{tab.label.split(' ')[0]}</span>
                <span className="hidden md:inline">{tab.label.split(' ').slice(1).join(' ')}</span>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 p-8 md:p-16 overflow-y-auto relative">
            <div className="flex justify-between items-start mb-12">
              <div>
                <motion.h2 
                  key={`title-${activeTabIndex}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-3xl md:text-5xl font-black text-white mb-2"
                >
                  {currentTab?.title}
                </motion.h2>
                <p className="text-[#E0B44C] font-black uppercase tracking-widest text-xs md:text-sm">
                  {nombresPlanes[planKey]}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="text-white/30 hover:text-white transition-colors p-2"
              >
                <X size={32} />
              </button>
            </div>

            <motion.div 
              key={`content-${activeTabIndex}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-300 leading-relaxed space-y-8"
            >
              <p className="text-lg whitespace-pre-line">{currentTab?.content}</p>
              
              {/* Brand Logos for 'Menciones' tab */}
              {currentTab?.label === "📢 Menciones" && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col items-center gap-12 pt-12 w-full"
                >
                  <div className="flex gap-12 md:gap-20">
                    <div className="flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
                      <Linkedin size={80} className="text-[#0A66C2]" />
                      <span className="text-xs font-bold uppercase tracking-tighter">LinkedIn</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
                      <Instagram size={80} className="text-[#E4405F]" />
                      <span className="text-xs font-bold uppercase tracking-tighter">Instagram</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
                      <Mail size={80} className="text-[#8B5CF6]" />
                      <span className="text-xs font-bold uppercase tracking-tighter text-center">En Primera<br/>Fila</span>
                    </div>
                  </div>

                  <div className="text-center pt-8 border-t border-white/5 w-full max-w-md">
                    <p className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none">+800</p>
                    <p className="text-xl md:text-2xl font-black uppercase text-[#E0B44C] tracking-[0.2em] mt-2">Espectadores</p>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-[0.3em] mt-2">En plataformas digitales</p>
                  </div>
                </motion.div>
              )}

              {/* Speaker Image for 'Conferencias' tab */}
              {currentTab?.label === "🎤 Conferencias" && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="pt-4"
                >
                  <div className="relative w-full max-w-[280px] aspect-[3/4] rounded-2xl overflow-hidden border-2 border-white/10 shadow-xl">
                    <Image 
                      src="/a.jpg" 
                      alt="Michael en conferencia" 
                      fill
                      className="object-cover object-top grayscale-[30%] hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-3 italic">Michael Eusebio compartiendo su visión ante audiencias corporativas.</p>
                </motion.div>
              )}

              {/* Masterclass Image */}
              {currentTab?.label === "🎓 Masterclass" && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="pt-4"
                >
                  <div className="relative w-full max-w-md aspect-video rounded-2xl overflow-hidden border-2 border-white/10 shadow-xl">
                    <Image 
                      src="/michael_webinar_clean.png" 
                      alt="Michael en Masterclass" 
                      fill
                      className="object-cover hover:scale-105 transition-all duration-500"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-3 italic">Sesión estratégica de cultura inclusiva y liderazgo tecnológico.</p>
                </motion.div>
              )}

              {/* Newsletter Preview Image */}
              {currentTab?.label === "📧 Newsletter" && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="pt-4"
                >
                  <div className="relative w-full max-w-[280px] aspect-[3/4] rounded-2xl overflow-hidden border-2 border-white/10 shadow-xl">
                    <Image 
                      src="/newsletter_preview_clean2.png" 
                      alt="Preview de Newsletter" 
                      fill
                      className="object-cover object-top hover:scale-105 transition-all duration-500"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-3 italic">Ejemplo de contenido editorial para colaboradores.</p>
                </motion.div>
              )}

              {/* Certificate Image */}
              {currentTab?.label === "📜 Certificado" && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="pt-4"
                >
                  <div className="relative w-full max-w-[400px] aspect-[1.414/1] rounded-xl overflow-hidden border-2 border-[#E0B44C]/30 shadow-[0_0_30px_rgba(224,180,76,0.2)]">
                    <Image 
                      src="/certificado_empresa_fundadora.png" 
                      alt="Certificado Empresa Fundadora" 
                      fill
                      className="object-cover hover:scale-105 transition-all duration-500"
                    />
                  </div>
                  <p className="text-xs text-[#E0B44C] mt-3 font-bold uppercase tracking-widest">Vista previa del certificado físico exclusivo.</p>
                </motion.div>
              )}
            </motion.div>
            
            {/* Bottom Decoration */}
            <div className="absolute bottom-8 right-8 opacity-10 pointer-events-none">
              <Check size={120} className="text-[#10B981]" />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BeneficiosModal;
