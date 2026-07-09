'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Ticket, 
  Clock, 
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
  Sparkles,
  AlertCircle,
  FileText
} from 'lucide-react';
import { auth, db, storage } from '@/lib/FirebaseConfig';
import { collection, doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// --- CONSTANTES ---
const EVENT_DATE = new Date('2026-08-20T19:00:00-04:00'); // 20 de Agosto de 2026 (7:00 PM local)
const EARLY_BIRD_END_DATE = new Date('2026-07-23T23:59:59-04:00'); // 2 semanas desde hoy (9 de Julio de 2026)

export default function TechEventPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [submissionId, setSubmissionId] = useState(null);
  
  // Estados para contadores
  const [timeLeftEvent, setTimeLeftEvent] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isEarlyBird, setIsEarlyBird] = useState(true);
  const [price, setPrice] = useState(1800);
  
  // Clipboard indicators
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    ocupacion: '',
    expectativa: '',
    fuente: '', // Instagram, LinkedIn, Un amigo me invitó, Otro
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

  // Calcular precio y cuenta regresiva
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      
      // Validar si aún es Early Bird
      const earlyBirdActive = now < EARLY_BIRD_END_DATE;
      setIsEarlyBird(earlyBirdActive);
      setPrice(earlyBirdActive ? 1800 : 2500);

      // Calcular tiempo para el evento
      const difference = EVENT_DATE.getTime() - now.getTime();
      if (difference <= 0) {
        setTimeLeftEvent({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeftEvent({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
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
      img.onerror = () => resolve(file);
    });
  };

  const validateStep1 = () => {
    const errors = {};
    if (!formData.nombre.trim()) errors.nombre = 'El nombre completo es requerido';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Introduce un email válido';
    if (!formData.telefono.trim()) errors.telefono = 'El WhatsApp o teléfono es requerido';
    if (!formData.ocupacion.trim()) errors.ocupacion = 'Por favor, indícanos a qué te dedicas';
    if (!formData.fuente) errors.fuente = 'Selecciona una opción';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

      const storageRef = ref(storage, `comprobantes_evento/${generatedId}_[${formData.nombre.replace(/\s+/g, '_')}]`);
      const uploadResult = await uploadBytes(storageRef, fileToUpload);
      comprobanteUrl = await getDownloadURL(uploadResult.ref);

      // 2. Escribir registro en Firestore
      const regRef = doc(db, 'tech_event_registrations', generatedId);
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
        tipo_precio: isEarlyBird ? 'Early Bird' : 'General',
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
    <div className="min-h-screen bg-[#0a192f] text-slate-100 font-sans relative overflow-hidden pb-24">
      
      {/* GLOWING BACKGROUND DECORATIONS */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[180px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />
      
      {/* CONTENEDOR VERTICAL PRINCIPAL */}
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-20 relative z-10">
        
        {/* SECCIÓN 1: HERO COOL (CENTRADITO Y DE IMPACTO) */}
        <div className="text-center space-y-8 max-w-3xl mx-auto">
          {/* BADGE DE EVENTO */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-blue-400" />
            CONFERENCIA EXCLUSIVA
          </div>

          {/* HEADLINE */}
          <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-none text-white">
            Tech Sin <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Límites</span>
          </h1>

          {/* SUBHEADLINE */}
          <p className="text-xl md:text-2xl text-blue-100/70 leading-relaxed font-bold max-w-2xl mx-auto">
            Un evento para quienes construyen a pesar de las excusas — programación, IA y accesibilidad en República Dominicana.
          </p>

          {/* CUENTA REGRESIVA EVENTO */}
          <div className="bg-gradient-to-br from-blue-900/10 to-indigo-950/10 border border-blue-500/10 rounded-3xl p-6 max-w-xl mx-auto relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4 flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" /> Cuenta Regresiva para el Evento
            </p>
            <div className="grid grid-cols-4 gap-4 text-center">
              {[
                { label: 'DÍAS', value: timeLeftEvent.days },
                { label: 'HORAS', value: timeLeftEvent.hours },
                { label: 'MINUTOS', value: timeLeftEvent.minutes },
                { label: 'SEGUNDOS', value: timeLeftEvent.seconds }
              ].map((time, idx) => (
                <div key={idx} className="bg-white/5 border border-white/5 rounded-xl p-3">
                  <span className="text-2xl md:text-3xl font-black text-white block font-mono">{String(time.value).padStart(2, '0')}</span>
                  <span className="text-[8px] font-black text-slate-400 tracking-wider block mt-1">{time.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA PRINCIPAL DEL HERO */}
          <div className="flex flex-col items-center justify-center pt-4">
            <button
              onClick={() => {
                const el = document.getElementById('registro-seccion');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-5 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black rounded-2xl flex items-center gap-3 shadow-2xl shadow-yellow-400/20 hover:scale-[1.03] active:scale-98 transition-all cursor-pointer text-base uppercase tracking-wider"
            >
              Regístrate ahora. Cupos limitados. <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SECCIÓN 2: DETALLES, HISTORIA Y FOTO */}
        <div className="grid md:grid-cols-12 gap-8 items-center pt-4 border-t border-white/10">
          
          {/* FOTO IZQUIERDA */}
          <div className="md:col-span-5 relative rounded-3xl overflow-hidden border border-white/10 aspect-[4/5] group bg-white/5 shadow-2xl">
            <img 
              src="/EXCELENTE FOTO MÍA.png" 
              alt="Michael Eusebio trabajando" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f] via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-xs font-black tracking-widest uppercase text-blue-400">Speaker Principal</p>
              <p className="text-lg font-black text-white italic uppercase">Michael Eusebio</p>
            </div>
          </div>

          {/* HISTORIA Y DETALLES LOGÍSTICOS DERECHA */}
          <div className="md:col-span-7 space-y-6">
            <div className="space-y-4 text-slate-300 text-base md:text-lg leading-relaxed font-medium">
              <p>
                Soy Michael Eusebio, programador autodidacta y usuario de lector de pantalla. Construí mi carrera en tech sin ver una sola línea de código en pantalla — y hoy quiero compartir cómo la IA está cambiando las reglas del juego para todos, sin importar de dónde partas.
              </p>
              <p>
                En este evento vas a aprender cómo la inteligencia artificial está bajando la barrera de entrada a la programación, y por qué eso es una oportunidad — no una amenaza — para el talento dominicano.
              </p>
            </div>

            {/* DETALLES LOGÍSTICOS */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="bg-white/5 border border-white/5 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600/10 rounded-xl border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">FECHA</p>
                  <p className="text-sm font-black text-white uppercase mt-0.5">20 de agosto</p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600/10 rounded-xl border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">LUGAR</p>
                  <p className="text-sm font-black text-white uppercase mt-0.5">Pyhex Work</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: FORMULARIO DE REGISTRO (CENTRADITO Y CON FANTÁSTICO DISEÑO) */}
        <div id="registro-seccion" className="max-w-2xl mx-auto w-full pt-8 border-t border-white/10">
          
          <div className="bg-gradient-to-b from-[#0e213b] to-[#0a1526] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            
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
                {isEarlyBird ? (
                  <div className="text-right">
                    <span className="text-[8px] font-black bg-blue-500/20 text-blue-300 px-2 py-1 rounded-md uppercase tracking-wider block mb-1">
                      🔥 EARLY BIRD (Ahorra RD$700)
                    </span>
                    <p className="text-[9px] font-bold text-slate-300">
                      Disponibilidad limitada
                    </p>
                  </div>
                ) : (
                  <div className="text-right">
                    <span className="text-[8px] font-black bg-slate-500/20 text-slate-300 px-2 py-1 rounded-md uppercase tracking-wider block">
                      PRECIO GENERAL
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* CUERPO DEL CONTENEDOR MULTIPASO */}
            <div className="p-8">
              <AnimatePresence mode="wait">
                
                {/* PASO 1: FORMULARIO */}
                {step === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-6"
                  >
                    {/* Campo: Nombre */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest block">Nombre Completo</label>
                      <div className="relative">
                        <User className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                        <input 
                          type="text" 
                          placeholder="Ej. Juan Pérez"
                          value={formData.nombre}
                          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                          className={`w-full bg-white/5 border ${formErrors.nombre ? 'border-red-500/50' : 'border-white/10'} focus:border-blue-600 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-white outline-none transition-all`}
                        />
                      </div>
                      {formErrors.nombre && <p className="text-[10px] font-bold text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {formErrors.nombre}</p>}
                    </div>

                    {/* Campo: Email */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest block">Correo Electrónico</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                        <input 
                          type="email" 
                          placeholder="ejemplo@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className={`w-full bg-white/5 border ${formErrors.email ? 'border-red-500/50' : 'border-white/10'} focus:border-blue-600 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-white outline-none transition-all`}
                        />
                      </div>
                      {formErrors.email && <p className="text-[10px] font-bold text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {formErrors.email}</p>}
                    </div>

                    {/* Campo: WhatsApp */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest block">WhatsApp / Teléfono</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                        <input 
                          type="tel" 
                          placeholder="809-555-1234"
                          value={formData.telefono}
                          onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                          className={`w-full bg-white/5 border ${formErrors.telefono ? 'border-red-500/50' : 'border-white/10'} focus:border-blue-600 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-white outline-none transition-all`}
                        />
                      </div>
                      {formErrors.telefono && <p className="text-[10px] font-bold text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {formErrors.telefono}</p>}
                    </div>

                    {/* Campo: Ocupación */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest block">¿A qué te dedicas? (Empresa, Rol o Estudiante)</label>
                      <div className="relative">
                        <Briefcase className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                        <input 
                          type="text" 
                          placeholder="Ej. Desarrollador Web en Pyhex / Estudiante"
                          value={formData.ocupacion}
                          onChange={(e) => setFormData({ ...formData, ocupacion: e.target.value })}
                          className={`w-full bg-white/5 border ${formErrors.ocupacion ? 'border-red-500/50' : 'border-white/10'} focus:border-blue-600 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-white outline-none transition-all`}
                        />
                      </div>
                      {formErrors.ocupacion && <p className="text-[10px] font-bold text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {formErrors.ocupacion}</p>}
                    </div>

                    {/* Campo: Expectativa (Opcional) */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest block">¿Qué esperas sacar de este evento? (Opcional)</label>
                      <div className="relative">
                        <HelpCircle className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
                        <textarea 
                          placeholder="Texto corto de tus expectativas..."
                          value={formData.expectativa}
                          onChange={(e) => setFormData({ ...formData, expectativa: e.target.value })}
                          rows={2}
                          className="w-full bg-white/5 border border-white/10 focus:border-blue-600 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-white outline-none transition-all resize-none"
                        />
                      </div>
                    </div>

                    {/* Campo: ¿Cómo te enteraste? (Dropdown) */}
                    <div className="space-y-2 relative">
                      <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest block">¿Cómo te enteraste del evento?</label>
                      
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

                    {/* Botón de envío paso 1 */}
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 active:scale-98 transition-all cursor-pointer"
                    >
                      Continuar a pago <ArrowRight className="w-5 h-5" />
                    </button>

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
                      className="w-full max-w-xs bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-2xl shadow-xl transition-all cursor-pointer mx-auto block"
                    >
                      Registrar otro boleto
                    </button>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

          </div>

          {/* FIRMA ABAJO */}
          <div className="mt-8 text-white/30 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
            <MapPin size={12} /> Michael Eusebio | Pyhex Work | Santo Domingo, RD
          </div>

        </div>

      </div>

    </div>
  );
}
