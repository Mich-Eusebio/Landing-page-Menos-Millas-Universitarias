"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  ChevronRight,
  Landmark,
  Calendar,
  Users,
  Zap,
  Sparkles,
  Rocket
} from 'lucide-react';
import NewsletterModal from '@/components/calendar/NewsletterModal';
import { saveNewsletterSubscription, uploadFile } from '@/lib/apis/SorteoActions';

import { useRouter } from 'next/navigation';

const EnPrimeraFila = () => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    monthsSubscribed: 1,
    bankSelection: 'popular',
    proof: null,
    founderPhoto: null,
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

  const handleSponsorPhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, founderPhoto: e.target.files[0] }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.fullName.trim() || formData.fullName.split(' ').length < 2) {
      newErrors.fullName = 'Por favor, ingresa nombre y apellido completo.';
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
    if (!formData.terms || !formData.proof) return;

    setLoading(true);
    try {
      const getFormattedTimestamp = () => {
        const now = new Date();
        const pad = (num) => String(num).padStart(2, '0');
        return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
      };

      // 1. Upload founder photo (optional)
      let founder_photo_url = null;
      if (formData.founderPhoto) {
        const timestamp = getFormattedTimestamp();
        const safeName = formData.founderPhoto.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const path = `en-primera-fila/fotos/${timestamp}_${safeName}`;

        const uploadData = new FormData();
        uploadData.append('file', formData.founderPhoto);
        uploadData.append('path', path);

        founder_photo_url = await uploadFile(uploadData);
      }

      // 2. Upload proof (mandatory)
      let comprobante_url = null;
      if (formData.proof) {
        const timestamp = getFormattedTimestamp();
        const safeName = formData.proof.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const path = `en-primera-fila/pagos/${timestamp}_${safeName}`;

        const uploadData = new FormData();
        uploadData.append('file', formData.proof);
        uploadData.append('path', path);

        comprobante_url = await uploadFile(uploadData);
      }

      // 3. Save to Firestore
      const payload = {
        name: formData.fullName,
        email: formData.email,
        monthsSubscribed: formData.monthsSubscribed,
        comprobante_url: comprobante_url,
        founder_photo_url: founder_photo_url
      };

      await saveNewsletterSubscription(payload);

      // Redirect to success page
      router.push('/en-primera-fila/bienvenido');
    } catch (error) {
      console.error("Error submitting subscription:", error);
      alert("Hubo un error al procesar tu suscripción. Por favor intenta de nuevo.");
      setLoading(false);
    }
  };

  const benefits = [
    "Reporte semanal desde adentro",
    "Acceso a recursos reales",
    "Tu nombre en el Muro de Fundadores",
    "Acceso a todo el proceso",
    "Puedes cancelar cuando quieras"
  ];

  const weeklyUpdates = [
    "Qué está funcionando",
    "Qué no",
    "Qué cambia",
    "Qué se aprende realmente"
  ];

  return (
    <div className="min-h-screen bg-[#111111] text-[#D4D4D8] font-sans selection:bg-[#8B5CF6] selection:text-white relative overflow-x-hidden">
      
      {/* Aspirational Background Gradient */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle at 30% 30%, #1A1A1A 0%, #111111 40%, #0D0D0D 100%)'
        }}
      />

      {/* Subtle Energy Glow behind text */}
      <div 
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle at 20% 40%, rgba(139, 92, 246, 0.15), transparent 50%)'
        }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-center backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity">
          <div className="w-8 h-8 bg-white/10 rounded-md flex items-center justify-center text-white font-semibold text-xs">
            M
          </div>
          <span className="font-semibold tracking-tight text-sm text-white">
            Michael Eusebio
          </span>
        </div>
        <button 
          onClick={() => {
            setStep(1);
            setIsModalOpen(true);
          }}
          className="text-xs font-medium text-[#A1A1AA] hover:text-[#E5E5E5] transition-colors"
        >
          Unirse
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 pb-12 md:pt-32 md:pb-24 z-10">
        <div className="w-full max-w-7xl mx-auto px-6 flex flex-col lg:grid lg:grid-cols-12 gap-6 md:gap-20 lg:gap-12 items-center">
          
          {/* Image Container - NOW FIRST IN DOM FOR MOBILE */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="w-full lg:col-span-5 order-1 lg:order-last flex flex-col items-center lg:items-start gap-6"
          >
            <div className="relative w-full max-w-[280px] md:max-w-none aspect-square md:aspect-[3/4] rounded-2xl md:rounded-xl overflow-hidden brightness-110 contrast-100 shadow-2xl border border-white/5">
              <Image 
                src="/imagen Michael Eusebio con baston sin fondo.png" 
                alt="Michael Eusebio" 
                fill 
                className="object-cover object-top"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent opacity-60 md:opacity-80" />
            </div>

            {/* Quote - ONLY visible on PC, below photo */}
            <div className="hidden lg:block bg-[#1A1A1A] p-5 md:p-6 rounded-xl border border-white/5 shadow-2xl max-w-xs backdrop-blur-md">
               <p className="text-[#E5E5E5] font-semibold text-base md:text-lg leading-snug">
                “Si esto funciona… tú fuiste de los primeros 100.”
               </p>
            </div>
          </motion.div>

          {/* Text Container (60%) */}
          <div className="w-full lg:col-span-7 space-y-8 md:space-y-14 text-center lg:text-left order-2 lg:order-first">
            
            <div className="space-y-6 md:space-y-10">
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-xl md:text-6xl lg:text-7xl font-bold text-[#E5E5E5] leading-tight md:leading-[1.05] tracking-tight"
              >
                NO ESTÁS VIENDO UNA<br/>
                <span className="text-[#8B5CF6]">HISTORIA.</span><br/>
                ESTÁS A TIEMPO DE<br/>
                ENTRAR EN ELLA.
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-[#D4D4D8] text-sm md:text-2xl leading-relaxed max-w-xl mx-auto lg:mx-0"
              >
                IA y Negocios en EE.UU.: un camino que no existía para un ciego dominicano. Sé uno de los 100 pilares que harán esto real y accede al proceso en vivo.
              </motion.p>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col items-center lg:items-start gap-8 md:gap-10"
            >
              {/* Benefits list: order-2 on mobile (below CTA), order-1 on PC (above CTA) */}
              <div className="space-y-4 text-center lg:text-left order-2 lg:order-1">
                <p className="text-[#E5E5E5] font-semibold text-lg md:text-xl">Cada semana te muestro:</p>
                <ul className="space-y-3 text-[#D4D4D8] text-sm md:text-lg">
                  <li className="flex items-center justify-center lg:justify-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center">
                      <Users className="w-3 h-3 text-[#8B5CF6]" />
                    </div>
                    Lo que estoy aprendiendo
                  </li>
                  <li className="flex items-center justify-center lg:justify-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center">
                      <Zap className="w-3 h-3 text-[#8B5CF6]" />
                    </div>
                    Mis herramientas de IA
                  </li>
                  <li className="flex items-center justify-center lg:justify-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-[#8B5CF6]" />
                    </div>
                    El proceso sin filtros
                  </li>
                </ul>
              </div>

              {/* CTA Block: order-1 on mobile (above benefits), order-2 on PC (below benefits) */}
              <div className="flex flex-col items-center lg:items-start gap-4 w-full md:w-auto order-1 lg:order-2">
                <button 
                  onClick={() => {
                    setStep(1);
                    setIsModalOpen(true);
                  }}
                  className="w-full md:w-auto bg-yellow-400 text-black px-10 py-5 rounded-md font-bold text-sm hover:bg-yellow-500 transition-colors shadow-lg shadow-yellow-400/20"
                >
                  UNIRME A LOS PRIMEROS 100
                </button>
                <p className="text-[#A1A1AA] text-xs md:text-sm font-medium">
                  RD$500 · Pago único
                </p>
              </div>
            </motion.div>

          </div>

        </div>
      </section>



      {/* Minimal Footer */}
      <footer className="relative py-12 px-6 z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#71717A]">
            &copy; 2026 Menos Millas Universitarias.
          </p>
          <div className="flex gap-6 text-xs text-[#71717A]">
            <span className="cursor-default">En Primera Fila — RD$500 (Pago único)</span>
          </div>
        </div>
      </footer>

      {/* Modal */}
      <NewsletterModal
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
      />
    </div>
  );
};

export default EnPrimeraFila;
