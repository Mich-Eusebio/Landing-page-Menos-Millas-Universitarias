"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const OldWhySupport = () => {
  return (
    <motion.div
      key="manifiesto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12 text-center"
    >
      <Quote className="w-20 h-20 text-blue-600 mx-auto opacity-40 mb-8" />
      <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white">
        ¿Por qué <span className="text-blue-400">esto importa?</span>
      </h2>
      <div className="max-w-3xl mx-auto space-y-8">
        <p className="text-2xl md:text-3xl font-serif italic text-blue-100/90 leading-relaxed">
          "Llegué hasta aquí por mérito propio; pero el siguiente paso requiere apoyo. No es un lujo, es el siguiente paso necesario para generar un impacto que trascienda mi historia personal."
        </p>
        <p className="text-lg text-blue-100/60 leading-relaxed">
          Mi meta es crear tecnología que rompa barreras. Al apoyarme, estás apoyando la creación de herramientas de accesibilidad, la investigación en IA y la formación de un líder dominicano en el epicentro tecnológico global.
        </p>
      </div>
    </motion.div>
  );
};

export default OldWhySupport;
