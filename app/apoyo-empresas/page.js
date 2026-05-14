"use client";
import React, { useState } from 'react';
import Hero from './components/Hero';
import Logros from './components/Logros';
import Retos from './components/Retos';
import Planes from './components/Planes';
import BeneficiosModal from './components/BeneficiosModal';
import CalendlyCTA from './components/CalendlyCTA';

export default function ApoyoEmpresas() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleOpenModal = (planKey) => {
    setSelectedPlan(planKey);
    setModalOpen(true);
  };

  return (
    <main className="min-h-screen bg-[#05162e] text-[#F5F7FA] font-sans selection:bg-[#3A7BD5] selection:text-white">
      {/* Background patterns could go here */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      </div>

      <Hero />
      <Logros />
      <Retos />
      <Planes onOpenModal={handleOpenModal} />
      <CalendlyCTA />

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center text-slate-500 text-sm">
        <div className="max-w-6xl mx-auto px-6">
          <p>© 2026 MillasMichael | Programa de Impacto Empresarial</p>
          <p className="mt-2 tracking-widest uppercase text-[10px]">Santo Domingo, República Dominicana</p>
        </div>
      </footer>

      <BeneficiosModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        planKey={selectedPlan} 
      />
    </main>
  );
}
