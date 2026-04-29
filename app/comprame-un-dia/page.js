"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Trophy } from 'lucide-react';
import CalendarHeader from '@/components/calendar/CalendarHeader';
import CalendarLegend from '@/components/calendar/CalendarLegend';
import MonthGrid from '@/components/calendar/MonthGrid';
import CheckoutModal from '@/components/calendar/CheckoutModal';
import { saveComprameUnDia, uploadFile, getSoldDays, saveSoldDays } from '@/lib/apis/SorteoActions';

const ComprameUnDia = () => {
  const [selectedTier, setSelectedTier] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('tiers'); // 'tiers' or 'calendar'

  // HU1: load sold days from Firestore
  const [soldDaysData, setSoldDaysData] = useState([]); // [{ dateStr, nombre, foto_url, plan_seleccionado }]

  useEffect(() => {
    getSoldDays().then(data => setSoldDaysData(data));
  }, []);

  // Cambio 1: auto-abrir el modal cuando el usuario termina de seleccionar todos sus días
  useEffect(() => {
    if (
      selectedTier &&
      selectedDates.length === selectedTier.days &&
      !isModalOpen
    ) {
      // Pequeño delay para que el usuario vea el último día seleccionado antes del modal
      const timer = setTimeout(() => {
        setIsModalOpen(true);
        setStep(1);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [selectedDates, selectedTier, isModalOpen]);

  const presencias = [
    { 
      id: 7, 
      days: 5, 
      price: 15000, 
      title: "Semana de Ingeniería", 
      subtitle: "Impacto total. Tu marca o nombre será el protagonista absoluto durante 5 días.", 
      color: "#FF6B00", // Vivid Safety Orange
      badge: "MÁXIMO IMPACTO",
      height: "min-h-[600px]",
      tier: 'premium',
      offerText: "Antes 7 días"
    },
    { 
      id: 3, 
      days: 2, 
      price: 6000, 
      title: "Sprint de Carrera", 
      subtitle: "Dos días de alta visibilidad en momentos clave del semestre.", 
      color: "#BF00FF", // Electric Purple
      badge: "OFERTA ESPECIAL",
      height: "min-h-[520px]",
      tier: 'pro',
      offerText: "Precio Promocional",
      saving: "Ahorra RD$1,000" // Assuming the previous 2-day value would be higher or highlighting the deal
    },
    { 
      id: 1, 
      days: 1, 
      price: 3000, 
      title: "Día Universitario", 
      subtitle: "Presencia directa en un día específico de mi viaje académico.", 
      color: "#00FFFF", // Neon Aqua
      badge: "APOYO DIRECTO",
      height: "min-h-[440px]",
      tier: 'basic'
    }
  ];


  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    instagram: '',
    paymentMethod: 'transfer', // only transfer available
    bankSelection: 'popular',
    proof: null,
    sponsorPhoto: null,  // HU2: optional sponsor photo
    terms: false
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, proof: e.target.files[0] }));
    }
  };

  // HU2: handler for optional sponsor photo
  const handleSponsorPhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, sponsorPhoto: e.target.files[0] }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.fullName.trim() || formData.fullName.split(' ').length < 2) {
      newErrors.fullName = 'Por favor, ingresa nombre y apellido completo.';
    }
    if (!formData.instagram.trim()) {
      newErrors.instagram = 'El usuario de Instagram es obligatorio.';
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      newErrors.email = 'Por favor, ingresa un correo electrónico válido.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (step === 1 && !validateStep1()) return;
    setStep(prev => prev + 1);
  };

  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.terms) return;
    
    setLoading(true);
    try {
      // Cambio 2: validación de concurrencia — re-fetch sold-days justo antes de guardar
      const latestSoldDays = await getSoldDays();
      const latestSoldDates = latestSoldDays.map(d => d.dateStr);
      const conflictedDates = selectedDates.filter(d => latestSoldDates.includes(d));

      if (conflictedDates.length > 0) {
        // Actualizar el calendario con los datos frescos para mostrar los días dorados
        setSoldDaysData(latestSoldDays);
        // Deseleccionar los días en conflicto
        setSelectedDates(prev => prev.filter(d => !conflictedDates.includes(d)));
        setIsModalOpen(false);
        setLoading(false);
        alert(`⚠️ ¡Lo sentimos! ${conflictedDates.length > 1 ? 'Los días' : 'El día'} ${conflictedDates.join(', ')} ${conflictedDates.length > 1 ? 'acaban de ser comprados' : 'acaba de ser comprado'} por otra persona. Por favor elige otro día.`);
        return;
      }

      // Upload proof of payment
      let comprobante_url = null;
      if (formData.proof) {
        const timestamp = Date.now();
        const safeName = formData.proof.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const path = `comprame-un-dia-comprobantes/proofs/${timestamp}_${safeName}`;
        
        const uploadData = new FormData();
        uploadData.append('file', formData.proof);
        uploadData.append('path', path);
        
        comprobante_url = await uploadFile(uploadData);
      }

      // HU2: Upload optional sponsor photo
      let sponsor_foto_url = null;
      if (formData.sponsorPhoto) {
        const timestamp = Date.now();
        const safeName = formData.sponsorPhoto.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const path = `comprame-un-dia-sponsors/${timestamp}_${safeName}`;
        
        const uploadData = new FormData();
        uploadData.append('file', formData.sponsorPhoto);
        uploadData.append('path', path);
        
        sponsor_foto_url = await uploadFile(uploadData);
      }

      const payload = {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        instagram: formData.instagram,
        paymentMethod: 'transfer',
        bankSelection: formData.bankSelection,
        hasProof: !!formData.proof,
        proofName: formData.proof ? formData.proof.name : null,
        comprobante_url: comprobante_url,
        sponsor_foto_url: sponsor_foto_url,
        selectedDates: selectedDates,
        tier: selectedTier ? selectedTier.id : null,
        totalPrice: selectedTier ? selectedTier.price : 0,
        termsAccepted: formData.terms
      };
      
      await saveComprameUnDia(payload);

      // Opción A: marcar los días como vendidos inmediatamente al submit
      await saveSoldDays({
        dates: selectedDates,
        nombre: formData.fullName,
        foto_url: sponsor_foto_url,
        plan: selectedTier ? selectedTier.title : 'dia seleccionado'
      });

      window.location.href = '/gracias';
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Hubo un error al procesar tu solicitud. Por favor intenta de nuevo.");
      setLoading(false);
    }
  };

  const months = [
    { name: 'Enero 2027', year: 2027, month: 0 },
    { name: 'Febrero 2027', year: 2027, month: 1 },
    { name: 'Marzo 2027', year: 2027, month: 2 },
    { name: 'Abril 2027', year: 2027, month: 3 },
    { name: 'Mayo 2027', year: 2027, month: 4 },
    { name: 'Junio 2027', year: 2027, month: 5 },
    { name: 'Julio 2027', year: 2027, month: 6 },
    { name: 'Agosto 2027', year: 2027, month: 7 },
    { name: 'Septiembre 2027', year: 2027, month: 8 },
    { name: 'Octubre 2027', year: 2027, month: 9 },
    { name: 'Noviembre 2027', year: 2027, month: 10 },
    { name: 'Diciembre 2027', year: 2027, month: 11 },
  ];

  const handleDateClick = (dateStr, isSold) => {
    if (isSold || !selectedTier) return;
    
    setSelectedDates(prev => {
      if (prev.includes(dateStr)) {
        return prev.filter(d => d !== dateStr);
      } else {
        if (prev.length >= selectedTier.days) return prev;
        return [...prev, dateStr];
      }
    });
  };

  const handleContinue = () => {
    setIsModalOpen(true);
    setStep(1);
  };

  const handleTierSelect = (tier) => {
    setSelectedTier(tier);
    setView('calendar');
    setSelectedDates([]); // Reset selection when changing tiers
  };

  const handleBackToTiers = () => {
    setView('tiers');
    setSelectedTier(null);
    setSelectedDates([]);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-slate-100 font-sans selection:bg-blue-500 selection:text-white relative overflow-x-hidden">
      <CalendarHeader />

      <main className="pt-32 pb-48 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {view === 'tiers' ? (
              <motion.div
                key="tiers-view"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="space-y-16"
              >
                <div className="text-center space-y-4">
                  <h2 className="text-5xl md:text-8xl font-black text-white italic tracking-tighter uppercase leading-[0.8]">
                    Elige tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Presencia</span>
                  </h2>
                  <p className="text-white/40 font-bold uppercase tracking-[0.5em] text-xs">
                    Impacto directo en mi carrera profesional
                  </p>
                </div>

                <div className="flex flex-col md:flex-row items-end justify-center gap-8 md:gap-12 px-4">
                  {presencias.map((presencia) => (
                    <motion.button
                      key={presencia.id}
                      whileHover={{ 
                        y: -25, 
                        scale: 1.05,
                        boxShadow: `0 0 50px ${presencia.color}60`,
                        borderColor: presencia.color
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleTierSelect(presencia)}
                      className={`
                        relative group flex flex-col p-8 md:p-12 rounded-[3rem] border-2 transition-all duration-700 text-left w-full md:max-w-[380px]
                        bg-[#050505]
                        ${presencia.height}
                      `}
                      style={{ 
                        boxShadow: `0 0 30px ${presencia.color}30`,
                        borderColor: `${presencia.color}20`
                      }}
                    >
                      {/* Internal glow effect */}
                      <div 
                        className="absolute inset-0 opacity-30 pointer-events-none group-hover:opacity-60 transition-opacity duration-1000 rounded-[3rem] overflow-hidden"
                        style={{ background: `radial-gradient(circle at 50% 0%, ${presencia.color}40, transparent 80%)` }}
                      />

                      <div className="flex flex-col h-full relative z-10 w-full">
                        {/* High Saturated Badge */}
                        <div 
                          className="self-start px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] mb-12 shadow-2xl"
                          style={{ 
                            backgroundColor: presencia.color, 
                            color: '#000',
                            boxShadow: `0 0 30px ${presencia.color}60`
                          }}
                        >
                          {presencia.badge}
                        </div>

                        {/* Bold Typography - Fixed Wrapping */}
                        <div className="flex-1 space-y-8">
                          <h3 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-[0.9] break-normal">
                            {presencia.title}
                          </h3>
                          <p className="text-white/60 font-black leading-relaxed text-sm md:text-base uppercase tracking-[0.1em]">
                            {presencia.subtitle}
                          </p>
                          {presencia.offerText && (
                            <div className="inline-block px-3 py-1 bg-white/10 rounded-lg border border-white/20">
                              <p className="text-[9px] font-black text-white/80 uppercase tracking-widest">
                                ✨ {presencia.offerText}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Price and Electric Button */}
                        <div className="mt-auto pt-10 border-t border-white/10 space-y-10">
                          <div className="flex flex-col">
                            <span className="text-[12px] font-black text-white/30 uppercase tracking-[0.5em] mb-3">Inversión Total</span>
                            <span className="text-5xl md:text-6xl font-black text-white tracking-tighter italic drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                              RD${presencia.price.toLocaleString()}
                            </span>
                          </div>

                          <div 
                            className={`
                              w-full py-6 rounded-3xl flex items-center justify-center gap-4 font-black uppercase tracking-[0.3em] text-[12px] transition-all duration-700
                              ${presencia.tier === 'premium' 
                                ? `bg-[#FF6B00] text-black shadow-[0_0_40px_rgba(255,107,0,0.5)] hover:shadow-[0_0_60px_rgba(255,107,0,0.7)]` 
                                : 'bg-transparent border-2 text-white'}
                            `}
                            style={{ 
                              borderColor: presencia.tier !== 'premium' ? `${presencia.color}80` : 'transparent',
                              color: presencia.tier !== 'premium' ? presencia.color : '#000',
                              boxShadow: presencia.tier !== 'premium' ? `inset 0 0 15px ${presencia.color}30` : `0 0 40px ${presencia.color}50`
                            }}
                          >
                            Seleccionar <ArrowRight className={`w-5 h-5 ${presencia.tier === 'premium' ? 'text-black' : 'text-current'} group-hover:translate-x-3 transition-transform duration-500`} />
                          </div>
                        </div>
                      </div>

                      {/* External Border Glow (Light Source Effect) */}
                      <div 
                        className="absolute inset-0 rounded-[3rem] pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-700 border-[3px]"
                        style={{ borderColor: presencia.color, boxShadow: `0 0 30px ${presencia.color}80, inset 0 0 20px ${presencia.color}40` }}
                      />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="calendar-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-16"
              >
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div className="space-y-2">
                    <button 
                      onClick={handleBackToTiers}
                      className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all"
                    >
                      ← Volver a Presencia
                    </button>
                    <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase">
                      Selecciona tus <span className="text-blue-500">Días</span>
                    </h2>
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-6">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Paquete</p>
                      <p className="text-lg font-black text-white italic">{selectedTier.title}</p>
                    </div>
                    <div className="w-px h-8 bg-white/10"></div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Progreso</p>
                      <p className="text-lg font-black text-white italic">
                        {selectedDates.length} / {selectedTier.days}
                      </p>
                    </div>
                  </div>
                </div>

                <CalendarLegend />

                <div className="space-y-32">
                  {months.map((m, idx) => (
                    <MonthGrid
                      key={idx}
                      monthData={m}
                      selectedDates={selectedDates}
                      soldDaysData={soldDaysData}
                      onDateClick={handleDateClick}
                      limitReached={selectedDates.length >= (selectedTier?.days || 0)}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* STICKY FOOTER FOR BATCH SELECTION (AC 5) */}
      <AnimatePresence>
        {selectedTier && !isModalOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 w-full z-40 p-4 md:p-8 pointer-events-none flex justify-center"
          >
            <div className="bg-[#0d1b3e] border border-blue-500/30 rounded-3xl shadow-[0_-10px_40px_rgba(37,99,235,0.2)] p-4 md:px-8 md:py-6 w-full max-w-4xl pointer-events-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="flex items-center gap-6 relative z-10 w-full md:w-auto justify-between md:justify-start">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Días seleccionados</p>
                  <div className="flex items-end gap-2 mt-1">
                    <p className="text-3xl md:text-4xl font-black text-white leading-none">{selectedDates.length}</p>
                    <p className="text-xs text-white/50 font-bold mb-1 uppercase">/ {selectedTier.days}</p>
                  </div>
                </div>

                <div className="h-10 w-px bg-white/10 hidden md:block"></div>

                <div className="text-right md:text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Inversión Total</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xl md:text-2xl font-black text-white italic tracking-tighter">
                      RD${selectedTier.price.toLocaleString()}
                    </p>
                    {selectedTier.saving && (
                      <span className="text-[8px] font-black text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-md uppercase">
                        {selectedTier.saving}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {selectedDates.length === selectedTier.days && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="hidden xl:flex items-center gap-2 bg-gradient-to-r from-amber-400/20 to-amber-600/20 border border-amber-500/30 px-4 py-2 rounded-xl text-amber-400 relative z-10"
                >
                  <Trophy className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">¡Selección Lista!</span>
                </motion.div>
              )}

              <button
                onClick={handleContinue}
                disabled={selectedDates.length !== selectedTier.days}
                className={`
                  w-full md:w-auto font-black uppercase tracking-widest text-xs px-8 py-4 md:py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 relative z-10
                  ${selectedDates.length === selectedTier.days 
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20' 
                    : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'}
                `}
              >
                Continuar <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        step={step}
        setStep={setStep}
        formData={formData}
        handleInputChange={handleInputChange}
        handleFileChange={handleFileChange}
        handleSponsorPhotoChange={handleSponsorPhotoChange}
        errors={errors}
        loading={loading}
        onSubmit={handleSubmit}
        nextStep={nextStep}
        prevStep={prevStep}
        selectedDates={selectedDates}
      />

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default ComprameUnDia;
