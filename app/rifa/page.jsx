"use client";
import FirebaseVars from "../../lib/FirebaseConfig.js"
const { db, auth, appId, storage } = FirebaseVars;
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import React, { useState, useEffect } from 'react';
import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  runTransaction
} from 'firebase/firestore';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged
} from 'firebase/auth';
import {
  CreditCard,
  CheckCircle,
  Instagram,
  Linkedin,
  Youtube,
  Phone,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Info,
  MapPin,
  X,
  Copy,
  Landmark
} from 'lucide-react';
import { validateAndReserveTickets, saveParticipant } from '@/lib/apis/rifaTransactions';
import { sendRafflePurchaseNotification, sendRaffleNotificationStatus } from '@/lib/apis/SorteoActions';




// --- Constants ---
const PLANS = [
  { id: 'extra', name: 'Milla Extra', price: 'RD$5,000', amount: 5000, premium: 0, general: 10 },
  { id: 'impacto', name: 'Milla de Impacto', price: 'RD$3,000', amount: 3000, premium: 0, general: 5 },
  { id: 'impulso', name: 'Milla de Impulso', price: 'RD$1,500', amount: 1500, premium: 0, general: 3 },
  { id: 'inicial', name: 'Milla Inicial', price: 'RD$1,000', amount: 1000, premium: 0, general: 1 },
];

// --- Components ---

const PrizeCard = ({ number, name, eligibility, image, isSpecial }) => (
  <div className="bg-white/5 rounded-2xl shadow-xl overflow-hidden border border-white/10 transition-transform hover:scale-105">
    <div className="h-48 bg-white/5 relative">
      {isSpecial ? (
        <div className="flex items-center justify-center h-full bg-blue-600/10">
          <HelpCircle size={64} className="text-blue-400" />
        </div>
      ) : (
        <img src={image} alt={name} className="w-full h-full object-contain p-4" onError={(e) => e.target.src = 'https://via.placeholder.com/400x300?text=Premio'} />
      )}
      <div className="absolute top-4 left-4 bg-amber-400 text-slate-900 w-8 h-8 rounded-full flex items-center justify-center font-bold">
        {number}
      </div>
    </div>
    <div className="p-5">
      <h3 className="text-xl font-bold text-white mb-1">{name}</h3>
      <p className="text-sm text-blue-100/60 mb-3">Elegibilidad: {eligibility}</p>
    </div>
  </div>
);

