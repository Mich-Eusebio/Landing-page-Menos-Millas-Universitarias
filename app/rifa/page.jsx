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
  X
} from 'lucide-react';



// --- Constants ---
const PLANS = [
  { id: 'extra', name: 'Milla Extra', price: 'RD$5,000', amount: 5000, premium: 3, general: 10 },
  { id: 'impacto', name: 'Milla de Impacto', price: 'RD$3,000', amount: 3000, premium: 1, general: 5 },
  { id: 'impulso', name: 'Milla de Impulso', price: 'RD$1,500', amount: 1500, premium: 0, general: 3 },
  { id: 'inicial', name: 'Milla Inicial', price: 'RD$1,000', amount: 1000, premium: 0, general: 1 },
];

const SOURCES = ['en persona', 'redes sociales', 'referidor del sorteo', 'colegio', 'trabajo', 'iglesia', 'vecino', 'conocido', 'otro'];

// --- Components ---

const PrizeCard = ({ number, name, eligibility, image, isSpecial }) => (
  <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transition-transform hover:scale-105">
    <div className="h-48 bg-gray-200 relative">
      {isSpecial ? (
        <div className="flex items-center justify-center h-full bg-blue-50">
          <HelpCircle size={64} className="text-blue-400" />
        </div>
      ) : (
        <img src={image} alt={name} className="w-full h-full object-contain p-4" onError={(e) => e.target.src = 'https://via.placeholder.com/400x300?text=Premio'} />
      )}
      <div className="absolute top-4 left-4 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
        {number}
      </div>
    </div>
    <div className="p-5">
      <h3 className="text-xl font-bold text-gray-800 mb-1">{name}</h3>
      <p className="text-sm text-gray-500 mb-3">Elegibilidad: {eligibility}</p>
    </div>
  </div>
);

const Modal = ({ isOpen, onClose, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl transform animate-in zoom-in duration-300">
        <div className="flex justify-between items-start mb-4">
          <div className="bg-red-100 p-2 rounded-full text-red-600">
            <AlertCircle size={24} />
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6 leading-relaxed">{message}</p>
        <button
          onClick={onClose}
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

  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    telefonoSecundario: '',
    email: '',
    ubicacion: '',
    plan: '',
    referidor: 'No',
    nombreReferidor: '',
    fuente: '',
    comprobante: null,
    terms_accepted: false,
    selectedPremium: [],
    selectedGeneral: [],
    support_reason: ""
  });

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
  const genRef = collection(db, 'tickets_sold_general');
  const premRef = collection(db, 'tickets_sold_premium');

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
  // Validación de tablero Premium
  if (step === 4 && selectedPlan?.premium > 0) {
    const needed = selectedPlan.premium;
    const current = formData.selectedPremium.length;
    if (current < needed) {
      setModalData({
        open: true,
        title: 'Selección incompleta',
        message: `Te faltan ${needed - current} boletas por seleccionar en el tablero Premium.`
      });
      return;
    }
  }

  // Validación de tablero General
  if (step === 5) {
    const needed = selectedPlan.general;
    const current = formData.selectedGeneral.length;
    if (current < needed) {
      setModalData({
        open: true,
        title: 'Selección incompleta',
        message: `Te faltan ${needed - current} boletas por seleccionar en el tablero General.`
      });
      return;
    }
  }

  // Lógica de salto de paso (Bug fix)
  let nextStep = step + 1;

  // Si estamos en Referencia (3) y el plan NO tiene premium, saltar directo al General (5)
  if (step === 3 && selectedPlan?.premium === 0) {
    nextStep = 5;
  }

  setStep(nextStep);
};

