"use client"; 
import React, { useState, useEffect } from 'react';
import { auth, db, appId } from '@/lib/FirebaseConfig';
import { signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, doc, updateDoc, Timestamp } from 'firebase/firestore';
import * as actions from '@/lib/apis/SorteoActions';
import { 
  Trophy, 
  Accessibility, 
  Smartphone, 
  Tablet, 
  Headphones, 
  Gift, 
  Play, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  Coins,
  History,
  X,
  PartyPopper,
  MessageSquare,
  Star
} from 'lucide-react';


// --- CONSTANTES ---
const PREMIOS = [
  { id: 'top1', nombre: 'iPhone 16 Pro', icon: <Smartphone />, highTicket: false },
  { id: 'top2', nombre: 'iPad 10th Gen', icon: <Tablet />, highTicket: false },
  { id: 'top3', nombre: 'AirPods 4', icon: <Headphones />, highTicket: false },
  { id: 'top4', nombre: 'Premio Sorpresa', icon: <Gift />, highTicket: true },
];


const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#ec4899', '#06b6d4', '#facc15'];

// --- COMPONENTES AUXILIARES ---

const CountdownDisplay = ({ expirationDate }) => {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const exp = expirationDate?.toDate ? expirationDate.toDate().getTime() : new Date(expirationDate).getTime();
      const dist = exp - now;
      if (dist < 0) {
        setTimeLeft("EXPIRADO");
        clearInterval(timer);
      } else {
        const h = Math.floor(dist / (1000 * 60 * 60));
        const m = Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((dist % (1000 * 60)) / 1000);
        setTimeLeft(`${h}h ${m}m ${s}s`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [expirationDate]);
  return <span>{timeLeft}</span>;
};

const MegaConfetti = () => {
  const [pieces, setPieces] = useState([]);
  useEffect(() => {
    const newPieces = Array.from({ length: 300 }).map((_, i) => ({
      id: i, 
      left: Math.random() * 100, 
      delay: Math.random() * 4,
      duration: 4 + Math.random() * 5, 
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 15 + Math.random() * 30,
      rotation: Math.random() * 360,
      type: Math.random() > 0.4 ? 'rect' : 'circle',
      drift: (Math.random() - 0.5) * 200
    }));
    setPieces(newPieces);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[9999]">
      {pieces.map(p => (
        <div key={p.id} className={`absolute top-[-50px] animate-fall ${p.type === 'circle' ? 'rounded-full' : 'rounded-sm'}`}
          style={{ 
            left: `${p.left}%`, 
            backgroundColor: p.color, 
            width: `${p.size}px`, 
            height: p.type === 'circle' ? `${p.size}px` : `${p.size / 1.5}px`, 
            animationDelay: `${p.delay}s`, 
            animationDuration: `${p.duration}s`,
            '--drift': `${p.drift}px`,
            '--rotation': `${p.rotation}deg`
          }} 
        />
      ))}
      <style>{`
        @keyframes fall { 
            0% { transform: translateY(0) translateX(0) rotate(0deg) scale(0); opacity: 0; } 
            15% { opacity: 1; scale: 1.2; }
            100% { transform: translateY(110vh) translateX(var(--drift)) rotate(calc(var(--rotation) + 720deg)) scale(0.5); opacity: 0; } 
        } 
        .animate-fall { 
          animation-name: fall; 
          animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94); 
          animation-iteration-count: infinite; 
        }
      `}</style>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home'); 
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPremioId, setSelectedPremioId] = useState(null);
  const [ganadorActual, setGanadorActual] = useState(null);
  const [winnersList, setWinnersList] = useState([]);
  const [congratsStatus, setCongratsStatus] = useState(null);

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
    const winnersCollection = collection(db, 'artifacts', appId, 'public', 'data', 'winners');
    return onSnapshot(winnersCollection, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWinnersList(data);
    }, (err) => console.error(err));
  }, [user]);

  // Lógica de disponibilidad: Si el premio ya existe en cualquier estado en la BD, no está disponible
  const premiosDisponibles = PREMIOS.filter(p => {
    return !winnersList.some(w => w.premioId === p.id);
  });

    const startRaffle = async () => {
    const premioObj = PREMIOS.find(p => p.id === selectedPremioId);
    if (!premioObj) return;
    
    setModalOpen(false);
    setView('spinning');

    try {
        // 1. Determinar qué colección usar según el premio
        const coleccionTickets = premioObj.highTicket ? 'tickets_sold_premium' : 'tickets_sold_general';
        const coleccionRegistros = premioObj.highTicket ? 'premium_registrations' : 'general_registrations';

        // 2. Traer tickets reales desde el backend
        const tickets = await actions.getTicketsFrom(coleccionTickets);

        // 3. Elegir ganador (Lógica matemática)
        const ganadorTicket = await actions.elegirGanador(tickets, premioObj.nombre);

        if (!ganadorTicket) {
        alert("No hay boletos disponibles para este sorteo.");
        setView('home');
        return;
        }

        // 4. Buscar los datos personales del ganador
        const datosPersonales = await actions.expandirDatosGanador(ganadorTicket, coleccionRegistros);

        if (!datosPersonales) {
        alert("Error al recuperar los datos del ganador.");
        setView('home');
        return;
        }

        // 5. Preparar objeto para Firebase (Igual que antes pero con datos reales)
        const expDate = new Date();
        expDate.setHours(expDate.getHours() + 48);

        const docData = {
        userName: datosPersonales.owner_name,
        owner_numbers: datosPersonales.general_raffle_tickets || datosPersonales.premium_raffle_tickets,
        user_id: datosPersonales.user_id,
        ticketNumber: ganadorTicket.id,
        phone1: ganadorTicket.phone1,
        premio: premioObj.nombre,
        premioId: premioObj.id,
        PlanMilla: {1: 'Milla Inicial', 3: 'Milla Impulso', 5: 'Milla Impacto', 10: 'Milla Extra'}[(premioObj.highTicket ? datosPersonales.premium_raffle_tickets : datosPersonales.general_raffle_tickets)?.length] || 'no se pudo determinar',
        TipoRifa: premioObj.highTicket ? "Premium" : "General",
        status: 'Pendiente',
        expiration_date: Timestamp.fromDate(expDate),
        timestamp: Timestamp.now()
        };
        
        // Simular un pequeño delay para la animación de "spinning" antes de mostrar resultado
        setTimeout(() => {
        setView('result');
        }, 2000);

        // 6. Guardar en la colección de 'winners'
        const result = await actions.saveWinner(docData);
        setGanadorActual({ id: result.id, ...docData });

    } catch (error) {
        console.error("Error durante el sorteo:", error);
        alert("Hubo un problema técnico al realizar el sorteo.");
        setView('home');
    }
    };

  const updateStatus = async (newStatus) => {
    if (!ganadorActual) return;
    const winnerRef = doc(db, 'artifacts', appId, 'public', 'data', 'winners', ganadorActual.id);
    await updateDoc(winnerRef, { status: newStatus });
    
    if (newStatus === 'Pendiente') {
        setGanadorActual(null);
        setView('home');
    } else {
        setCongratsStatus(newStatus);
        setView('congrats');
    }
  };

  if (view === 'home') {
    const activeWinners = winnersList.filter(w => w.status === 'Pendiente');

    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col md:flex-row overflow-hidden font-sans">
        <aside className="w-full md:w-80 bg-slate-950/90 border-r border-white/5 p-6 overflow-y-auto z-20 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <History className="text-white" size={20} />
            </div>
            <div>
              <span className="font-black text-[10px] uppercase tracking-widest text-blue-500 block">Sorteos</span>
              <span className="font-black text-xs uppercase tracking-widest text-white block">En Espera</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {activeWinners.length === 0 ? (
                <div className="text-center py-16 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
                    <Trophy className="mx-auto mb-4 opacity-5" size={48} />
                    <p className="text-[10px] font-black uppercase opacity-20 tracking-tighter">Sin pendientes</p>
                </div>
            ) : (
                activeWinners.map(w => (
                    <button 
                        key={w.id}
                        onClick={() => { setGanadorActual(w); setView('status'); }}
                        className="w-full text-left p-6 rounded-[2rem] bg-slate-800/40 border border-white/5 hover:border-blue-500/50 hover:bg-slate-800 transition-all group relative"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider">{w.premio}</span>
                            <div className="bg-rose-500/20 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                              <Clock size={12} className="text-rose-500" />
                            </div>
                        </div>
                        <p className="font-black text-xl leading-none mb-3 group-hover:text-blue-400 transition-colors">{w.userName}</p>
                        <div className="text-[11px] font-mono font-bold text-rose-400 bg-rose-500/10 w-full py-2 rounded-xl text-center border border-rose-500/20">
                             <CountdownDisplay expirationDate={w.expiration_date} />
                        </div>
                    </button>
                ))
            )}
          </div>
        </aside>

        <main className="flex-1 relative flex flex-col items-center p-6 overflow-hidden bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black">
            <div className="w-full flex justify-between items-center mb-8 max-w-5xl z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-xl">
                        <Accessibility className="text-slate-950" size={20} />
                    </div>
                    <span className="font-black text-sm tracking-tighter uppercase italic text-white/80">Menos Millas Universitarias</span>
                </div>
                <div className="flex items-center gap-4 bg-white/5 px-5 py-2.5 rounded-full border border-white/10 backdrop-blur-md">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                    <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest">En Vivo</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center w-full max-w-5xl z-10">
                <div className="mb-4 inline-block px-6 py-2 bg-blue-600/10 border border-blue-600/20 rounded-full">
                   <span className="text-xs font-black uppercase tracking-[0.3em] text-blue-400">Gran Rifa Michael</span>
                </div>
                <h1 className="text-7xl md:text-9xl font-black mb-12 leading-none tracking-tighter uppercase italic drop-shadow-2xl">
                    ¿SERÁS TÚ EL <span className="text-blue-500">GANADOR?</span>
                </h1>
                
                <div className="relative mb-16">
                    <div className="absolute inset-0 bg-blue-600/30 blur-[160px] rounded-full scale-125"></div>
                    <div className="relative w-72 h-72 md:w-[500px] md:h-[500px] rounded-full border-[20px] border-slate-800 animate-[spin_80s_linear_infinite] overflow-hidden shadow-[0_0_100px_rgba(59,130,246,0.3)]">
                        <svg viewBox="0 0 100 100" className="w-full h-full opacity-90">
                            {[...Array(24)].map((_, i) => (
                                <path key={i} d="M50 50 L50 0 A50 50 0 0 1 62.9 1.7 Z" fill={COLORS[i % COLORS.length]} transform={`rotate(${i * 15} 50 50)`} />
                            ))}
                        </svg>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-28 h-28 md:w-40 md:h-40 bg-white rounded-[2.5rem] flex items-center justify-center shadow-2xl border-8 border-slate-900 rotate-[-12deg]">
                            <Trophy className="text-blue-600 w-14 h-14 md:w-20 md:h-20" />
                        </div>
                    </div>
                </div>

                <button 
                    onClick={() => setModalOpen(true)}
                    className="group px-20 py-10 bg-blue-600 hover:bg-blue-500 rounded-[3rem] font-black text-4xl transition-all active:scale-95 shadow-[0_20px_50px_rgba(59,130,246,0.4)] flex items-center gap-6"
                >
                    COMENZAR <Play fill="currentColor" size={40} className="group-hover:translate-x-2 transition-transform" />
                </button>
            </div>

            {modalOpen && (
                <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-3xl z-50 flex items-center justify-center p-4">
                    <div role="dialog" className="bg-slate-900 border border-white/10 w-full max-w-xl rounded-[4rem] p-12 shadow-2xl animate-in zoom-in-95 duration-300">
                        <h2 className="text-4xl font-black mb-10 text-center uppercase tracking-tighter italic">Selecciona el Premio</h2>
                        
                        <div className="flex flex-col gap-4 mb-12">
                            {premiosDisponibles.length > 0 ? (
                                premiosDisponibles.map((p, index) => (
                                    <label 
                                        key={p.id} 
                                        className={`group flex items-center p-6 rounded-[2rem] border-2 transition-all cursor-pointer ${selectedPremioId === p.id ? 'border-blue-500 bg-blue-500/10 shadow-lg scale-[1.02]' : 'border-slate-800 bg-slate-800/30 hover:border-slate-600'}`}
                                    >
                                        <input 
                                            type="radio" 
                                            name="premio" 
                                            className="w-6 h-6 mr-6 accent-blue-500" 
                                            autoFocus={index === 0}
                                            checked={selectedPremioId === p.id}
                                            onChange={() => setSelectedPremioId(p.id)} 
                                        />
                                        <div className={`p-4 rounded-2xl mr-6 ${p.highTicket ? 'bg-amber-500 text-amber-950' : 'bg-blue-600 text-white'}`}>{p.icon}</div>
                                        <div className="flex-1">
                                            <p className="font-black text-xl">{p.nombre}</p>
                                            {p.highTicket && <p className="text-[10px] font-black uppercase text-amber-500 tracking-widest">Filtro VIP (Milla Extra/Impacto)</p>}
                                        </div>
                                    </label>
                                ))
                            ) : (
                                <div className="text-center py-10">
                                    <Trophy className="mx-auto mb-4 text-slate-700" size={48} />
                                    <p className="font-black text-xl uppercase italic">¡Sorteos Completados!</p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => { setModalOpen(false); setSelectedPremioId(null); }} className="flex-1 py-6 font-black text-slate-500 hover:text-white transition-colors uppercase tracking-[0.2em] text-xs">Cancelar</button>
                            <button 
                                onClick={startRaffle} 
                                disabled={!selectedPremioId || premiosDisponibles.length === 0} 
                                className="flex-[2] py-6 bg-blue-600 disabled:opacity-20 disabled:cursor-not-allowed rounded-[2rem] font-black text-xl transition-all shadow-xl shadow-blue-600/30 active:scale-95"
                            >
                                CONTINUAR
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
      </div>
    );
  }

  if (view === 'spinning') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center overflow-hidden">
        <div className="relative mb-20">
            <div className="absolute inset-0 bg-blue-600/50 blur-[180px] animate-pulse"></div>
            <div className="w-[450px] h-[450px] md:w-[650px] md:h-[650px] border-[25px] border-slate-900 rounded-full animate-[spin_0.3s_linear_infinite] overflow-hidden shadow-[0_0_150px_rgba(59,130,246,0.6)] scale-90 md:scale-95 transition-transform duration-500">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    {[...Array(32)].map((_, i) => (
                        <path key={i} d="M50 50 L50 0 A50 50 0 0 1 59.7 1.1 Z" fill={COLORS[i % COLORS.length]} transform={`rotate(${i * 11.25} 50 50)`} />
                    ))}
                </svg>
            </div>
            <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 text-white drop-shadow-2xl z-10">
                <div className="w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-t-[60px] border-t-white drop-shadow-2xl animate-bounce"></div>
            </div>
        </div>
        <h2 className="text-6xl md:text-8xl font-black tracking-tighter animate-pulse uppercase italic">
            DEFINIENDO DESTINO...
        </h2>
      </div>
    );
  }

  if (view === 'result' && ganadorActual) {
    const isSpecial = PREMIOS.find(p => p.id === ganadorActual.premioId)?.highTicket;
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-white transition-all duration-1000 ${isSpecial ? 'bg-amber-950' : 'bg-slate-900'}`}>
        <MegaConfetti />
        <div className="max-w-3xl w-full bg-slate-900/90 backdrop-blur-3xl p-16 rounded-[4rem] border border-white/10 shadow-[0_0_150px_rgba(0,0,0,1)] text-center relative z-10 animate-in zoom-in-90 duration-700">
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white p-6 rounded-[2.5rem] shadow-2xl animate-bounce">
                <PartyPopper className="text-blue-600" size={60} />
            </div>
            
            <h3 className="text-3xl md:text-4xl font-black mb-2 text-blue-400 uppercase tracking-widest italic animate-pulse">¡FELICIDADES!</h3>
            <h2 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-none uppercase italic">
                {ganadorActual.userName}
            </h2>
            
            <div className="flex flex-col items-center gap-6 mb-12">
                <div className={`inline-flex items-center gap-4 px-8 py-4 rounded-3xl border-2 shadow-2xl ${isSpecial ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'bg-blue-500/20 border-blue-500/50 text-blue-400'}`}>
                    <Star fill="currentColor" size={24} />
                    <span className="font-black text-xl uppercase tracking-tighter">Aportó {ganadorActual.PlanMilla?.toLocaleString()} Millas</span>
                    <Star fill="currentColor" size={24} />
                </div>
                
                <div className="bg-white/5 px-10 py-6 rounded-[2rem] border border-white/10 w-full flex items-center justify-between">
                    <div className="text-left">
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Premio Ganado</p>
                        <p className="font-black text-2xl">{ganadorActual.premio}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Boleto</p>
                        <p className="font-mono font-black text-3xl text-white">#{ganadorActual.ticketNumber}</p>
                    </div>
                </div>
            </div>

            <button onClick={() => setView('status')} className="w-full py-8 bg-blue-600 hover:bg-blue-500 rounded-[2.5rem] font-black text-2xl flex items-center justify-center gap-6 transition-all shadow-2xl shadow-blue-600/40 group active:scale-95">
                GESTIONAR ENTREGA <ArrowRight size={32} className="group-hover:translate-x-4 transition-transform" />
            </button>
        </div>
      </div>
    );
  }

  if (view === 'status' && ganadorActual) {
    // Lista exacta de 4 estados según lo solicitado
    const statusOptions = [
        { id: 'Dispositivo', label: `ACEPTO DISPOSITIVO (${ganadorActual.premio})`, icon: <Smartphone className="text-emerald-500" /> },
        { id: 'Dinero', label: 'ACEPTO EFECTIVO EQUIVALENTE', icon: <Coins className="text-blue-500" /> },
        { id: 'Fondo', label: 'ACEPTO MANTENERLO EN EL FONDO', icon: <PartyPopper className="text-amber-500" /> },
        { id: 'Pendiente', label: 'PENDIENTE DE CONFIRMACIÓN', icon: <Clock className="text-rose-500" /> }
    ];

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
            <button 
                onClick={() => setView('home')} 
                className="absolute top-12 right-12 p-5 bg-slate-900 border border-white/10 rounded-full hover:bg-slate-800 transition-all z-50"
            >
                <X size={32} />
            </button>

            <div className="max-w-2xl w-full bg-slate-900 rounded-[4rem] p-12 border border-white/10 shadow-2xl relative z-10">
                <div className="mb-10 text-center">
                    <h3 className="text-4xl font-black mb-2 uppercase italic">{ganadorActual.userName}</h3>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-8">Gestión de Ganador</p>
                    
                    <a href={`https://wa.me/1${ganadorActual.phone1}`} target="_blank"
                        className="w-full mb-8 flex items-center justify-center gap-4 py-6 bg-green-500/10 hover:bg-green-500/20 rounded-[2rem] border border-green-500/20 transition-all font-black text-green-400 uppercase tracking-widest group">
                        <MessageSquare size={24} />
                        Contactar por WhatsApp
                    </a>
                    <div className="h-px bg-white/10 w-full mb-8"></div>
                </div>

                <div className="space-y-4">
                    {statusOptions.map((opt) => (
                        <button 
                            key={opt.id}
                            onClick={() => updateStatus(opt.id)}
                            className="w-full flex items-center p-6 rounded-[2rem] border-2 border-transparent bg-slate-800/40 hover:bg-slate-800 hover:border-slate-700 transition-all active:scale-95"
                        >
                            <div className="mr-6 p-4 bg-slate-950 rounded-2xl shadow-inner">{opt.icon}</div>
                            <span className="font-black text-lg uppercase text-left tracking-tighter">{opt.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
  }

  if (view === 'congrats') {
    const messages = {
        'Dispositivo': '¡EQUIPO LISTO PARA ENTREGA! 📱',
        'Dinero': '¡EFECTIVO CONFIRMADO! 💵',
        'Fondo': '¡CONTRIBUCIÓN AL FONDO REGISTRADA! 🏆'
    };
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center overflow-hidden">
            <MegaConfetti />
            <div className="z-10 animate-in zoom-in duration-700">
                <div className="w-40 h-40 bg-emerald-500 rounded-[3rem] mx-auto flex items-center justify-center shadow-[0_0_100px_rgba(16,185,129,0.5)] mb-10 rotate-12 animate-bounce">
                    <CheckCircle size={80} className="text-white" />
                </div>
                <h2 className="text-7xl md:text-9xl font-black mb-4 uppercase italic">¡REGISTRADO!</h2>
                <p className="text-3xl font-bold text-emerald-400 mb-16">{messages[congratsStatus]}</p>
                <button 
                    onClick={() => { setView('home'); setCongratsStatus(null); setGanadorActual(null); }}
                    className="px-16 py-8 bg-white text-slate-950 rounded-[2.5rem] font-black text-xl hover:scale-110 active:scale-90 transition-all shadow-2xl flex items-center gap-4 mx-auto"
                >
                    REGRESAR AL INICIO <ArrowRight size={28} />
                </button>
            </div>
        </div>
    );
  }

  return null;
}