const Modal = ({ isOpen, onClose, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0a192f] rounded-3xl p-8 max-w-sm w-full shadow-2xl transform animate-in zoom-in duration-300 border border-white/10">
        <div className="flex justify-between items-start mb-4">
          <div className="bg-red-500/20 p-2 rounded-full text-red-400">
            <AlertCircle size={24} />
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X size={20} /></button>
        </div>
        <h3 className="text-xl font-black text-white mb-2">{title}</h3>
        <p className="text-blue-100/70 mb-6 leading-relaxed">{message}</p>
        <button
          onClick={onClose}
          autoFocus
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all"
        >
          Continuar selección
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [ticketsDB, setTicketsDB] = useState({});
  const [modalData, setModalData] = useState({ open: false, title: '', message: '' });
  const [submissionId, setSubmissionId] = useState(null);
  const [showCountdown, setShowCountdown] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [focusField, setFocusField] = useState('nombre');
  const nombreRef = React.useRef(null);
  const cedulaRef = React.useRef(null);
  const telefonoRef = React.useRef(null);
  const firstPlanRef = React.useRef(null);
  const ticketGridRef = React.useRef(null);
  const comprobanteRef = React.useRef(null);

  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    email: '',
    plan: '',
    bankSelection: 'popular',
    comprobante: null,
    terms_accepted: false,
    selectedPremium: [],
    selectedGeneral: [],
    support_reason: ""
  });

  useEffect(() => {
    if (step === 1) {
      setFocusField('nombre');
    } else if (step === 2) {
      setTimeout(() => firstPlanRef.current?.focus(), 100);
    } else if (step === 3) {
      setTimeout(() => ticketGridRef.current?.focus(), 100);
    } else if (step === 4) {
      // Bank selection - focus on first bank button
      setTimeout(() => {
        const firstBankButton = document.querySelector('button[title="Copiar número"]');
        // Actually focus on the bank selector area
      }, 100);
    } else if (step === 5) {
      setFocusField('comprobante');
    }
  }, [step]);

  useEffect(() => {
    const fieldMap = {
      nombre: nombreRef,
      cedula: cedulaRef,
      telefono: telefonoRef,
      comprobante: comprobanteRef,
    };
    const ref = fieldMap[focusField];
    if (ref?.current) {
      ref.current.focus();
    }
  }, [focusField]);

  useEffect(() => {
    const hasShown = sessionStorage.getItem('countdown_shown');
    console.log('Countdown check - hasShown:', hasShown);
    if (hasShown) return;

    const targetDate = new Date('2026-07-30T23:59:59');

    const updateCountdown = () => {
      const now = new Date();
      const diff = targetDate - now;
      if (diff <= 0) return;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    console.log('Setting countdown timers...');
    const timer1 = setTimeout(() => {
      console.log('Timer 1 fired - showing countdown');
      setIsBlurred(true);
      setShowCountdown(true);
    }, 3000);

    const timer2 = setTimeout(() => {
      console.log('Timer 2 fired - hiding countdown');
      setShowCountdown(false);
      setIsBlurred(false);
      sessionStorage.setItem('countdown_shown', 'true');
    }, 4000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

useEffect(() => {
  if (!user) return;
  // escuchar la colección de premiun tickets y general tickets
  const genRef = collection(db, 'rifas/v2/tickets_sold_general');
  const premRef = collection(db, 'rifas/v2/tickets_sold_premium');

  const unsubscribeGen = onSnapshot(genRef, (snapshot) => {
    setTicketsDB(prev => {
      const newDocs = {};
      snapshot.forEach(doc => { newDocs[doc.id] = doc.data(); });
      return { ...prev, ...newDocs };
    });
  });

  const unsubscribePrem = onSnapshot(premRef, (snapshot) => {
    setTicketsDB(prev => {
      const newDocs = {};
      snapshot.forEach(doc => { newDocs[doc.id] = doc.data(); });
      return { ...prev, ...newDocs };
    });
  });

  return () => {
    unsubscribeGen();
    unsubscribePrem();
  };
}, [user]);

const [visibleCount, setVisibleCount] = useState(200); // Empezamos mostrando 200
const [currentGridPage, setCurrentGridPage] = useState(0);
const selectedPlan = PLANS.find(p => p.id === formData.plan);

  // Salto automático si la página actual del tablero está llena (todas las casillas rojas/reserved/sold)
  useEffect(() => {
    if (step === 3) {
      const isPremium = false; // Step 3 es para boletos Generales
      const totalTickets = 2500; 
      const pageSize = 100;
      const totalPages = Math.ceil(totalTickets / pageSize);

      const startTicket = currentGridPage * pageSize + 1;
      const endTicket = Math.min(startTicket + pageSize - 1, totalTickets);

      let pageIsFull = true;
      for (let num = startTicket; num <= endTicket; num++) {
        const rawId = num.toString().padStart(4, '0');
        const fullId = isPremium ? `premium-${rawId}` : `general-${rawId}`;
        const status = ticketsDB[fullId]?.status || 'available';

        if (status !== 'sold' && status !== 'reserved') {
          pageIsFull = false;
          break;
        }
      }

      if (pageIsFull) {
        // Buscar la siguiente página disponible hacia adelante
        let targetPage = -1;
        for (let p = currentGridPage + 1; p < totalPages; p++) {
          let hasAvailable = false;
          const pStart = p * pageSize + 1;
          const pEnd = Math.min(pStart + pageSize - 1, totalTickets);
          for (let num = pStart; num <= pEnd; num++) {
            const rawId = num.toString().padStart(4, '0');
            const fullId = isPremium ? `premium-${rawId}` : `general-${rawId}`;
            const status = ticketsDB[fullId]?.status || 'available';
            if (status !== 'sold' && status !== 'reserved') {
              hasAvailable = true;
              break;
            }
          }
          if (hasAvailable) {
            targetPage = p;
            break;
          }
        }

        // Si no hay hacia adelante, buscar hacia atrás
        if (targetPage === -1) {
          for (let p = currentGridPage - 1; p >= 0; p--) {
            let hasAvailable = false;
            const pStart = p * pageSize + 1;
            const pEnd = Math.min(pStart + pageSize - 1, totalTickets);
            for (let num = pStart; num <= pEnd; num++) {
              const rawId = num.toString().padStart(4, '0');
              const fullId = isPremium ? `premium-${rawId}` : `general-${rawId}`;
              const status = ticketsDB[fullId]?.status || 'available';
              if (status !== 'sold' && status !== 'reserved') {
                hasAvailable = true;
                break;
              }
            }
            if (hasAvailable) {
              targetPage = p;
              break;
            }
          }
        }

        // Si encontramos una página con boletos disponibles, saltamos a ella
        if (targetPage !== -1 && targetPage !== currentGridPage) {
          console.log(`⏩ Tablero de página ${currentGridPage + 1} lleno. Saltando automáticamente a la página ${targetPage + 1}`);
          setCurrentGridPage(targetPage);
        }
      }
    }
  }, [currentGridPage, ticketsDB, step]);

const toggleTicket = (id, type) => {
  const rawId = id.toString().padStart(4, '0');
  const fullId = type === 'premium' ? `premium-${rawId}` : `general-${rawId}`;
  const field = type === 'premium' ? 'selectedPremium' : 'selectedGeneral';
  const max = type === 'premium' ? (selectedPlan?.premium || 0) : (selectedPlan?.general || 0);

  // Verificamos usando el fullId
  if (ticketsDB[fullId]?.status === 'sold' || ticketsDB[fullId]?.status === 'reserved') return;

  setFormData(prev => {
    const current = prev[field];
    if (current.includes(fullId)) {
      return { ...prev, [field]: current.filter(t => t !== fullId) };
    }
    if (current.length >= max) return prev;
    return { ...prev, [field]: [...current, fullId] };
  });
};

const handleNext = () => {
  // Validación de step 1: información personal
  if (step === 1) {
    if (!formData.nombre || !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.nombre.trim())) {
      setFocusField('nombre');
      return;
    }
    if (!formData.cedula) {
      setFocusField('cedula');
      return;
    }
    if (!formData.telefono) {
      setFocusField('telefono');
      return;
    }
  }

  // Validación de step 2: plan
  if (step === 2) {
    if (!formData.plan) {
      return;
    }
  }

  // Validación de step 3: tablero general
  if (step === 3) {
    const needed = selectedPlan.general;
    const current = formData.selectedGeneral.length;
    if (current < needed) {
      setModalData({
        open: true,
        title: 'Selección incompleta',
        message: `Te faltan ${needed - current} boletas por seleccionar en el tablero.`
      });
      return;
    }
  }

  // Validación de step 4: método de pago (no requiere validación, solo avanzar)
  if (step === 4) {
    // No validation needed, just proceed
  }

  // Validación de step 5: comprobante
  if (step === 5) {
    if (!formData.comprobante) {
      setFocusField('comprobante');
      return;
    }
    if (!formData.terms_accepted) {
      return;
    }
  }

  // Lógica de salto de paso
  let nextStep = step + 1;
  setFocusField(nextStep === 1 ? 'nombre' : '');
  setStep(nextStep);
};

const handleBack = () => {
  let prevStep = step - 1;

  setStep(prevStep);
};

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

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!user || !formData.comprobante || !formData.terms_accepted) return;
  setLoading(true);

  try {
    const submissionId = crypto.randomUUID();
    let comprobanteUrl = "";

    // Subir comprobante comprimido
    let fileToUpload = formData.comprobante;
    try {
      fileToUpload = await compressImage(formData.comprobante);
    } catch (compressErr) {
      console.warn("⚠️ Error compressing image, uploading original:", compressErr);
    }

    const storageRef = ref(storage, `comprobantes/comprobante de pago [${formData.nombre}] [${new Date().toLocaleDateString('es-DO')}]`);
    const uploadResult = await uploadBytes(storageRef, fileToUpload);
    comprobanteUrl = await getDownloadURL(uploadResult.ref);

    // Transacción atómica (Todo o nada)
    await runTransaction(db, async (transaction) => {
      
      // Validar y reservar tickets General
      if (formData.selectedGeneral.length > 0) {
        await validateAndReserveTickets(transaction, formData.selectedGeneral, 'rifas/v2/tickets_sold_general', formData.nombre, submissionId);
      }

      // Validar y reservar tickets Premium
      if (formData.selectedPremium.length > 0) {
        await validateAndReserveTickets(transaction, formData.selectedPremium, 'rifas/v2/tickets_sold_premium', formData.nombre, submissionId);
      }

      // Preparar payload común
      const commonData = {
        owner_name: formData.nombre,
        "4_personal_id_last_digits": formData.cedula,
        phone1: formData.telefono,
        email: formData.email,
        bankSelection: formData.bankSelection,
        plan_name: selectedPlan?.name || 'Plan',
        plan_amount: selectedPlan?.amount || 0,
        comprobanteUrl: comprobanteUrl,
        terms_accepted: formData.terms_accepted,
        created_at: new Date(),
        userId: user.uid,
        status: "reserved",
        support_reason: formData.support_reason
      };

      // Guardar registro General
      if (formData.selectedGeneral.length > 0) {
        const generalPayload = {
          ...commonData,
          submission_id: `${submissionId}_general`,
          ticket_tipe: "General",
          general_raffle_tickets: formData.selectedGeneral.map(id => parseInt(id.replace('general-', ''))),
        };
        await saveParticipant(transaction, 'rifas/v2/general_registrations', generalPayload);
      }

      // Guardar registro Premium
      if (formData.selectedPremium.length > 0) {
        const premiumPayload = {
          ...commonData,
          submission_id: `${submissionId}_premium`,
          ticket_tipe: "Premium",
          premium_raffle_tickets: formData.selectedPremium.map(id => parseInt(id.replace('premium-', ''))),
        };
        await saveParticipant(transaction, 'rifas/v2/premium_registrations', premiumPayload);
      }
    });

    // Cambiar a la pantalla de éxito inmediatamente (Non-blocking)
    setSubmissionId(submissionId);
    setStep(7); // ¡Éxito!

    // Disparar las notificaciones de WhatsApp en segundo plano
    (async () => {
      // Enviar notificación de WhatsApp al admin (Michael)
      try {
        await sendRafflePurchaseNotification(formData.nombre, selectedPlan?.name || 'plan de rifa');
      } catch (notifErr) {
        console.error("🔥 Error al enviar notificación de WhatsApp al admin:", notifErr);
      }

      // Enviar confirmación automática de WhatsApp al usuario
      let wasNotified = false;
      try {
        let formattedPhone = formData.telefono.replace(/\D/g, '');
        if (formattedPhone.length === 10) {
          formattedPhone = '1' + formattedPhone;
        }
        const response = await fetch('/api/whatsapp/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nombre: formData.nombre,
            telefono: formattedPhone,
            plan: selectedPlan?.name || 'plan de rifa',
            ticketsGeneral: formData.selectedGeneral,
            ticketsPremium: formData.selectedPremium,
            submissionId: submissionId
          }),
        });
        const resData = await response.json();
        wasNotified = !!(resData && resData.success);
      } catch (userNotifErr) {
        console.error("🔥 Error al enviar confirmación de WhatsApp al usuario:", userNotifErr);
      }

      // Enviar estado de la notificación de usuario al admin (Michael)
      try {
        await sendRaffleNotificationStatus(formData.nombre, wasNotified);
      } catch (statusErr) {
        console.error("🔥 Error al enviar notificación de estado de WhatsApp al admin:", statusErr);
      }
    })();

  } catch (err) { 
    console.error(" Error al procesar:", err);
    alert(err.message || "Error al procesar la solicitud.");
  } finally {
    setLoading(false);
  }
};