const handleBack = () => {
  let prevStep = step - 1;

  // Si estamos en General (5) y el plan NO tiene premium, volver directo a Referencia (3)
  if (step === 5 && selectedPlan?.premium === 0) {
    prevStep = 3;
  }

  setStep(prevStep);
};

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!user || !formData.comprobante || !formData.terms_accepted) return;
  setLoading(true);

  try {
    const submissionId = crypto.randomUUID();
    let comprobanteUrl = "";
    let generalPayload = null;
    let premiumPayload = null

    // : Subir archivo ---
    const storageRef = ref(storage, `comprobantes/comprobante de pago [${formData.nombre}] [${new Date().toLocaleDateString('es-DO')}]`);
    const uploadResult = await uploadBytes(storageRef, formData.comprobante);
    comprobanteUrl = await getDownloadURL(uploadResult.ref);

    // --- PASO 2: La Transacción (Todo o nada) ---
    await runTransaction(db, async (transaction) => {
      
      // A. VALIDACIÓN DE DISPONIBILIDAD
      for (const tid of formData.selectedGeneral) {
        const tDocRef = doc(db, 'tickets_sold_general', tid);
        const tSnap = await transaction.get(tDocRef);
        if (tSnap.exists() && (tSnap.data().status === 'sold' || tSnap.data().status === 'reserved')) {
          throw new Error(`El ticket General ${tid} ya no está disponible.`);
        }
      }

      for (const tid of formData.selectedPremium) {
        const tDocRef = doc(db, 'tickets_sold_premium', tid);
        const tSnap = await transaction.get(tDocRef);
        if (tSnap.exists() && (tSnap.data().status === 'sold' || tSnap.data().status === 'reserved')) {
          throw new Error(`El ticket Premium ${tid} ya no está disponible.`);
        }
      }

      //MARCAR COMO RESERVADOS (Update de estados)
      formData.selectedGeneral.forEach((tid) => {
        const tDocRef = doc(db, 'tickets_sold_general', tid);
        transaction.set(tDocRef, { 
          status: 'reserved', 
          reservedBy: formData.nombre, 
          timestamp: Date.now() 
        });
      });

      formData.selectedPremium.forEach((tid) => {
        const tDocRef = doc(db, 'tickets_sold_premium', tid);
        transaction.set(tDocRef, { 
          status: 'reserved', 
          reservedBy: formData.nombre, 
          timestamp: Date.now() 
        });
      });

      // PREPARAR PAYLOADS
      const commonData = {
        owner_name: formData.nombre,
        "4_personal_id_last_digits": formData.cedula,
        phone1: formData.telefono,
        phone2: formData.telefonoSecundario || "None",
        email: formData.email,
        owner_address: formData.ubicacion || "None",
        comprobanteUrl: comprobanteUrl,
        terms_accepted: formData.terms_accepted,
        created_at: new Date(),
        userId: user.uid,
        status: "reserved",
        support_reason: formData.support_reason
      };

      // D. GUARDAR REGISTROS DE VENTA
      if (formData.selectedGeneral.length > 0) {
        const generalPayload = {
          ...commonData,
          ticket_tipe: "General",
          general_raffle_tickets: formData.selectedGeneral.map(id => parseInt(id.replace('general-', ''))),
        };
        const regGenRef = doc(db, 'general_registrations', `${submissionId}_general`);
        transaction.set(regGenRef, generalPayload);
      }

      if (formData.selectedPremium.length > 0) {
        const premiumPayload = {
          ...commonData,
          ticket_tipe: "Premium",
          premium_raffle_tickets: formData.selectedPremium.map(id => parseInt(id.replace('premium-', ''))),
        };
        const regPremRef = doc(db, 'premium_registrations', `${submissionId}_premium`);
        transaction.set(regPremRef, premiumPayload);
      }
    });
    setStep(8); // ¡Éxito!
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

  const pageSize = 120; 
  const totalPages = Math.ceil(totalTickets / pageSize);

  const startTicket = currentGridPage * pageSize + 1;
  const endTicket = Math.min(startTicket + pageSize - 1, totalTickets);
  const currentTickets = Array.from({ length: endTicket - startTicket + 1 }, (_, i) => startTicket + i);

  return (
    <div className="w-full space-y-4 py-2">
      {/* Encabezado */}
      <div className="flex justify-between items-center px-2">
        <h4 className="font-black text-gray-800">
          Tablero {isPremium ? 'Premium' : 'General'}
        </h4>
        <div role="status" className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-lg">
          {formData[field].length} / {limit} seleccionados
        </div>
      </div>

      {/* CONTENEDOR DE LA TABLA (Con soporte para scroll táctil) */}
      <div className="bg-gray-50 p-4 rounded-[2.5rem] border-2 border-gray-100 shadow-inner overflow-hidden">
        <p className="text-[9px] text-center font-black text-gray-400 mb-3 uppercase tracking-[0.2em]">
          Tickets del {startTicket} al {endTicket}
        </p>
        
        <div 
          className="grid grid-cols-10 gap-2 overflow-x-auto snap-x snap-mandatory"
          style={{ WebkitOverflowScrolling: 'touch' }} // Suavidad en iPhone
        >
          {currentTickets.map((num) => {
            const rawId = num.toString().padStart(4, '0');
            const fullId = isPremium ? `premium-${rawId}` : `general-${rawId}`; // ID con prefijo
            const status = ticketsDB[fullId]?.status || 'available';
            const isSelected = formData[field].includes(fullId); 

            let colorClasses = "bg-yellow-400 text-white hover:bg-yellow-500 shadow-sm";
            if (isSelected) colorClasses = "bg-blue-600 text-white ring-4 ring-blue-100 scale-105 z-10 shadow-lg";
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
          className="p-3 rounded-full bg-white border-2 border-gray-100 shadow-sm text-blue-600 disabled:opacity-20 hover:bg-blue-50 active:scale-90 transition-all"
        >
          <ArrowRight className="rotate-180" size={20} />
        </button>

        <div className="text-center min-w-[100px]">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
            Pág. {currentGridPage + 1} de {totalPages}
          </span>
        </div>

        <button 
          type="button"
          aria-label="Siguiente página"
          onClick={() => setCurrentGridPage(prev => Math.min(totalPages - 1, prev + 1))}
          disabled={currentGridPage === totalPages - 1}
          className="p-3 rounded-full bg-white border-2 border-gray-100 shadow-sm text-blue-600 disabled:opacity-20 hover:bg-blue-50 active:scale-90 transition-all"
        >
          <ArrowRight size={20} />
        </button>
      </div>

      {/* Guía visual para móviles */}
      <p className="text-center text-[9px] text-gray-300 font-bold italic">
        Tip: También puedes deslizar los números hacia los lados
      </p>
    </div>
  );
};

if (step === 0) return (
  <div className="min-h-screen bg-white font-sans text-gray-900">
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <span className="font-black text-xl tracking-tighter text-blue-600">MENOS MILLAS</span>
        <button onClick={() => setStep(1)} className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-blue-700 transition">
          ACORTEMOS LA META!
        </button>
      </div>
    </nav>

    <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
          Mi llegada a la universidad este año se decide <span className="text-blue-600">aquí y ahora.</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          Gana premios premium mientras apoyas el paso que define si el primer desarrollador de software dominicano con discapacidad visual puede llegar a una de las mejores universidades del mundo.
        </p>
        <button onClick={() => setStep(1)} className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-lg font-black hover:bg-blue-700 shadow-xl shadow-blue-200 flex items-center justify-center gap-2 mx-auto">
          ACORTEMOS LA META! <ArrowRight size={20} />
        </button>
        <div className="mt-12 p-4 bg-red-50 border border-red-100 rounded-2xl inline-flex items-center gap-3 text-red-700 text-sm font-medium">
          <AlertCircle size={18} /> Prueba de fondos requerida antes del 1 de mayo.
        </div>
      </div>
    </section>

    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <PrizeCard number="1" name="IPhone 16 Pro" eligibility="Todos los planes" image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREAF22_unWfzVdKNGzFH9o-ZLnPGPckweP5ZWUH-ZHqg&s" />
          <PrizeCard number="2" name="iPad 10th Gen" eligibility="Todos los planes" image="https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/ipad-10th-gen-storage-select-202212-blue" />
          <PrizeCard number="3" name="AirPods 4" eligibility="Todos los planes" image="https://portatilshoprd.com/wp-content/uploads/2024/12/2e373d_fceb919ac4404e6f8e4f9cffc8fa78dcmv2.png" />
          <PrizeCard number="🎁" name="Premio Sorpresa" eligibility="Solo Milla Extra & Impacto" isSpecial={true} />
        </div>
      </div>
    </section>

    <footer className="bg-gray-900 text-white py-12 px-4 text-center">
      <div className="flex justify-center gap-6 mb-6">
        <a href="https://instagram.com/mich_eusebio" target="_blank" className="hover:text-blue-400 transition"><Instagram /></a>
        <a href="https://www.linkedin.com/in/mich-eusebio/" target="_blank" className="hover:text-blue-400 transition"><Linkedin /></a>
        <a href="https://wa.me/18295705985" target="_blank" className="hover:text-blue-400 transition"><Phone /></a>
      </div>
      <p className="text-gray-500 text-xs">© 2025 Menos Millas Universitarias. Apoyo estudiantil Michael Eusebio.</p>
    </footer>
  </div>
);

const isStepValid = () => {
  switch (step) {
    case 1: return formData.nombre && formData.cedula && formData.telefono;
    case 2: return formData.plan;
    case 3: return formData.fuente && (formData.referidor === 'No' || formData.nombreReferidor);
    case 4: return selectedPlan?.premium > 0;
    case 5: return true;
    case 6: return true;
    case 7: return formData.comprobante && formData.terms_accepted;
    default: return true;
  }
};

const getStepTitle = () => {
  const titles = [
    '', 'Información Personal', 'Plan de Apoyo', 'Referencia',
    'Números Premium', 'Números Generales', 'Confirmación de Selección', 'Finalizar Pago'
  ];
  return titles[step];
};

return (
  <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
    <Modal
      isOpen={modalData.open}
      onClose={() => setModalData({ ...modalData, open: false })}
      title={modalData.title}
      message={modalData.message}
    />

    <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden my-4">
      {/* Progress Bar */}
      <div className="bg-blue-600 p-8 text-white">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => setStep(0)} className="text-blue-200 hover:text-white text-sm font-bold">← Inicio</button>
          <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
            Paso {step} de 7
          </span>
        </div>
        <h2 className="text-2xl font-black">{getStepTitle()}</h2>
        <div className="mt-6 flex gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-yellow-400' : 'bg-blue-800'}`} />
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8">
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-4 flex gap-3 items-center">
              <Info size={20} className="text-blue-600" />
              <p className="text-xs text-blue-800">Usa números sin guiones, puntos ni paréntesis.</p>
            </div>
            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">Nombre y Apellido *</label>
              <input required type="text" className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white transition-all outline-none text-gray-900" placeholder="Ej: Michael Eusebio" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">Últimos 4 dígitos de la cédula *</label>
                <input required type="text" maxLength="4" className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white transition-all outline-none text-gray-900" placeholder="1234" value={formData.cedula} onChange={e => setFormData({ ...formData, cedula: e.target.value.replace(/\D/g, '') })} />
              </div>
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">WhatsApp Principal *</label>
                <input required type="tel" className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white transition-all outline-none text-gray-900" placeholder="Ej: 18295551234" value={formData.telefono} onChange={e => setFormData({ ...formData, telefono: e.target.value.replace(/[^0-9]/g, '') })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">Teléfono Secundario (Opcional)</label>
              <input type="tel" className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white transition-all outline-none text-gray-900" placeholder="Ej: 18092224444" value={formData.telefonoSecundario} onChange={e => setFormData({ ...formData, telefonoSecundario: e.target.value.replace(/[^0-9]/g, '') })} />
            </div>
            {/* Campo de Email - Paso 1 */}
            <div className="md:col-span-2">
              <label className="block text-sm font-black text-gray-700 mb-2">Correo Electrónico *</label>
              <input type="email" className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white transition-all outline-none" placeholder="tu@email.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">Ubicación Completa (Opcional)</label>
              <textarea rows="3" className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white transition-all outline-none text-gray-900" placeholder="País, Estado/Provincia, Sector, Calle..." value={formData.ubicacion} onChange={e => setFormData({ ...formData, ubicacion: e.target.value })} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-500">
            {PLANS.map(plan => (
              <label key={plan.id} className={`flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all cursor-pointer ${formData.plan === plan.id ? 'border-blue-600 bg-blue-50 ring-4 ring-blue-50' : 'border-gray-100 hover:border-blue-200'}`}>
                <div className="flex items-center gap-4">
                  <input type="radio" name="plan" className="w-6 h-6 text-blue-600" checked={formData.plan === plan.id} onChange={() => setFormData({ ...formData, plan: plan.id })} />
                  <div>
                    <p className="font-black text-gray-900 text-lg">{plan.name}</p>
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">
                      {plan.premium > 0 ? `${plan.premium} ticket${plan.premium > 1 ? 's' : ''} sorteo premium + ` : ''}{plan.general} ticket{plan.general > 1 ? 's' : ''} sorteo general
                    </p>
                  </div>
                </div>
                <span className="font-black text-gray-900">{plan.price}</span>
              </label>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-gray-50 p-6 rounded-[2rem] space-y-4">
              <p className="font-black text-gray-700 text-center">¿Te enteraste por un referidor?</p>
              <div className="flex gap-4">
                {['Sí', 'No'].map(opt => (
                  <button key={opt} type="button" onClick={() => setFormData({ ...formData, referidor: opt })} className={`flex-1 py-4 rounded-2xl border-2 font-black transition-all ${formData.referidor === opt ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-200 text-gray-400 bg-white'}`}>
                    {opt}
                  </button>
                ))}
              </div>
              {formData.referidor === 'Sí' && (
                <input required type="text" className="w-full p-4 bg-white rounded-2xl border-2 border-blue-100 outline-none animate-in zoom-in" placeholder="Nombre de quien te refirió" value={formData.nombreReferidor} onChange={e => setFormData({ ...formData, nombreReferidor: e.target.value })} />
              )}
            </div>
            <div>
              <label className="block text-sm font-black text-gray-700 mb-2 text-center">Fuente de conexión</label>
              <select className="w-full p-5 bg-gray-50 rounded-2xl border-none outline-none font-bold text-gray-700 appearance-none text-center" value={formData.fuente} onChange={e => setFormData({ ...formData, fuente: e.target.value })}>
                <option value="">Selecciona una opción</option>
                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-in slide-in-from-right-8 duration-500">
            <div className="bg-blue-50 p-4 rounded-2xl flex items-start gap-3 mb-8">
              <AlertCircle size={20} className="text-blue-600 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800 leading-relaxed font-medium">
                Este <strong>tablero de tickets</strong> es para el sorteo del <strong>Premio Sorpresa</strong>, solo disponible para planes de apoyo Milla Extra y Milla de Impacto. Elige tus {selectedPlan.premium} números.
              </p>
            </div>
            {renderTicketGrid(120, 12, 'premium')}
          </div>
        )}

        {step === 5 && (
          <div className="animate-in slide-in-from-right-8 duration-500">
            <div className="bg-yellow-50 p-4 rounded-2xl flex items-start gap-3 mb-8 border border-yellow-100">
              <Info size={20} className="text-yellow-600 shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800 leading-relaxed font-medium">
                Este es el tablero de tickets general. Tienes {selectedPlan.general} números disponibles para los premios principales.
              </p>
            </div>
            {renderTicketGrid(2500, 10, 'general')}
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-gray-900 text-white p-8 rounded-[2.5rem] shadow-xl">
              <h4 className="text-center font-black text-xl mb-6">Resumen de Selección</h4>
              <div className="space-y-4">
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Plan Seleccionado</span>
                  <span className="font-black text-yellow-400">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Costo del Plan</span>
                  <span className="font-black text-blue-400">{selectedPlan.price}</span>
                </div>
                {selectedPlan.premium > 0 && (
                  <div className="space-y-2">
                    <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Tickets Premium (Sorteo Sorpresa)</span>
                    <div className="flex flex-wrap gap-2">
                      {formData.selectedPremium.map(id => (
                        <span key={id} className="bg-blue-600 px-3 py-1 rounded-full text-xs font-bold">{id.split('-')[1]}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Tickets Generales</span>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {formData.selectedGeneral.map(id => (
                      <span key={id} className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold">{id.split('-')[1]}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <p className="text-blue-100 text-xs font-black uppercase tracking-widest mb-2">Cuenta de Ahorros</p>
              <p className="text-2xl font-black mb-1">Banco Popular</p>
              <p className="text-2xl font-mono tracking-wider font-bold">0854243391</p>
              <div className="mt-6 pt-6 border-t border-blue-500/30 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase font-bold opacity-70">Titular</p>
                <p className="text-sm font-bold">Michael A. Eusebio</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold opacity-70">Cédula</p>
                <p className="text-sm font-bold">402-3402480-6</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold opacity-70">SWIFT</p>
                <p className="text-sm font-bold">BPDODOSX</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold opacity-70">País</p>
                <p className="text-sm font-bold">Rep. Dom.</p>
              </div>
            </div>
          </div>
            <div className="relative border-4 border-dashed border-gray-100 rounded-[2.5rem] p-12 text-center hover:bg-gray-50 transition-all group">
              <input
                required
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp" // <--- ESTO RESTRINGE A IMÁGENES
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={e => setFormData({ ...formData, comprobante: e.target.files[0] })}
              />
              {formData.comprobante ? (
                <div className="text-blue-600 font-black flex flex-col items-center gap-2">
                  <CheckCircle size={40} className="animate-bounce" />
                  <p className="text-sm">Archivo seleccionado: {formData.comprobante.name.substring(0, 20)}...</p>
                </div>
              ) : (
                <div className="text-gray-400 flex flex-col items-center gap-4">
                  <div className="bg-gray-100 p-4 rounded-full group-hover:scale-110 transition-transform">
                    <CreditCard size={32} />
                  </div>
                  <div>
                    <p className="font-black text-gray-600">Click para seleccionar archivo</p>
                    <p className="text-xs">JPG, PNG o PDF aceptados</p>
                  </div>
                </div>
              )}
            </div>
            {/* Campo de Comentario - Paso 7 */}
            <div className="mt-4">
              <label className="block text-sm font-black text-gray-700 mb-2">¿Por qué apoyas esta causa? (Opcional)</label>
              <textarea 
              rows="2" 
              className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white transition-all outline-none resize-none text-gray-900" 
              placeholder="Escribe un mensaje breve..." 
              value={formData.support_reason} 
              onChange={e => setFormData({ ...formData, support_reason: e.target.value })} 
            />
          </div>

            {/* Checkbox de Términos */}
            <div className="mt-8 p-6 bg-gray-50 rounded-3xl border border-gray-100">
              <label className="flex items-start gap-4 cursor-pointer group">
                <div className="relative flex items-center mt-1">
                  <input
                    required
                    type="checkbox"
                    className="peer h-6 w-6 cursor-pointer appearance-none rounded-md border-2 border-blue-200 checked:bg-blue-600 checked:border-blue-600 transition-all shadow-sm"
                    checked={formData.terms_accepted || false}
                    onChange={e => setFormData({ ...formData, terms_accepted: e.target.checked })}
                  />
                  <CheckCircle size={16} className="absolute left-1 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                </div>
                <span className="text-xs text-gray-600 leading-relaxed font-medium">
                  Acepto que mi contribución es una donación para apoyar la meta universitaria de Michael. Entiendo que los fondos no son reembolsables y que si no reclamo el premio en 48h se elegirá un nuevo ganador.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* PASO 8: ÉXITO */}
        {step === 8 && (
          <div className="text-center py-16 animate-in zoom-in duration-700">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <CheckCircle size={56} />
            </div>
            <h2 className="text-3xl font-black mb-4 text-gray-900 leading-tight">Tu participación quedó registrada 🎉</h2>
            <p className="text-gray-600 mb-10 leading-relaxed max-w-sm mx-auto font-medium">
              Gracias por apostar por el talento dominicano con discapacidad. En breve recibirás tu boleta por WhatsApp o correo.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-10 py-5 rounded-3xl font-black hover:bg-blue-700 shadow-2xl shadow-blue-200 transition-all hover:-translate-y-1"
            >
              Cerrar esta ventana
            </button>
          </div>
        )}

        {step > 0 && step < 8 && (
          <div className="mt-12 flex gap-4">
            <button type="button" onClick={handleBack} className="flex-1 py-5 px-6 rounded-3xl font-black text-gray-400 bg-gray-50 hover:bg-gray-100 transition-all">
              Anterior
            </button>
            {step === 7 ? (
              <button type="submit" disabled={!isStepValid() || loading} className={`flex-[2] py-5 px-6 rounded-3xl font-black text-white transition-all flex items-center justify-center gap-2 ${isStepValid() ? 'bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200' : 'bg-gray-200 cursor-not-allowed text-gray-400'}`}>
                {loading ? 'Procesando...' : 'Finalizar Registro'}
              </button>
            ) : (
              <button type="button" onClick={handleNext} className="flex-[2] py-5 px-6 rounded-3xl font-black text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 flex items-center justify-center gap-2">
                Continuar <ArrowRight size={20} />
              </button>
            )}
          </div>
        )}
      </form>
    </div>

    <div className="mt-8 text-gray-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
      <MapPin size={12} /> Michael Eusebio | Santo Domingo, RD
    </div>
  </div>
);
}