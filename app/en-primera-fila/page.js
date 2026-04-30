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
      // 1. Upload founder photo (optional)
      let founder_photo_url = null;
      if (formData.founderPhoto) {
        const timestamp = Date.now();
        const safeName = formData.founderPhoto.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const path = `en-primera-fila/fundadores/fotos/${timestamp}_${safeName}`;

        const uploadData = new FormData();
        uploadData.append('file', formData.founderPhoto);
        uploadData.append('path', path);

        founder_photo_url = await uploadFile(uploadData);
      }

      // 2. Upload proof (mandatory)
      let comprobante_url = null;
      if (formData.proof) {
        const timestamp = Date.now();
        const safeName = formData.proof.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const path = `en-primera-fila/fundadores/archivo/${timestamp}_${safeName}`;

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
      <section className="relative min-h-screen flex items-center pt-32 pb-24 z-10">
        <div className="w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-20 lg:gap-12 items-center">
          
          {/* Text Container (60%) */}
          <div className="col-span-1 lg:col-span-7 space-y-14 pr-0 lg:pr-12">
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-[#6B7280] font-semibold text-xs tracking-[0.2em] uppercase">
                MICHAEL EUSEBIO
              </span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold text-[#E5E5E5] leading-[1.05] tracking-tight"
            >
              NO ESTÁS VIENDO UNA<br/>
              <span className="text-[#8B5CF6]">HISTORIA.</span><br/>
              ESTÁS A TIEMPO DE<br/>
              ENTRAR EN ELLA.
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8 max-w-lg"
            >
              <p className="text-[#A1A1AA] text-lg leading-relaxed">
                Soy Michael Eusebio y voy a convertirme en el primer ciego dominicano en estudiar ingeniería en IA en EE.UU. No es una idea, es el proceso en vivo.
              </p>
              
              <div className="space-y-4 pt-4">
                <p className="text-[#D4D4D8] font-semibold">Cada semana te muestro:</p>
                <ul className="space-y-3 text-[#A1A1AA]">
                  <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-[#8B5CF6] rounded-full"></span> Qué está funcionando</li>
                  <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-[#8B5CF6] rounded-full"></span> Qué no</li>
                  <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-[#8B5CF6] rounded-full"></span> Qué cambia</li>
                  <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 bg-[#8B5CF6] rounded-full"></span> Qué se aprende realmente</li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="pt-12"
            >
              <div className="flex flex-col items-start gap-5">
                <button 
                  onClick={() => {
                    setStep(1);
                    setIsModalOpen(true);
                  }}
                  className="bg-[#FFFFFF] text-[#111111] px-12 py-5 rounded-md font-bold text-sm hover:bg-[#E4E4E7] transition-colors shadow-lg shadow-black/5"
                >
                  UNIRME A LOS PRIMEROS 100
                </button>
                <p className="text-[#71717A] text-sm font-medium pl-1">
                  Acceso inmediato · Cancela cuando quieras
                </p>
              </div>
            </motion.div>

          </div>

          {/* Image Container (40%) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="col-span-1 lg:col-span-5 relative order-first lg:order-last mb-10 lg:mb-0"
          >
            <div className="aspect-[3/4] relative rounded-xl overflow-hidden brightness-110 contrast-100">
              <Image 
                src="/Michael_Eusebio.png" 
                alt="Michael Eusebio" 
                fill 
                className="object-cover"
                priority
              />
              {/* Light overlay as requested */}
              <div className="absolute inset-0 bg-white/5" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent opacity-80" />
            </div>
            
            <div className="absolute -bottom-6 -left-6 bg-[#1A1A1A] p-6 rounded-xl border border-white/5 shadow-2xl max-w-xs hidden md:block backdrop-blur-md">
               <p className="text-[#E5E5E5] font-semibold text-lg leading-snug">
                “Si esto funciona… tú fuiste de los primeros 100.”
               </p>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="relative py-12 px-6 z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#71717A]">
            &copy; 2026 Menos Millas Universitarias.
          </p>
          <div className="flex gap-6 text-xs text-[#71717A]">
            <span className="cursor-default">En Primera Fila — RD$2,000 / mes</span>
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
