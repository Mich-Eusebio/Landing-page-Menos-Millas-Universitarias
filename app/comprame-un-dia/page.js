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
  const [selectedDates, setSelectedDates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasManuallyClosed, setHasManuallyClosed] = useState(false);

  // HU1: load sold days from Firestore
  const [soldDaysData, setSoldDaysData] = useState([]); // [{ dateStr, nombre, foto_url, plan_seleccionado }]

  useEffect(() => {
    getSoldDays().then(data => setSoldDaysData(data));
  }, []);

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
        tier: 'libre',
        totalPrice: selectedDates.length * 3000,
        termsAccepted: formData.terms
      };
      
      await saveComprameUnDia(payload);

      // Opción A: marcar los días como vendidos inmediatamente al submit
      await saveSoldDays({
        dates: selectedDates,
        nombre: formData.fullName,
        foto_url: sponsor_foto_url,
        plan: `${selectedDates.length} ${selectedDates.length === 1 ? 'día' : 'días'} (Selección Libre)`
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
    if (isSold) return;
    
    setSelectedDates(prev => {
      // Reset manual close state when selection changes
      setHasManuallyClosed(false);
      
      if (prev.includes(dateStr)) {
        return prev.filter(d => d !== dateStr);
      } else {
        return [...prev, dateStr];
      }
    });
  };

  const handleContinue = () => {
    setHasManuallyClosed(false);
    setIsModalOpen(true);
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-slate-100 font-sans selection:bg-blue-500 selection:text-white relative overflow-x-hidden">
      <CalendarHeader />

      <main className="pt-32 pb-48 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-4">
                <h2 className="text-5xl md:text-8xl font-black text-white italic tracking-tighter uppercase leading-[0.8]">
                  Cómprame un <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Día</span>
                </h2>
                <p className="text-white/40 font-bold uppercase tracking-[0.5em] text-xs">
                  elige cuántos días quieres ser parte de mi historia
                </p>
              </div>
              
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Días Seleccionados</p>
                  <p className="text-lg font-black text-white italic">{selectedDates.length}</p>
                </div>
                <div className="w-px h-8 bg-white/10"></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Inversión Total</p>
                  <p className="text-lg font-black text-white italic">
                    RD$ {(selectedDates.length * 3000).toLocaleString()}
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
                  limitReached={false}
                />
              ))}
            </div>
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
            <div className="bg-[#050505] border border-blue-500/30 rounded-3xl shadow-[0_-10px_40px_rgba(37,99,235,0.2)] p-6 md:px-8 md:py-6 w-full max-w-4xl pointer-events-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="flex items-center gap-6 relative z-10 w-full md:w-auto justify-between md:justify-start">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Días seleccionados</p>
                  <div className="flex items-end gap-2 mt-1">
                    <p className="text-3xl md:text-4xl font-black text-white leading-none">{selectedDates.length}</p>
                    <p className="text-xs text-white/50 font-bold mb-1 uppercase">{selectedDates.length === 1 ? 'Día' : 'Días'}</p>
                  </div>
                </div>

                <div className="h-10 w-px bg-white/10 hidden md:block"></div>

                <div className="text-right md:text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Inversión Total</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xl md:text-2xl font-black text-white italic tracking-tighter">
                      RD$ {(selectedDates.length * 3000).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleContinue}
                className="w-full md:w-auto font-black uppercase tracking-widest text-xs px-8 py-4 md:py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 relative z-10 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-blue-500/20"
              >
                Confirmar <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CheckoutModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setHasManuallyClosed(true);
        }}
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
