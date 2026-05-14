import React from 'react';
import { motion } from 'framer-motion';

const CalendlyCTA = () => {
  return (
    <section id="agenda" className="py-32 text-center relative overflow-hidden bg-[#05162e]">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.h2 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-black text-white mb-12 leading-tight"
        >
          ¿Listo para ser parte <br/> de este hito?
        </motion.h2>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          viewport={{ once: true }}
        >
          <a 
            href="https://calendly.com/michaeleusebiodelorbe/30min" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block bg-[#E0B44C] text-[#05162e] font-black py-6 px-12 rounded-full transition-all transform hover:scale-105 hover:shadow-[0_0_50px_rgba(224,180,76,0.5)] shadow-[0_0_50px_rgba(224,180,76,0.3)] text-xl uppercase tracking-widest"
          >
            AGENDAR UNA LLAMADA
          </a>
        </motion.div>
      </div>

      {/* Decorative Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E0B44C]/5 blur-[120px] rounded-full pointer-events-none"></div>
    </section>
  );
};

export default CalendlyCTA;