const renderTicketGrid = (totalTickets, cols, type) => {
  const isPremium = type === 'premium';
  const field = isPremium ? 'selectedPremium' : 'selectedGeneral';
  const limit = isPremium ? (selectedPlan?.premium || 0) : (selectedPlan?.general || 0);

  const pageSize = 100; 
  const totalPages = Math.ceil(totalTickets / pageSize);

  const startTicket = currentGridPage * pageSize + 1;
  const endTicket = Math.min(startTicket + pageSize - 1, totalTickets);
  const currentTickets = Array.from({ length: endTicket - startTicket + 1 }, (_, i) => startTicket + i);

  return (
    <div className="w-full space-y-4 py-2">
      {/* Encabezado */}
      <div className="flex justify-between items-center px-2">
        <h4 className="font-black text-white">
          Tablero {isPremium ? 'Premium' : 'General'}
        </h4>
        <div role="status" className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-lg">
          {formData[field].length} / {limit} seleccionados
        </div>
      </div>

      {/* CONTENEDOR DE LA TABLA (Con soporte para scroll táctil) */}
      <div className="bg-white/5 p-4 rounded-[2.5rem] border-2 border-white/10 shadow-inner overflow-hidden">
        <p className="text-[9px] text-center font-black text-white/40 mb-3 uppercase tracking-[0.2em]">
          Tickets del {startTicket} al {endTicket}
        </p>
        
        <div 
          className="grid grid-cols-10 gap-2 overflow-x-auto snap-x snap-mandatory"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {currentTickets.map((num) => {
            const rawId = num.toString().padStart(4, '0');
            const fullId = isPremium ? `premium-${rawId}` : `general-${rawId}`;
            const status = ticketsDB[fullId]?.status || 'available';
            const isSelected = formData[field].includes(fullId); 

            let colorClasses = "bg-[#E6B63A] text-white hover:bg-[#d4a52e] shadow-sm";
            if (isSelected) colorClasses = "bg-blue-600 text-white ring-4 ring-blue-400/30 scale-105 z-10 shadow-lg";
            if (status === 'reserved' || status === 'sold') colorClasses = "bg-red-600 text-white font-black shadow-inner cursor-not-allowed";

            return (
              <button
                key={fullId}
                type="button"
                aria-label={`Ticket ${num}`}
                onClick={() => toggleTicket(num, type)}
                disabled={status === 'reserved' || status === 'sold'}
                className={`${colorClasses} aspect-square rounded-xl text-[10px] font-black transition-all flex items-center justify-center snap-center`}
                style={{ minWidth: '32px' }}
              >
                {num}
              </button>
            );
          })}
        </div>
      </div>

      {/* NAVEGACIÓN ABAJO (Flechas y página) */}
      <div className="flex items-center justify-center gap-6 pt-2">
        <button 
          type="button"
          aria-label="Página anterior"
          onClick={() => setCurrentGridPage(prev => Math.max(0, prev - 1))}
          disabled={currentGridPage === 0}
          className="p-3 rounded-full bg-white/5 border-2 border-white/10 shadow-sm text-blue-400 disabled:opacity-20 hover:bg-blue-600/20 active:scale-90 transition-all"
        >
          <ArrowRight className="rotate-180" size={20} />
        </button>

        <div className="text-center min-w-[100px]">
          <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">
            Pág. {currentGridPage + 1} de {totalPages}
          </span>
        </div>

        <button 
          type="button"
          aria-label="Siguiente página"
          onClick={() => setCurrentGridPage(prev => Math.min(totalPages - 1, prev + 1))}
          disabled={currentGridPage === totalPages - 1}
          className="p-3 rounded-full bg-white/5 border-2 border-white/10 shadow-sm text-blue-400 disabled:opacity-20 hover:bg-blue-600/20 active:scale-90 transition-all"
        >
          <ArrowRight size={20} />
        </button>
      </div>

      {/* Guía visual para móviles */}
      <p className="text-center text-[9px] text-white/30 font-bold italic">
        Tip: También puedes deslizar los números hacia los lados
      </p>
    </div>
  );
};

