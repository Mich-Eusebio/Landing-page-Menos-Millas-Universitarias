"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Trophy } from 'lucide-react';
import CalendarHeader from '@/components/calendar/CalendarHeader';
import CalendarLegend from '@/components/calendar/CalendarLegend';
import MonthGrid from '@/components/calendar/MonthGrid';
import CheckoutModal from '@/components/calendar/CheckoutModal';
import { saveComprameUnDia, uploadFile } from '@/lib/apis/SorteoActions';

const ComprameUnDia = () => {
  const [selectedDates, setSelectedDates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [soldDates] = useState([
    '2027-02-14', '2027-02-27', '2027-03-01', '2027-03-15'
  ]);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    instagram: '',
    paymentMethod: '',
    bankSelection: 'popular',
    proof: null,
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

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.fullName.trim() || formData.fullName.split(' ').length < 2) {
      newErrors.fullName = 'Por favor, ingresa nombre y apellido completo.';
    }
    if (!formData.instagram.trim()) {
      newErrors.instagram = 'El usuario de Instagram es obligatorio.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !formData.paymentMethod) return;
    setStep(prev => prev + 1);
  };

  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.terms) return;
    
    setLoading(true);
    try {
      let comprobante_url = null;
      if (formData.proof) {
        const timestamp = Date.now();
        const safeName = formData.proof.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const path = `comprame-un-dia/proofs/${timestamp}_${safeName}`;
        
        const uploadData = new FormData();
        uploadData.append('file', formData.proof);
        uploadData.append('path', path);
        
        comprobante_url = await uploadFile(uploadData);
      }

      const payload = {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        instagram: formData.instagram,
        paymentMethod: formData.paymentMethod,
        bankSelection: formData.paymentMethod === 'transfer' ? formData.bankSelection : null,
        hasProof: !!formData.proof,
        proofName: formData.proof ? formData.proof.name : null,
        comprobante_url: comprobante_url,
        selectedDates: selectedDates,
        termsAccepted: formData.terms
      };
      
      await saveComprameUnDia(payload);
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
    if (isSold) return;
    
    setSelectedDates(prev => {
      if (prev.includes(dateStr)) {
        return prev.filter(d => d !== dateStr);
      } else {
        return [...prev, dateStr];
      }
    });
  };

  const handleContinue = () => {
    setIsModalOpen(true);
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-[#0a192f] text-slate-100 font-sans selection:bg-blue-500 selection:text-white relative overflow-x-hidden">
      <CalendarHeader />

      <main className="pt-32 pb-48 px-4 md:px-8">
        <div className="max-w-7xl mx-auto space-y-20">
          <CalendarLegend />

          <div className="space-y-32">
            {months.map((m, idx) => (
              <MonthGrid
                key={idx}
                monthData={m}
                selectedDates={selectedDates}
                soldDates={soldDates}
                onDateClick={handleDateClick}
              />
            ))}
          </div>
        </div>
      </main>

      {/* STICKY FOOTER FOR BATCH SELECTION */}
      <AnimatePresence>
        {selectedDates.length > 0 && !isModalOpen && (
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
                    <p className="text-xs text-white/50 font-bold mb-1 uppercase">/ 365</p>
                  </div>
                </div>

                <div className="h-10 w-px bg-white/10 hidden md:block"></div>

                <div className="text-right md:text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Inversión Total</p>
                  <p className="text-xl md:text-2xl font-black text-white mt-1 italic tracking-tighter">
                    RD${(selectedDates.length * 3000).toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedDates.length >= 7 && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="hidden xl:flex items-center gap-2 bg-gradient-to-r from-amber-400/20 to-amber-600/20 border border-amber-500/30 px-4 py-2 rounded-xl text-amber-400 relative z-10"
                >
                  <Trophy className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">¡Milla Semanal Completada!</span>
                </motion.div>
              )}

              <button
                onClick={handleContinue}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs px-8 py-4 md:py-5 rounded-2xl shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2 relative z-10"
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
