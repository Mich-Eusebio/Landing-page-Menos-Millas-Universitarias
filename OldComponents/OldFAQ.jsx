"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const OldFAQ = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: "¿A qué universidad vas?",
      a: "He sido admitido en la Universidad de Colorado Boulder, una institución de primer nivel en investigación y tecnología en los Estados Unidos. Mi objetivo es formarme como Ingeniero en Inteligencia Artificial."
    },
    {
      q: "¿Qué es 'Cómprame un día'?",
      a: "Es una forma directa de cubrir los costos operativos y de matrícula de mi carrera. Cada día de estudio tiene un costo calculado de RD$3,100. Al comprar un día, no solo donas, sino que te conviertes en el patrocinador oficial de esa fecha en mi calendario académico, y recibirás una actualización personalizada desde el campus ese día."
    },
    {
      q: "¿Cómo funciona el Newsletter 'En Primera Fila'?",
      a: "Es una suscripción mensual de RD$2,000 que te da acceso exclusivo a mi proceso de aprendizaje, los desafíos de vivir en NYC como estudiante ciego, y las herramientas tecnológicas que utilizo. Es un pase VIP al detrás de escena de este proyecto."
    },
    {
      q: "¿Es seguro mi pago?",
      a: "Utilizamos plataformas de pago seguras y reconocidas internacionalmente. Cada transacción está cifrada y protegida. También aceptamos transferencias directas si te sientes más cómodo."
    }
  ];

  return (
    <section className="py-32 px-6">
      <div className="max-w-3xl mx-auto text-left relative z-20">
        <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-10 text-center text-blue-400 underline decoration-white/20 underline-offset-8">PREGUNTAS FRECUENTES</h3>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-white/10 pb-4">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between py-4 text-left group transition-all"
              >
                <span className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors uppercase tracking-tight">{faq.q}</span>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-600/20 transition-all">
                  {openFaq === i ? <Minus className="w-4 h-4 text-blue-400" /> : <Plus className="w-4 h-4 text-white/40" />}
                </div>
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pb-4 text-blue-100/60 leading-relaxed text-sm">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OldFAQ;