if (step === 0) return (
  <div className="min-h-screen bg-[#0a192f] font-sans text-slate-100 relative">
    <div className={isBlurred ? 'blur-md transition-all duration-500' : 'transition-all duration-500'}>

    <section className="pt-20 md:pt-32 pb-20 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-16">
        <div className="flex-shrink-0">
          <div className="w-64 h-80 md:w-80 md:h-96 rounded-3xl overflow-hidden border-4 border-amber-400/30 shadow-2xl">
            <img src="/EXCELENTE FOTO MÍA.png" alt="Michael Eusebio" className="w-full h-full object-cover object-top" />
          </div>
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight text-white">
            Impulsa mi camino a <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">una de las mejores universidades del mundo.</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100/70 mb-10 max-w-2xl mx-auto md:mx-0 leading-relaxed">
            Participa y gana premios premium mientras acortas la meta.
          </p>
          <button onClick={() => setStep(1)} className="bg-amber-400 text-slate-900 px-8 py-4 rounded-2xl text-lg font-black hover:bg-amber-300 shadow-xl shadow-amber-400/20 flex items-center justify-center gap-2 mx-auto md:mx-0">
            Participar ahora <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </section>

    <section className="py-20 px-4 bg-[#050b16]">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black mb-12 text-center text-white">
          Premio Principal
        </h2>
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-16">
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
              iPhone 17 256GB
            </h3>
            <p className="text-xl text-amber-400 font-bold mb-8">
              o el equivalente en efectivo
            </p>
            <a 
              href="https://www.apple.com/shop/buy-iphone/iphone-17" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-400 hover:bg-green-300 text-slate-900 px-6 py-3 rounded-full font-bold transition-all shadow-lg shadow-green-400/20"
            >
              Ver valoración
              <ArrowRight size={16} />
            </a>
          </div>
          <div className="flex-shrink-0">
            <img 
              src="https://files.tecnoblog.net/wp-content/uploads/2025/09/iphone-17-azul-nevoa-700x700.png" 
              alt="iPhone 17" 
              className="w-64 h-64 md:w-80 md:h-80 object-contain"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/400x400?text=iPhone+17'; }}
            />
          </div>
        </div>
      </div>
    </section>

    <footer className="bg-[#071120] text-white py-12 px-4 text-center">
      <div className="flex justify-center gap-6 mb-6">
        <a href="https://instagram.com/mich_eusebio" target="_blank" className="hover:text-blue-400 transition"><Instagram /></a>
        <a href="https://www.linkedin.com/in/mich-eusebio/" target="_blank" className="hover:text-blue-400 transition"><Linkedin /></a>
        <a href="https://wa.me/18295705985" target="_blank" className="hover:text-blue-400 transition"><Phone /></a>
      </div>
      <p className="text-white/20 text-xs">© 2025 Menos Millas Universitarias. Apoyo estudiantil Michael Eusebio.</p>
    </footer>
    </div>

    {showCountdown && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a192f]/90 backdrop-blur-sm">
        <div className="text-center">
          <p className="text-green-400 text-lg md:text-xl font-bold uppercase tracking-widest mb-6">La rifa cierra en</p>
          <div className="flex items-center justify-center gap-4 md:gap-8">
            <div className="text-center">
              <div className="text-green-400 text-6xl md:text-8xl font-black leading-none">{String(timeLeft.days).padStart(2, '0')}</div>
              <p className="text-white/60 text-xs md:text-sm font-bold uppercase tracking-widest mt-2">Días</p>
            </div>
            <div className="text-green-400 text-4xl md:text-6xl font-black">:</div>
            <div className="text-center">
              <div className="text-green-400 text-6xl md:text-8xl font-black leading-none">{String(timeLeft.hours).padStart(2, '0')}</div>
              <p className="text-white/60 text-xs md:text-sm font-bold uppercase tracking-widest mt-2">Horas</p>
            </div>
            <div className="text-green-400 text-4xl md:text-6xl font-black">:</div>
            <div className="text-center">
              <div className="text-green-400 text-6xl md:text-8xl font-black leading-none">{String(timeLeft.minutes).padStart(2, '0')}</div>
              <p className="text-white/60 text-xs md:text-sm font-bold uppercase tracking-widest mt-2">Min</p>
            </div>
            <div className="text-green-400 text-4xl md:text-6xl font-black">:</div>
            <div className="text-center">
              <div className="text-green-400 text-6xl md:text-8xl font-black leading-none">{String(timeLeft.seconds).padStart(2, '0')}</div>
              <p className="text-white/60 text-xs md:text-sm font-bold uppercase tracking-widest mt-2">Seg</p>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);

