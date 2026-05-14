import React from 'react';
import { motion } from 'framer-motion';

const Planes = ({ onOpenModal }) => {
  const plans = [
    {
      key: 'fundador',
      name: 'Impacto 90 Días',
      price: 'USD$4,500',
      description: '“El legado máximo. Solo 3 empresas en la historia podrán decir que fueron el pilar fundamental de este hito.”',
      tag: 'SOLO 3 DISPONIBLES',
      className: 'bg-[#E0B44C] text-[#05162e] min-h-[520px] z-10 border-2 border-white scale-105',
      btnClassName: 'bg-[#05162e] text-white'
    },
    {
      key: 'impacto',
      name: 'Impacto 45 Días',
      price: 'USD$2,250',
      description: '“Para empresas que buscan una transformación cultural profunda y visibilidad estratégica sostenida.”',
      className: 'bg-[#1F4E79] text-white min-h-[460px] z-5 border border-white/10',
      btnClassName: 'bg-[#E0B44C] text-[#05162e]'
    },
    {
      key: 'impulso',
      name: 'Impacto 15 Días',
      price: 'USD$750',
      description: '“Un impulso táctico de alto rendimiento para equipos que creen en la excelencia y el talento local.”',
      className: 'bg-[#B8C2CC] text-[#05162e] min-h-[400px] z-1',
      btnClassName: 'bg-[#05162e] text-white'
    }
  ];

  return (
    <section id="planes" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-black text-center mb-16 text-white"
        >
          Invierta en el futuro y la <span className="text-[#E0B44C]">cultura de su empresa.</span>
        </motion.h2>
        
        <div className="grid md:grid-cols-3 gap-8 items-center mt-20">
          {plans.map((plan, idx) => (
            <motion.div 
              key={plan.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className={`rounded-[1.5rem] p-10 flex flex-col justify-between relative shadow-2xl transition-transform hover:translate-y-[-10px] ${plan.className}`}
            >
              {plan.tag && (
                <span className="absolute -top-4 right-6 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full animate-pulse">
                  {plan.tag}
                </span>
              )}
              
              <div>
                <h3 className="text-2xl md:text-3xl font-black mb-2 uppercase">{plan.name}</h3>
                <p className="text-4xl md:text-5xl font-black mb-6">{plan.price}</p>
                <p className="font-bold leading-tight italic opacity-90">{plan.description}</p>
              </div>

              <button 
                onClick={() => onOpenModal(plan.key)}
                className={`mt-12 font-extrabold uppercase tracking-widest p-5 rounded-xl text-center transition-all hover:brightness-110 active:scale-95 ${plan.btnClassName}`}
              >
                Ver Beneficios
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Planes;
