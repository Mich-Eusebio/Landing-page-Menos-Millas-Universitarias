import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const Hero = () => {
  return (
    <section className="pt-32 pb-16 px-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-left z-10"
        >
          <span className="text-[#E0B44C] font-bold tracking-widest uppercase text-sm border-b-2 border-[#E0B44C] pb-1">Hito Nacional 2026</span>
          <h1 className="text-5xl md:text-7xl font-black mt-8 leading-tight text-white">
            Ciego. Dominicano. Admitido en EE.UU. <span className="text-[#3A7BD5]">Tu empresa puede ser parte de esto.</span>
          </h1>
          <p className="mt-8 text-xl text-slate-400 leading-relaxed font-medium max-w-xl">
            No es filantropía. Es posicionarte antes de que todo el mundo quiera estarlo.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row gap-6 items-start">
            <a 
              href="#agenda" 
              className="bg-[#4ADE80] text-[#06200f] font-extrabold uppercase py-5 px-10 rounded-2xl transition-all hover:scale-105 shadow-[0_10px_20px_rgba(74,222,128,0.2)]"
            >
              Agendar una llamada
            </a>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative hidden md:block"
        >
          <div className="rounded-[3rem] overflow-hidden border-8 border-white/5 shadow-2xl bg-slate-800 aspect-[4/5] relative">
            <Image 
              src="/EXCELENTE FOTO MÍA.png" 
              alt="Michael Eusebio" 
              fill
              className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition duration-700"
            />
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true }}
            className="absolute -bottom-8 -right-8 bg-[#E0B44C] p-8 rounded-[2rem] text-[#05162e] shadow-2xl border-4 border-[#05162e]"
          >
            <p className="font-black text-5xl">CU</p>
            <p className="text-xs font-bold uppercase tracking-widest">Boulder Admit</p>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#3A7BD5]/10 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none"></div>
    </section>
  );
};

export default Hero;
