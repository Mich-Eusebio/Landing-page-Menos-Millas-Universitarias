'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ticket, 
  ArrowRight, 
  CheckCircle, 
  Copy, 
  Landmark, 
  Upload, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  HelpCircle, 
  ChevronDown, 
  AlertCircle,
  FileText,
  Clock,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { auth, db, storage } from '@/lib/FirebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// Helper para calcular precio según la fecha
const getPricingDetails = (date = new Date()) => {
  // Fase 1: Early bird (primera semana de lanzamiento) hasta el 18 de Julio de 2026 inclusive
  const earlyBirdEnd = new Date('2026-07-18T23:59:59-04:00');
  // Fase 2: Precio regular desde el 19 de Julio hasta el 12 de Agosto de 2026 inclusive
  const regularEnd = new Date('2026-08-12T23:59:59-04:00');
  
  if (date <= earlyBirdEnd) {
    return { price: 1800, label: 'Preventa', phase: 'early_bird' };
  } else if (date <= regularEnd) {
    return { price: 3000, label: 'Precio Regular', phase: 'regular' };
  } else {
    return { price: 4000, label: 'Última Semana / Puerta', phase: 'puerta' };
  }
};

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [subStep, setSubStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [submissionId, setSubmissionId] = useState(null);
  
  const [price, setPrice] = useState(1800);
  const [priceLabel, setPriceLabel] = useState('Preventa');
  const [pricePhase, setPricePhase] = useState('early_bird');
  
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    ocupacion: '',
    expectativa: '',
    fuente: '',
    bankSelection: 'popular',
    comprobante: null,
    terms_accepted: false,
  });

  const [formErrors, setFormErrors] = useState({});
  const [customDropdownOpen, setCustomDropdownOpen] = useState(false);

  // Autenticación anónima
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error('Error in anonymous auth:', err);
      }
    };
    initAuth();
    return () => unsubscribe();
  }, []);

  // Calcular precio basado en fecha
  useEffect(() => {
    const checkPricing = () => {
      const now = new Date();
      const details = getPricingDetails(now);
      setPrice(details.price);
      setPriceLabel(details.label);
      setPricePhase(details.phase);
    };
    checkPricing();
  }, []);

  // Helper de compresión de imagen antes de subir a Storage
  const compressImage = (file) => {
    return new Promise((resolve) => {
      if (!file || !file.type.startsWith('image/')) {
        return resolve(file);
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            0.7
          );
        };
        img.onerror = () => resolve(file);
      };
      reader.onerror = () => resolve(file);
    });
  };

  const validateSubStep = () => {
    const errors = {};
    if (subStep === 0 && !formData.nombre.trim()) errors.nombre = 'El nombre completo es requerido';
    if (subStep === 1 && (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email))) errors.email = 'Introduce un email válido';
    if (subStep === 2 && !formData.telefono.trim()) errors.telefono = 'El WhatsApp o teléfono es requerido';
    if (subStep === 3 && !formData.ocupacion.trim()) errors.ocupacion = 'Por favor, indícanos a qué te dedicas';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextSubStep = () => {
    if (validateSubStep()) {
      if (subStep < 5) {
        setSubStep(subStep + 1);
      } else {
        setStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNextSubStep();
    }
  };

  const handleCopy = (text, setCopiedState) => {
    navigator.clipboard.writeText(text);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !formData.comprobante || !formData.terms_accepted) return;
    setLoading(true);

    try {
      const generatedId = `TSL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      let comprobanteUrl = '';

      // 1. Compresión de imagen y subida a Storage
      let fileToUpload = formData.comprobante;
      try {
        fileToUpload = await compressImage(formData.comprobante);
      } catch (err) {
        console.warn('⚠️ Error al comprimir imagen, subiendo original:', err);
      }

      const storageRef = ref(storage, `comprobantes_event_a/${generatedId}_[${formData.nombre.replace(/\s+/g, '_')}]`);
      const uploadResult = await uploadBytes(storageRef, fileToUpload);
      comprobanteUrl = await getDownloadURL(uploadResult.ref);

      // 2. Escribir registro en Firestore
      const regRef = doc(db, 'event_a_registrations', generatedId);
      await setDoc(regRef, {
        registration_id: generatedId,
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono,
        ocupacion: formData.ocupacion,
        expectativa: formData.expectativa || 'Ninguna especificada',
        fuente: formData.fuente,
        bankSelection: formData.bankSelection,
        comprobanteUrl: comprobanteUrl,
        monto_pagado: price,
        tipo_precio: priceLabel,
        terms_accepted: formData.terms_accepted,
        created_at: new Date().toISOString(),
        userId: user.uid,
        status: 'pending_validation'
      });

      // 3. Pasar a pantalla de éxito
      setSubmissionId(generatedId);
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      console.error('🔥 Error al procesar registro de evento:', err);
      alert(err.message || 'Hubo un error al procesar tu solicitud.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090909] text-slate-100 font-sans relative overflow-hidden flex flex-col justify-between py-12 px-6">
      
      {/* GLOWING BACKGROUND DECORATIONS */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[180px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />
      
      {/* BOTÓN REGRESAR AL EVENTO */}
      {step < 3 && (
        <div className="max-w-2xl mx-auto w-full mb-6 relative z-10">
          <Link 
            href="/event"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white font-black text-xs uppercase tracking-widest transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a detalles
          </Link>
        </div>
      )}

      {/* FORM CARD CONTAINER */}
      <div className="max-w-2xl mx-auto w-full relative z-10 flex-1 flex items-center justify-center">
        
        <div className="bg-gradient-to-b from-[#0e213b] to-[#0a1526] border border-white/10 rounded-3xl overflow-hidden shadow-2xl w-full">
          
          {/* ENCABEZADO DE LA TARJETA */}
          <div className="bg-white/5 px-8 py-6 border-b border-white/10 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Paso {step} de 3</p>
              <h2 className="text-xl font-black text-white uppercase italic tracking-tight mt-0.5">
                {step === 1 && 'Registro de datos'}
                {step === 2 && 'Sección de pago'}
                {step === 3 && '¡Registro Exitoso!'}
              </h2>
            </div>
            <Ticket className="w-6 h-6 text-blue-400" />
          </div>

          {/* PRECIOS Y CONTADOR DE PRECIOS */}
          {step < 3 && (
            <div className="bg-blue-600/10 px-8 py-4 border-b border-blue-500/10 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">PRECIO DE ENTRADA</p>
                <p className="text-2xl font-black text-white italic mt-0.5">
                  RD$ {price.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                {pricePhase === 'early_bird' && (
                  <>
                    <span className="text-[8px] font-black bg-blue-500/20 text-blue-300 px-2 py-1 rounded-md uppercase tracking-wider block mb-1">
                      🔥 PREVENTA (Ahorra RD$2,200)
                    </span>
                    <p className="text-[9px] font-bold text-slate-300">Solo durante la primera semana de lanzamiento</p>
                  </>
                )}
                {pricePhase === 'regular' && (
                  <>
                    <span className="text-[8px] font-black bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-md uppercase tracking-wider block mb-1">
                      PRECIO REGULAR
                    </span>
                    <p className="text-[9px] font-bold text-slate-300">Fase intermedia de venta</p>
                  </>
                )}
                {pricePhase === 'puerta' && (
                  <>
                    <span className="text-[8px] font-black bg-red-500/20 text-red-300 px-2 py-1 rounded-md uppercase tracking-wider block mb-1">
                      🚨 ÚLTIMA HORA / PUERTA
                    </span>
                    <p className="text-[9px] font-bold text-slate-300">Últimos cupos en venta</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* CUERPO DEL CONTENEDOR MULTIPASO */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              
              {/* PASO 1: FORMULARIO CONVERSACIONAL */}
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  {/* Indicador de Progreso SubStep */}
                  <div className="flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-white/5 pb-3">
                    <span>Pregunta {subStep + 1} de 6</span>
                    <div className="flex gap-1 h-1.5 w-32 bg-white/5 rounded-full overflow-hidden">
                      {[0, 1, 2, 3, 4, 5].map((idx) => (
                        <div 
                          key={idx} 
                          className={`flex-1 transition-all duration-300 ${idx <= subStep ? 'bg-blue-500' : 'bg-transparent'}`}
                        />
                      ))}
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {/* Pregunta 0: Nombre */}
                    {subStep === 0 && (
                      <motion.div
                        key="sub-nombre"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <label className="text-xs font-black text-blue-400 uppercase tracking-widest block">¿Cuál es tu nombre completo?</label>
                          <div className="relative">
                            <User className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                            <input 
                              type="text" 
                              placeholder="Ej. Juan Pérez"
                              value={formData.nombre}
                              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                              onKeyDown={handleKeyDown}
                              autoFocus
                              className={`w-full bg-white/5 border ${formErrors.nombre ? 'border-red-500/50' : 'border-white/10'} focus:border-blue-600 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-white outline-none transition-all`}
                            />
                          </div>
                          {formErrors.nombre && <p className="text-[10px] font-bold text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {formErrors.nombre}</p>}
                        </div>
                        
                        <button
                          type="button"
                          onClick={handleNextSubStep}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 active:scale-98 transition-all cursor-pointer text-xs uppercase tracking-wider"
                        >
                          Siguiente <ArrowRight className="w-4 h-4" />
                        </button>
                      </motion.div>
                    )}

                    {/* Pregunta 1: Email */}
                    {subStep === 1 && (
                      <motion.div
                        key="sub-email"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <label className="text-xs font-black text-blue-400 uppercase tracking-widest block">¿A qué correo te enviamos el boleto?</label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                            <input 
                              type="email" 
                              placeholder="ejemplo@email.com"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              onKeyDown={handleKeyDown}
                              autoFocus
                              className={`w-full bg-white/5 border ${formErrors.email ? 'border-red-500/50' : 'border-white/10'} focus:border-blue-600 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-white outline-none transition-all`}
                            />
                          </div>
                          {formErrors.email && <p className="text-[10px] font-bold text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {formErrors.email}</p>}
                        </div>
                        
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setSubStep(0)}
                            className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white font-black rounded-2xl transition-all cursor-pointer text-xs uppercase tracking-wider"
                          >
                            Atrás
                          </button>
                          <button
                            type="button"
                            onClick={handleNextSubStep}
                            className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 active:scale-98 transition-all cursor-pointer text-xs uppercase tracking-wider"
                          >
                            Siguiente <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Pregunta 2: WhatsApp */}
                    {subStep === 2 && (
                      <motion.div
                        key="sub-whatsapp"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <label className="text-xs font-black text-blue-400 uppercase tracking-widest block">¿Cuál es tu WhatsApp?</label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                            <input 
                              type="tel" 
                              placeholder="809-555-1234"
                              value={formData.telefono}
                              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                              onKeyDown={handleKeyDown}
                              autoFocus
                              className={`w-full bg-white/5 border ${formErrors.telefono ? 'border-red-500/50' : 'border-white/10'} focus:border-blue-600 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-white outline-none transition-all`}
                            />
                          </div>
                          {formErrors.telefono && <p className="text-[10px] font-bold text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {formErrors.telefono}</p>}
                        </div>
                        
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setSubStep(1)}
                            className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white font-black rounded-2xl transition-all cursor-pointer text-xs uppercase tracking-wider"
                          >
                            Atrás
                          </button>
                          <button
                            type="button"
                            onClick={handleNextSubStep}
                            className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 active:scale-98 transition-all cursor-pointer text-xs uppercase tracking-wider"
                          >
                            Siguiente <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Pregunta 3: Ocupación */}
                    {subStep === 3 && (
                      <motion.div
                        key="sub-ocupacion"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <label className="text-xs font-black text-blue-400 uppercase tracking-widest block">¿A qué te dedicas? (Empresa, Rol o Estudiante)</label>
                          <div className="relative">
                            <Briefcase className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                            <input 
                              type="text" 
                              placeholder="Ej. Desarrollador Web / Estudiante"
                              value={formData.ocupacion}
                              onChange={(e) => setFormData({ ...formData, ocupacion: e.target.value })}
                              onKeyDown={handleKeyDown}
                              autoFocus
                              className={`w-full bg-white/5 border ${formErrors.ocupacion ? 'border-red-500/50' : 'border-white/10'} focus:border-blue-600 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-white outline-none transition-all`}
                            />
                          </div>
                          {formErrors.ocupacion && <p className="text-[10px] font-bold text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {formErrors.ocupacion}</p>}
                        </div>
                        
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setSubStep(2)}
                            className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white font-black rounded-2xl transition-all cursor-pointer text-xs uppercase tracking-wider"
                          >
                            Atrás
                          </button>
                          <button
                            type="button"
                            onClick={handleNextSubStep}
                            className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 active:scale-98 transition-all cursor-pointer text-xs uppercase tracking-wider"
                          >
                            Siguiente <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Pregunta 4: Expectativa (Opcional) */}
                    {subStep === 4 && (
                      <motion.div
                        key="sub-expectativa"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <label className="text-xs font-black text-blue-400 uppercase tracking-widest block">¿Qué esperas del evento? (Opcional)</label>
                          <div className="relative">
                            <HelpCircle className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                            <textarea 
                              placeholder="Texto corto de tus expectativas..."
                              value={formData.expectativa}
                              onChange={(e) => setFormData({ ...formData, expectativa: e.target.value })}
                              rows={2}
                              autoFocus
                              className="w-full bg-white/5 border border-white/10 focus:border-blue-600 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-white outline-none transition-all resize-none"
                            />
                          </div>
                        </div>
                        
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setSubStep(3)}
                            className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white font-black rounded-2xl transition-all cursor-pointer text-xs uppercase tracking-wider"
                          >
                            Atrás
                          </button>
                          <button
                            type="button"
                            onClick={handleNextSubStep}
                            className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 active:scale-98 transition-all cursor-pointer text-xs uppercase tracking-wider"
                          >
                            Siguiente <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Pregunta 5: Dropdown fuente */}
                    {subStep === 5 && (
                      <motion.div
                        key="sub-fuente"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                      >
                        <div className="space-y-2 relative">
                          <label className="text-xs font-black text-blue-400 uppercase tracking-widest block">¿Cómo te enteraste del evento?</label>
                          
                          <button
                            type="button"
                            onClick={() => setCustomDropdownOpen(!customDropdownOpen)}
                            className={`w-full bg-white/5 border ${formErrors.fuente ? 'border-red-500/50' : 'border-white/10'} focus:border-blue-600 rounded-2xl py-3.5 px-4 text-sm font-bold text-white flex justify-between items-center transition-all`}
                          >
                            <span className={formData.fuente ? 'text-white' : 'text-slate-500'}>
                              {formData.fuente || 'Selecciona una opción'}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${customDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>

                          {customDropdownOpen && (
                            <div className="absolute z-20 w-full mt-2 bg-[#0c213b] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                              {['Instagram', 'LinkedIn', 'Un amigo me invitó', 'Otro'].map((option, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => {
                                    setFormData({ ...formData, fuente: option });
                                    setCustomDropdownOpen(false);
                                    // Auto-avanza al paso de pago directamente en 300ms!
                                    setTimeout(() => {
                                      setStep(2);
                                      window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }, 200);
                                  }}
                                  className="w-full px-5 py-3 text-left text-sm font-bold hover:bg-blue-600 text-slate-200 hover:text-white transition-colors"
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          )}
                          
                          {formErrors.fuente && <p className="text-[10px] font-bold text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {formErrors.fuente}</p>}
                        </div>
                        
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setSubStep(4)}
                            className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white font-black rounded-2xl transition-all cursor-pointer text-xs uppercase tracking-wider text-center"
                          >
                            Atrás
                          </button>
                        </div>
                      </motion.div>
                    )}

                  </AnimatePresence>
                </motion.div>
              )}

              {/* PASO 2: SECCIÓN DE PAGO */}
              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  {/* Selector de Banco */}
                  <div>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Selecciona tu banco de preferencia</p>
                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                      {['popular', 'banreservas'].map((bank) => (
                        <button
                          key={bank}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, bankSelection: bank }))}
                          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${formData.bankSelection === bank ? 'bg-blue-600 text-white shadow-lg' : 'text-white/40 hover:text-white/60'}`}
                        >
                          {bank}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tarjeta de Transferencia */}
                  <div className="bg-white/5 rounded-3xl p-6 border border-white/10 space-y-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors" />

                    <div className="flex items-center gap-3">
                      <Landmark className="w-5 h-5 text-blue-400" />
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Datos para la transferencia</p>
                    </div>

                    <div className="space-y-4 relative z-10">
                      {/* Cuenta */}
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Número de Cuenta</p>
                          <p className="text-base font-black text-white tracking-wider mt-0.5 font-mono">
                            {formData.bankSelection === 'popular' ? '0854243391' : '9607058204'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(formData.bankSelection === 'popular' ? '0854243391' : '9607058204', setCopiedAccount)}
                          className="p-2 bg-white/5 hover:bg-blue-600/20 border border-white/5 hover:border-blue-500/30 rounded-lg text-white/40 hover:text-blue-400 transition-all active:scale-90 cursor-pointer"
                          aria-label={copiedAccount ? "Número de cuenta copiado" : "Copiar número de cuenta bancaria"}
                        >
                          {copiedAccount ? <span className="text-[8px] font-black text-blue-400 uppercase">Copiado</span> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Tipo y Titular */}
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                        <div>
                          <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Tipo</p>
                          <p className="text-[10px] font-black text-white uppercase tracking-widest mt-1">Ahorro</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Titular</p>
                          <p className="text-[10px] font-black text-white uppercase tracking-widest mt-1">Michael Eusebio</p>
                        </div>
                      </div>

                      {/* Cédula */}
                      <div className="flex justify-between items-center pt-4 border-t border-white/5">
                        <div>
                          <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Cédula de Identidad</p>
                          <p className="text-[10px] font-black text-white uppercase tracking-widest mt-1">402-3402480-6</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy('40234024806', setCopiedId)}
                          className="p-2 bg-white/5 hover:bg-blue-600/20 border border-white/5 hover:border-blue-500/30 rounded-lg text-white/40 hover:text-blue-400 transition-all active:scale-90 cursor-pointer"
                          aria-label={copiedId ? "Cédula de identidad copiada" : "Copiar cédula de identidad del titular"}
                        >
                          {copiedId ? <span className="text-[8px] font-black text-blue-400 uppercase">Copiado</span> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Subida del Comprobante */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Sube la captura de pantalla del pago</p>
                    
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/10 rounded-3xl cursor-pointer bg-white/5 hover:bg-white/10 hover:border-blue-500/50 transition-all">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 text-blue-400 mb-2" />
                          {formData.comprobante ? (
                            <p className="text-sm font-black text-white uppercase italic text-center px-4 max-w-[280px] truncate">
                              {formData.comprobante.name}
                            </p>
                          ) : (
                            <>
                              <p className="text-xs text-slate-300 font-bold">Haz clic para buscar el archivo</p>
                              <p className="text-[10px] text-slate-500 font-semibold mt-1">PNG, JPG o JPEG</p>
                            </>
                          )}
                        </div>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => setFormData({ ...formData, comprobante: e.target.files[0] })}
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>

                  {/* Checkbox de términos y condiciones del evento */}
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={formData.terms_accepted}
                      onChange={(e) => setFormData({ ...formData, terms_accepted: e.target.checked })}
                      className="mt-1 w-4 h-4 rounded border-white/10 text-blue-600 focus:ring-0 outline-none"
                    />
                    <span className="text-[10px] font-semibold text-slate-400 leading-normal">
                      Entiendo que la fecha del evento es flexible a cambios. De no realizarse el evento por alguna causa de fuerza mayor, se me notificará vía WhatsApp o correo electrónico y se me realizará un reembolso (refund) total del dinero transferido.
                    </span>
                  </label>

                  {/* Botones de control paso 2 */}
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white font-black rounded-2xl transition-all cursor-pointer"
                    >
                      Atrás
                    </button>
                    
                    <button
                      type="submit"
                      onClick={handleSubmit}
                      disabled={!formData.comprobante || !formData.terms_accepted || loading}
                      className={`flex-[2] py-4 rounded-2xl font-black text-white flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        formData.comprobante && formData.terms_accepted && !loading
                          ? 'bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20 active:scale-98' 
                          : 'bg-white/10 text-white/30 cursor-not-allowed'
                      }`}
                    >
                      {loading ? 'Procesando...' : 'Finalizar Registro'}
                    </button>
                  </div>

                </motion.div>
              )}

              {/* PASO 3: ÉXITO */}
              {step === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-10 space-y-6"
                >
                  <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle className="w-12 h-12" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white leading-tight uppercase italic">¡Registro Completado! 🎉</h3>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                      Tu participación en **Tech Sin Límites** ha quedado registrada exitosamente. Estaremos validando tu transferencia.
                    </p>
                  </div>

                  {/* Código de Registro */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between max-w-xs mx-auto">
                    <div className="text-left">
                      <span className="text-[8px] font-black text-white/30 uppercase tracking-widest block">Código de Registro</span>
                      <span className="text-base font-black text-blue-400 font-mono tracking-wider">{submissionId}</span>
                    </div>
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>

                  <p className="text-[10px] text-slate-500 font-semibold max-w-xs mx-auto">
                    Te enviaremos los detalles logísticos y tu confirmación definitiva al correo electrónico y por WhatsApp en las próximas 24-48 horas.
                  </p>

                  <div className="space-y-3 pt-4">
                    <Link
                      href="/event"
                      className="w-full max-w-xs bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black py-4 rounded-2xl shadow-xl transition-all cursor-pointer mx-auto flex items-center justify-center"
                    >
                      Volver al evento
                    </Link>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setStep(1);
                        setFormData({
                          nombre: '',
                          email: '',
                          telefono: '',
                          ocupacion: '',
                          expectativa: '',
                          fuente: '',
                          bankSelection: 'popular',
                          comprobante: null,
                          terms_accepted: false,
                        });
                        setSubmissionId(null);
                      }}
                      className="w-full max-w-xs bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-2xl transition-all cursor-pointer mx-auto block"
                    >
                      Registrar otro boleto
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>

      </div>

      {/* FOOTER */}
      <div className="mt-8 text-white/30 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 relative z-10">
        Michael Eusebio | Pyhex Work | Santo Domingo, RD
      </div>

    </div>
  );
}
