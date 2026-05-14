import React from 'react';
import { motion } from 'framer-motion';

const Logros = () => {
  const achievements = [
    {
      title: "1 de 2,921",
      subtitle: "U. Colorado Boulder",
      description: "Estudiantes internacionales admitidos en una de las universidades líderes en ingeniería de EE.UU."
    },
    {
      title: "SAT Score",
      subtitle: "Hito Nacional",
      description: "Único estudiante ciego del país en rendir el SAT, sobrepasando a más de 3.9 Millones de estudiantes.",
      featured: true
    },
    {
      title: "Top 18 LATAM",
      subtitle: "Alpha Puesto de Bolsa",
      description: "Colaborador como Desarrollador de Software enfocado en soluciones de alto impacto."
    }
  ];

  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
        {achievements.map((item, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.2, duration: 0.6 }}
            viewport={{ once: true }}
            className={`bg-[#0a1f3d] rounded-[2.5rem] p-8 md:p-12 transition-all border border-white/5 flex flex-col justify-center min-h-[320px] hover:translate-y-[-5px] hover:shadow-2xl ${item.featured ? 'border-[#3A7BD5]/40' : ''}`}
          >
            <h3 className="text-5xl md:text-6xl font-black text-white mb-2 tracking-tighter">{item.title}</h3>
            <p className="text-[#3A7BD5] font-black uppercase tracking-widest mb-6 text-sm">{item.subtitle}</p>
            <p className="text-slate-400 text-lg leading-relaxed">
              {item.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Logros;
