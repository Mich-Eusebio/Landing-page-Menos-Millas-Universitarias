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

const EnPrimeraFila = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    monthsSubscribed: 1,
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
      // 1. Upload proof
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

      // 2. Save to Firestore
      const payload = {
        name: formData.fullName,
        email: formData.email,
        monthsSubscribed: formData.monthsSubscribed,
        comprobante_url: comprobante_url
      };
      
      await saveNewsletterSubscription(payload);

      setSuccess(true);
      // Optional: keep modal open to show success or redirect
    } catch (error) {
      console.error("Error submitting subscription:", error);
      alert("Hubo un error al procesar tu suscripción. Por favor intenta de nuevo.");
    } finally {
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
    <div className="min-h-screen bg-[#000000] text-slate-100 font-sans selection:bg-blue-500 selection:text-white relative overflow-x-hidden">
      
      {/* Glow effects */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-center backdrop-blur-md bg-black/5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-black italic">
            M
          </div>
          <span className="font-black uppercase tracking-tighter text-sm md:text-base italic">
            Michael <span className="text-blue-500 italic">Eusebio</span>
          </span>
        </div>
        <button 
          onClick={() => {
            setSuccess(false);
            setStep(1);
            setIsModalOpen(true);
          }}
          className="text-[10px] font-black uppercase tracking-widest text-blue-400 border border-blue-500/30 px-6 py-2.5 rounded-full hover:bg-blue-500/10 transition-all"
        >
          Unirse Ahora
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-24 px-6 z-10">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">
              Membresía Exclusiva
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-9xl font-black text-white italic tracking-tighter uppercase leading-[0.85] text-balance"
          >
            No estás viendo una <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 animate-gradient-x">historia</span>. <br />
            Estás a tiempo de <span className="italic">entrar</span> en ella.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex flex-col md:flex-row items-center justify-center gap-6 pt-12"
          >
            <button 
              onClick={() => {
                setSuccess(false);
                setStep(1);
                setIsModalOpen(true);
              }}
              className="group relative bg-white text-black px-12 py-6 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-105 transition-all"
            >
              UNIRME A LOS PRIMEROS 100
              <div className="absolute inset-0 rounded-[2rem] border-2 border-white/50 animate-ping opacity-20" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Bio / Identity Section */}
      <section className="relative py-24 px-6 z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden border-2 border-white/10 shadow-2xl">
              <Image 
                src="/Michael_Eusebio.png" 
                alt="Michael Eusebio" 
                fill 
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              <div className="absolute bottom-10 left-10 right-10 p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl">
                <p className="text-xl md:text-2xl font-black text-white italic leading-tight">
                  "Voy a convertirme en el primer ciego dominicano en estudiar ingeniería en IA en EE.UU."
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Proceso en Vivo</span>
                </div>
              </div>
            </div>
            
            {/* Acceptance Letter Preview */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              whileInView={{ opacity: 1, scale: 1, rotate: -12 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="absolute -top-12 -right-12 w-64 aspect-[3/4] bg-white rounded-2xl shadow-2xl p-2 hidden xl:block border-8 border-white/10"
            >
              <div className="relative w-full h-full rounded-lg overflow-hidden">
                <Image src="/carta_aceptación.png" alt="Carta de Aceptación" fill className="object-cover" />
              </div>
            </motion.div>
          </motion.div>

          <div className="space-y-12">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-tight">
                No es una idea. <br />
                No es un plan. <br />
                <span className="text-blue-500">Es el proceso en vivo.</span>
              </h2>
              <p className="text-lg text-white/60 font-medium max-w-xl">
                Soy Michael Eusebio y estoy documentando el viaje más ambicioso de mi vida. 
                Cada semana abro las puertas de mi oficina, mis pensamientos y mis estrategias para que veas la realidad de lo que significa construir un futuro en IA desde cero.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {weeklyUpdates.map((item, idx) => (
                <motion.div 
                  key={item}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl"
                >
                  <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="font-black uppercase tracking-widest text-[11px] text-white/80">{item}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Authority Section */}
      <section className="relative py-32 px-6 z-10 bg-[#050505]">
        <div className="max-w-5xl mx-auto text-center space-y-16">
          <div className="space-y-4">
            <h2 className="text-5xl md:text-8xl font-black text-white italic tracking-tighter uppercase leading-none">
              “Si esto funciona… <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600">tú fuiste de los primeros 100.</span>”
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <div className="p-8 border-l-2 border-white/5 space-y-4">
              <span className="text-amber-500 font-black text-4xl italic">P</span>
              <p className="text-sm font-bold text-white/40 uppercase tracking-widest">Dolor</p>
              <p className="text-white/80">Todo el mundo quiere entrar cuando algo ya explotó.</p>
            </div>
            <div className="p-8 border-l-2 border-white/5 space-y-4">
              <span className="text-orange-500 font-black text-4xl italic">A</span>
              <p className="text-sm font-bold text-white/40 uppercase tracking-widest">Agitación</p>
              <p className="text-white/80">Pero en ese punto, ya es tarde.</p>
            </div>
            <div className="p-8 border-l-2 border-white/5 space-y-4">
              <span className="text-red-500 font-black text-4xl italic">I</span>
              <p className="text-sm font-bold text-white/40 uppercase tracking-widest">Inacción</p>
              <p className="text-white/80">Pierdes la oportunidad de ser parte del origen.</p>
            </div>
            <div className="p-8 border-l-2 border-white/5 space-y-4 bg-white/5 rounded-r-3xl">
              <span className="text-blue-500 font-black text-4xl italic">N</span>
              <p className="text-sm font-bold text-white/40 uppercase tracking-widest">Nueva Realidad</p>
              <p className="text-white/80 font-black text-white">Estoy buscando los primeros 100.</p>
            </div>
          </div>

          <div className="pt-12 text-center space-y-6">
            <p className="text-2xl font-black italic text-white/60 uppercase tracking-tighter">
              No miles. No masivo. <span className="text-white underline decoration-blue-500 underline-offset-8">Los primeros.</span>
            </p>
            <p className="text-lg text-white/40 font-bold uppercase tracking-widest">
              👉 Cuando esto crezca, vas a poder decir que estuviste ahí.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits & Pricing */}
      <section className="relative py-32 px-6 z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative p-12 md:p-20 rounded-[4rem] bg-gradient-to-br from-[#0a0a0a] to-[#111] border-2 border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -mr-48 -mt-48" />
            
            <div className="relative z-10 flex flex-col md:flex-row gap-12 md:items-center">
              <div className="flex-1 space-y-10">
                <div className="space-y-4">
                  <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter">Beneficios: En Primera Fila</h3>
                  <div className="w-20 h-1 bg-blue-500 rounded-full" />
                </div>
                
                <ul className="space-y-6">
                  {benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center gap-4 group">
                      <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                      <span className="text-xs md:text-sm font-black uppercase tracking-widest text-white/70">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="w-full md:w-[350px] space-y-8 bg-white/5 border border-white/10 p-10 rounded-[3rem] backdrop-blur-xl">
                <div className="text-center space-y-2">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Suscripción Mensual</span>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-black text-white italic tracking-tighter">RD$2,000</span>
                    <span className="text-white/40 font-bold uppercase text-xs">/mes</span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setSuccess(false);
                    setStep(1);
                    setIsModalOpen(true);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-6 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-[0_10px_40px_rgba(37,99,235,0.3)] hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                >
                  QUIERO ESTAR EN PRIMERA FILA <ChevronRight className="w-4 h-4" />
                </button>
                
                <p className="text-[9px] text-center font-bold text-white/30 uppercase tracking-widest leading-relaxed">
                  Acceso instantáneo al reporte semanal. <br /> Cancela en un clic cuando quieras.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-24 px-6 z-10 border-t border-white/5 text-center">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-center gap-3 opacity-50 grayscale hover:grayscale-0 transition-all cursor-default">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black font-black italic text-xs">M</div>
            <span className="font-black uppercase tracking-tighter text-xs italic">Michael <span className="text-blue-500 italic">Eusebio</span></span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/20">
            &copy; 2026 Menos Millas Universitarias. Todos los derechos reservados.
          </p>
        </div>
      </footer>

      <NewsletterModal
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
      />

      {/* Success Success Screen Overlay */}
      <AnimatePresence>
        {success && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-8 max-w-sm"
            >
              <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/40">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">¡Ya estás adentro!</h2>
                <p className="text-sm text-white/60 leading-relaxed font-medium">
                  Tu suscripción a <span className="text-white italic">En Primera Fila</span> ha sido registrada. 
                  Una vez verifiquemos tu pago, recibirás el primer reporte semanal.
                </p>
              </div>
              <button 
                onClick={() => {
                  setSuccess(false);
                  setIsModalOpen(false);
                }}
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl"
              >
                Cerrar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 5s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default EnPrimeraFila;