const isStepValid = () => {
  switch (step) {
    case 1: return formData.nombre && formData.cedula && formData.telefono;
    case 2: return formData.plan;
    case 3: return formData.selectedGeneral.length >= (selectedPlan?.general || 0);
    case 4: return true; // Bank selection always valid
    case 5: return formData.comprobante && formData.terms_accepted;
    default: return true;
  }
};

const getStepTitle = () => {
  const titles = [
    '', 'Información Personal', 'Plan de Apoyo',
    'Números', 'Método de Pago', 'Comprobante'
  ];
  return titles[step];
};

return (
  <div className="min-h-screen bg-[#0a192f] flex flex-col items-center p-4">
    <Modal
      isOpen={modalData.open}
      onClose={() => setModalData({ ...modalData, open: false })}
      title={modalData.title}
      message={modalData.message}
    />

    <div className="w-full max-w-2xl bg-[#0d1f3c] rounded-[2.5rem] shadow-2xl overflow-hidden my-4 border border-white/10">
      {/* Progress Bar */}
      <div className="bg-blue-600 p-8 text-white">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => setStep(0)} className="text-blue-200 hover:text-white text-sm font-bold">← Inicio</button>
          <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
            Paso {step} de 5
          </span>
        </div>
        <h2 className="text-2xl font-black">{getStepTitle()}</h2>
        <div className="mt-6 flex gap-1.5">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-amber-400' : 'bg-blue-800'}`} />
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8">
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-blue-600/10 p-4 rounded-2xl border border-blue-500/20 mb-4 flex gap-3 items-center">
              <Info size={20} className="text-blue-400" />
              <p className="text-xs text-blue-200">Usa números sin guiones, puntos ni paréntesis.</p>
            </div>
            <div>
              <label className="block text-sm font-black text-white mb-2">Nombre completo *</label>
              <input 
                ref={nombreRef}
                required 
                type="text" 
                pattern="[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+"
                title="Solo se permiten letras y espacios"
                className="w-full p-4 bg-white/5 rounded-2xl border-2 border-white/10 focus:border-blue-500 focus:bg-white/10 transition-all outline-none text-white" 
                placeholder="Ej: Michael Eusebio" 
                value={formData.nombre} 
                onChange={e => setFormData({ ...formData, nombre: e.target.value })} 
              />
            </div>
            <div>
              <label className="block text-sm font-black text-white mb-2">Últimos 4 dígitos de la cédula *</label>
              <input 
                ref={cedulaRef}
                required 
                type="text" 
                maxLength="4" 
                className="w-full p-4 bg-white/5 rounded-2xl border-2 border-white/10 focus:border-blue-500 focus:bg-white/10 transition-all outline-none text-white" 
                placeholder="1234" 
                value={formData.cedula} 
                onChange={e => setFormData({ ...formData, cedula: e.target.value.replace(/\D/g, '') })} 
              />
            </div>
            <div>
              <label className="block text-sm font-black text-white mb-2">WhatsApp o Teléfono *</label>
              <input 
                ref={telefonoRef}
                required 
                type="tel" 
                className="w-full p-4 bg-white/5 rounded-2xl border-2 border-white/10 focus:border-blue-500 focus:bg-white/10 transition-all outline-none text-white" 
                placeholder="Ej: 18295551234" 
                value={formData.telefono} 
                onChange={e => setFormData({ ...formData, telefono: e.target.value.replace(/[^0-9]/g, '') })} 
              />
            </div>
            <div>
              <label className="block text-sm font-black text-white mb-2">Correo electrónico *</label>
              <input required type="email" className="w-full p-4 bg-white/5 rounded-2xl border-2 border-white/10 focus:border-blue-500 focus:bg-white/10 transition-all outline-none text-white" placeholder="tu@email.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-500">
            {PLANS.map((plan, index) => (
              <label key={plan.id} className={`flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all cursor-pointer ${formData.plan === plan.id ? 'border-blue-500 bg-blue-600/10 ring-4 ring-blue-500/20' : 'border-white/10 hover:border-blue-400/50'}`}>
                <div className="flex items-center gap-4">
                  <input 
                    ref={index === 0 ? firstPlanRef : null}
                    type="radio" 
                    name="plan" 
                    className="w-6 h-6 text-blue-500" 
                    checked={formData.plan === plan.id} 
                    onChange={() => setFormData({ ...formData, plan: plan.id })} 
                  />
                  <div>
                    <p className="font-black text-white text-lg">{plan.name}</p>
                    <p className="text-xs text-blue-300 font-bold uppercase tracking-wider">
                      {plan.general} ticket{plan.general > 1 ? 's' : ''} sorteo general
                    </p>
                  </div>
                </div>
                <span className="font-black text-white">{plan.price}</span>
              </label>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="animate-in slide-in-from-right-8 duration-500" ref={ticketGridRef} tabIndex={-1}>
            <div className="bg-amber-400/10 p-4 rounded-2xl flex items-start gap-3 mb-8 border border-amber-400/20">
              <Info size={20} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-200 leading-relaxed font-medium">
                Tienes {selectedPlan.general} {selectedPlan.general === 1 ? 'número disponible' : 'números disponibles'} para participar.
              </p>
            </div>
            {renderTicketGrid(2500, 10, 'general')}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-5 flex items-center justify-between relative overflow-hidden">
              <div>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Total a transferir</p>
                <p className="text-2xl font-black text-white tracking-tighter mt-1">
                  {selectedPlan?.price || 'RD$0'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-blue-400 bg-blue-600/20 px-2 py-1 rounded-lg uppercase tracking-wider">
                  {selectedPlan?.name || 'Plan'}
                </span>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Selecciona tu banco</p>
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                {['popular', 'banreservas'].map((bank) => (
                  <button
                    key={bank}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, bankSelection: bank }))}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${formData.bankSelection === bank ? 'bg-blue-600 text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
                  >
                    {bank}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-2">
                <Landmark className="w-5 h-5 text-blue-400" />
                <p className="text-xs font-black text-blue-400 uppercase tracking-widest">Datos de transferencia</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em]">Número de Cuenta</p>
                    <p className="text-base font-black text-white tracking-wider mt-0.5">
                      {formData.bankSelection === 'popular' ? '0854243391' : '9607058204'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(formData.bankSelection === 'popular' ? '0854243391' : '9607058204')}
                    className="p-2 bg-white/5 hover:bg-blue-600/20 border border-white/10 hover:border-blue-400 rounded-lg text-white/40 hover:text-blue-400 transition-all active:scale-90"
                    title="Copiar número"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em]">Tipo</p>
                    <p className="text-[10px] font-black text-white uppercase tracking-widest mt-1">Ahorro</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em]">Titular</p>
                    <p className="text-[10px] font-black text-white uppercase tracking-widest mt-1">Michael Eusebio</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                  <div>
                    <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em]">Cédula</p>
                    <p className="text-[10px] font-black text-white uppercase tracking-widest mt-1">402-3402480-6</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText('40234024806')}
                    className="p-2 bg-white/5 hover:bg-blue-600/20 border border-white/10 hover:border-blue-400 rounded-lg text-white/40 hover:text-blue-400 transition-all active:scale-90"
                    title="Copiar cédula"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-blue-600 text-white p-5 rounded-2xl text-center">
              <p className="font-black text-lg mb-1">📸 Sube el screenshot de tu transferencia</p>
              <p className="text-blue-100 text-sm">Toma una foto o sube una captura de pantalla del comprobante</p>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-blue-600 text-white p-5 rounded-2xl text-center">
              <p className="font-black text-lg mb-1">📸 Sube el screenshot de tu transferencia</p>
              <p className="text-blue-100 text-sm">Toma una foto o sube una captura de pantalla del comprobante</p>
            </div>

            <div className="relative border-4 border-dashed border-blue-400/30 bg-blue-600/5 rounded-[2.5rem] p-12 text-center hover:bg-blue-600/10 hover:border-blue-400/50 transition-all group">
              <input
                ref={comprobanteRef}
                required
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={e => setFormData({ ...formData, comprobante: e.target.files[0] })}
              />
              {formData.comprobante ? (
                <div className="text-green-400 font-black flex flex-col items-center gap-2">
                  <CheckCircle size={40} className="animate-bounce" />
                  <p className="text-sm">¡Comprobante cargado!</p>
                  <p className="text-xs text-white/50">{formData.comprobante.name.substring(0, 25)}...</p>
                </div>
              ) : (
                <div className="text-white/70 flex flex-col items-center gap-4">
                  <div className="bg-blue-600/20 p-4 rounded-full group-hover:scale-110 transition-transform">
                    <CreditCard size={32} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="font-black text-blue-300 text-base">Click para subir comprobante</p>
                    <p className="text-xs text-white/50 mt-1">JPG, PNG o PDF</p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-black text-white mb-2">¿Por qué apoyas esta causa? (Opcional)</label>
              <textarea 
              rows="2" 
              className="w-full p-4 bg-white/5 rounded-2xl border-2 border-white/10 focus:border-blue-500 focus:bg-white/10 transition-all outline-none resize-none text-white" 
              placeholder="Escribe un mensaje breve..." 
              value={formData.support_reason} 
              onChange={e => setFormData({ ...formData, support_reason: e.target.value })} 
            />
          </div>

            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <label className="flex items-start gap-4 cursor-pointer group">
                <div className="relative flex items-center mt-1">
                  <input
                    required
                    type="checkbox"
                    className="peer h-6 w-6 cursor-pointer appearance-none rounded-md border-2 border-blue-400/50 checked:bg-blue-600 checked:border-blue-600 transition-all shadow-sm"
                    checked={formData.terms_accepted || false}
                    onChange={e => setFormData({ ...formData, terms_accepted: e.target.checked })}
                  />
                  <CheckCircle size={16} className="absolute left-1 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                </div>
                <span className="text-xs text-white/70 leading-relaxed font-medium">
                  Acepto que mi contribución es una donación para apoyar la meta universitaria de Michael. Entiendo que los fondos no son reembolsables y que si no reclamo el premio en 48h se elegirá un nuevo ganador.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* PASO 7: ÉXITO */}
        {step === 7 && (
          <div className="text-center py-16 animate-in zoom-in duration-700">
            <div className="w-24 h-24 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <CheckCircle size={56} />
            </div>
            <h2 className="text-3xl font-black mb-4 text-white leading-tight">Tu participación quedó registrada 🎉</h2>
            <p className="text-white/70 mb-8 leading-relaxed max-w-sm mx-auto font-medium">
              Gracias por apostar por el talento dominicano con discapacidad. Te hemos enviado un mensaje de confirmación por WhatsApp con los detalles de tus tickets.
            </p>

            <button
              onClick={() => window.location.reload()}
              className="w-full max-w-sm bg-blue-600 text-white px-6 py-4 rounded-2xl font-black hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all"
            >
              Cerrar esta ventana
            </button>
          </div>
        )}

        {step > 0 && step < 6 && (
          <div className="mt-12 flex gap-4">
            <button type="button" onClick={handleBack} className="flex-1 py-5 px-6 rounded-3xl font-black text-white/50 bg-white/5 hover:bg-white/10 transition-all">
              Anterior
            </button>
            {step === 5 ? (
              <button type="submit" disabled={!isStepValid() || loading} className={`flex-[2] py-5 px-6 rounded-3xl font-black text-white transition-all flex items-center justify-center gap-2 ${isStepValid() ? 'bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20' : 'bg-white/10 cursor-not-allowed text-white/30'}`}>
                {loading ? 'Procesando...' : 'Finalizar Registro'}
              </button>
            ) : (
              <button type="button" onClick={handleNext} disabled={!isStepValid()} className={`flex-[2] py-5 px-6 rounded-3xl font-black text-white transition-all flex items-center justify-center gap-2 ${isStepValid() ? 'bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20' : 'bg-white/10 cursor-not-allowed text-white/30'}`}>
                Continuar <ArrowRight size={20} />
              </button>
            )}
          </div>
        )}
      </form>
    </div>

    <div className="mt-8 text-white/30 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
      <MapPin size={12} /> Michael Eusebio | Santo Domingo, RD
    </div>
  </div>
);
}