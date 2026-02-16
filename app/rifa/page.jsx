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
    selectedPremium: [],
    selectedGeneral: []
  });

  useEffect(() => {
    console.log(process.env.NEXT_PUBLIC_FIREBASE_API_KEY)
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
    const ticketsRef = collection(db, 'Millas-michael-rifa-tickets');
    const unsubscribe = onSnapshot(ticketsRef, (snapshot) => {
      const data = {};
      snapshot.forEach(doc => {
        data[doc.id] = doc.data();
      });
      setTicketsDB(data);
    }, (error) => {
      console.error("🔥 Error de permisos:", error.message);
    });
  return () => unsubscribe();
}, [user]);

const selectedPlan = PLANS.find(p => p.id === formData.plan);

const toggleTicket = (id, type) => {
  const field = type === 'premium' ? 'selectedPremium' : 'selectedGeneral';
  const max = type === 'premium' ? (selectedPlan?.premium || 0) : (selectedPlan?.general || 0);

  if (ticketsDB[id]?.status === 'sold') return;

  setFormData(prev => {
    const current = prev[field];
    if (current.includes(id)) {
      return { ...prev, [field]: current.filter(t => t !== id) };
    }
    if (current.length >= max) return prev;
    return { ...prev, [field]: [...current, id] };
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
    console.log("ejecutando función de envío");
    const submissionId = crypto.randomUUID();
    let comprobanteUrl = "";

    // --- PASO 1: Subir el archivo a Firebase Storage ---
    // Creamos una ruta única: comprobantes/ID_DEL_USUARIO/NOMBRE_ARCHIVO
    const storageRef = ref(storage, `comprobantes/${user.uid}/${submissionId}_${formData.comprobante.name}`);

    // Subimos el archivo físico
    console.log(" Iniciando carga de archivo...");
    const uploadResult = await uploadBytes(storageRef, formData.comprobante);
    console.log("archivo cargado");

    // Obtenemos la URL de descarga
    console.log("tratando de obtener url");
    comprobanteUrl = await getDownloadURL(uploadResult.ref);
    console.log("url obtenida");

    // --- PASO 2: Guardar todo en Firestore (incluyendo la URL) ---
    const allSelected = [...formData.selectedPremium, ...formData.selectedGeneral];

    await runTransaction(db, async (transaction) => {
      console.log("verificando disponiblidad de tickets");
      // Verificar disponibilidad de tickets (tu lógica actual)
      for (const tid of allSelected) {
        const tDocRef = doc(db, 'Millas-michael-rifa-tickets', tid);
        const tSnap = await transaction.get(tDocRef);
        if (tSnap.exists() && (tSnap.data().status === 'sold' || tSnap.data().status === 'reserved')) {
          throw new Error(`El ticket ${tid} ya no está disponible.`);
        }
      }

      // Marcar tickets como reservados
      for (const tid of allSelected) {
        const tDocRef = doc(db, 'Millas-michael-rifa-tickets', tid);
        transaction.set(tDocRef, { status: 'reserved', reservedBy: formData.nombre, timestamp: Date.now() });
      }

      // Guardar el registro con la URL REAL del comprobante
      const regRef = doc(db, 'registrations', submissionId); 

      // Creamos una copia de formData pero quitamos el objeto File pesado
      const { comprobante, ...restoDelForm } = formData;

      console.log("intentando cargar data");
      transaction.set(regRef, {
        //...restoDelForm,
        comprobanteUrl: comprobanteUrl, // <--- AQUÍ ESTÁ LA MAGIA
        owner_name: formData.nombre,
        "4_personal_id_last_digits": formData.cedula,
        phone1: formData.telefono,
        phone2: formData.telefonoSecundario || "None",
        owner_address: formData.ubicacion || "None",
        terms_accepted: formData.terms_accepted,
        created_at: new Date(),
        purchased_at: new Date(),
        reserved_at: new Date(),
        userId: user.uid,
        ticket_tipe: formData.selectedPremium.length > 0 ? "Premium" : "General",
        general_raffle_tickets: formData.selectedGeneral.map(id => parseInt(id.replace('general-', ''))),
        premium_raffle_tickets: formData.selectedPremium.map(id => parseInt(id.replace('premium-', ''))),
        status: "reserved",
        was_purchased: true,
      });
      console.log("data cargada a la db");
    });

    setStep(8); // ¡Éxito!
  } catch (err) { 
    console.error("🔥 Error al procesar:", err);
    alert(err.message || "Error al procesar la solicitud.");
  } finally {
    setLoading(false);
  }
}; 

const renderTicketGrid = (rows, cols, type) => {
  const isPremium = type === 'premium';
  const field = isPremium ? 'selectedPremium' : 'selectedGeneral';
  const limit = isPremium ? (selectedPlan?.premium || 0) : (selectedPlan?.general || 0);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h4 className={`text-xl font-black ${isPremium ? 'text-blue-700' : 'text-gray-800'}`}>
            Tablero de tickets {isPremium ? 'Premium' : 'General'}
          </h4>
          <p className="text-sm text-gray-500">
            Selecciona {limit} {limit === 1 ? 'número' : 'números'}
          </p>
        </div>
        <div className={`px-4 py-2 rounded-2xl text-sm font-black transition-all ${formData[field].length === limit ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
          {formData[field].length} / {limit}
        </div>
      </div>

      <div
        className="grid gap-1 overflow-x-auto pb-6 p-2 bg-gray-50 rounded-2xl border border-gray-100"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(32px, 1fr))` }}
      >
        {Array.from({ length: rows * cols }).map((_, i) => {
          const id = `${type}-${i + 1}`;
          const status = ticketsDB[id]?.status || 'available';
          const isSelected = formData[field].includes(id);

          let bgColor = 'bg-yellow-400 hover:scale-110';
          if (status === 'sold') bgColor = 'bg-red-500 opacity-80 cursor-not-allowed';
          if (isSelected) bgColor = 'bg-blue-600 ring-4 ring-blue-100 z-10';

          return (
            <button
              key={id}
              type="button"
              onClick={() => toggleTicket(id, type)}
              disabled={status === 'sold'}
              className={`w-full aspect-square text-[10px] sm:text-xs font-bold rounded-md flex items-center justify-center text-white transition-all shadow-sm ${bgColor}`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
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
          <PrizeCard number="1" name="iPhone 15 Plus" eligibility="Todos los planes" image="https://cdn.jiostore.online/v2/jmd-asp/jdprod/wrkr/products/pictures/item/free/resize-w:450/apple/493839337/0/jDXEAvENvS-IMHWPqFPhN-Apple-iPhone-15-Plus-512-GB-Blue-493839337-i-1-1200Wx1200H.jpeg" />
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
              <input required type="text" className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white transition-all outline-none" placeholder="Ej: Michael Eusebio" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">Últimos 4 dígitos de la cédula *</label>
                <input required type="text" maxLength="4" className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white transition-all outline-none" placeholder="1234" value={formData.cedula} onChange={e => setFormData({ ...formData, cedula: e.target.value.replace(/\D/g, '') })} />
              </div>
              <div>
                <label className="block text-sm font-black text-gray-700 mb-2">WhatsApp Principal *</label>
                <input required type="tel" className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white transition-all outline-none" placeholder="Ej: 18295551234" value={formData.telefono} onChange={e => setFormData({ ...formData, telefono: e.target.value.replace(/[^0-9]/g, '') })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">Teléfono Secundario (Opcional)</label>
              <input type="tel" className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white transition-all outline-none" placeholder="Ej: 18092224444" value={formData.telefonoSecundario} onChange={e => setFormData({ ...formData, telefonoSecundario: e.target.value.replace(/[^0-9]/g, '') })} />
            </div>
            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">Ubicación Completa (Opcional)</label>
              <textarea rows="3" className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white transition-all outline-none" placeholder="País, Estado/Provincia, Sector, Calle..." value={formData.ubicacion} onChange={e => setFormData({ ...formData, ubicacion: e.target.value })} />
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
            {renderTicketGrid(10, 10, 'premium')}
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
            {renderTicketGrid(12, 25, 'general')}
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
              <p className="text-blue-100 text-xs font-black uppercase tracking-widest mb-2">Cuenta de Ahorros</p>
              <p className="text-2xl font-black mb-1">Banreservas</p>
              <p className="text-xl font-mono tracking-tighter opacity-90">960-637255-8</p>
              <div className="mt-4 pt-4 border-t border-blue-500/30">
                <p className="text-[10px] uppercase font-bold opacity-70">Titular</p>
                <p className="font-bold">Michael Eusebio</p>
              </div>
            </div>

            <div className="relative border-4 border-dashed border-gray-100 rounded-[2.5rem] p-12 text-center hover:bg-gray-50 transition-all group">
              <input
                required
                type="file"
                accept="image/*,.pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={e => setFormData({ ...formData, comprobante: e.target.files[0] })}
              />
              {formData.comprobante ? (
                <div className="text-blue-600 font-black flex flex-col items-center gap-2">
                  <CheckCircle size={40} className="animate-bounce" />
                  <p>{formData.comprobante.name}</p>
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
            <h2 className="text-3xl font-black text-gray-900 mb-4 leading-tight">Tu participación quedó registrada</h2>
            <p className="text-gray-600 mb-10 leading-relaxed max-w-sm mx-auto font-medium">
              Gracias por apoyar el talento dominicano. En breve recibirás tu boleta por WhatsApp o correo.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-10 py-5 rounded-3xl font-black hover:bg-blue-700 transition-all shadow-xl hover:shadow-blue-200"
            >
              Cerrar esta ventana
            </button>
          </div>
        )}


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