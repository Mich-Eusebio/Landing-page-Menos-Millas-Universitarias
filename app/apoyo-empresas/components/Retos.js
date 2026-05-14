import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const Retos = () => {
  return (
    <section className="py-32 px-6 bg-slate-900/40 relative overflow-hidden">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <span className="text-[#E0B44C] font-black uppercase tracking-[0.3em] text-xs">Diagnóstico de Mercado</span>
          <h2 className="text-5xl md:text-7xl font-black text-slate-200 leading-[1.15]">
            Los Retos Empresariales <br/><span className="text-[#E0B44C]">Actuales</span>
          </h2>
        </motion.div>
        
        <div className="space-y-16">
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
            className="flex gap-6 group"
          >
            <div className="mt-2 text-amber-500 text-2xl">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-7xl font-black text-white tracking-tighter">62%</span>
                <span className="text-amber-500 font-black uppercase tracking-widest text-[10px] bg-amber-500/10 px-2 py-1 rounded">Mckinsey</span>
              </div>
              <h4 className="text-white font-black text-lg uppercase tracking-tight mb-2">Crisis de Propósito</h4>
              <p className="text-slate-400 text-base leading-relaxed max-w-sm">Colaboradores desean que su trabajo tenga un impacto más profundo.</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true }}
            className="flex gap-6 group"
          >
            <div className="mt-2 text-amber-500 text-2xl">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-7xl font-black text-white tracking-tighter">43%</span>
                <span className="text-amber-500 font-black uppercase tracking-widest text-[10px] bg-amber-500/10 px-2 py-1 rounded">Deloitte</span>
              </div>
              <h4 className="text-white font-black text-lg uppercase tracking-tight mb-2">Guerra por el Talento</h4>
              <p className="text-slate-400 text-base leading-relaxed max-w-sm">Jóvenes talentos rechazan empleadores por falta de valores sociales claros.</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative Blur */}
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#E0B44C]/5 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none"></div>
    </section>
  );
};

export default Retos;
