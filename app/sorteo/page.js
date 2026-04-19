"use client";
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/sitebar';
import RaffleModal from '@/components/RaffleModal';
import InitScreen from "@/components/InitScreen";
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


    const [sidebarOpen, setSidebarOpen] = useState(false); // Empezamos cerrado en móvil
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
                PlanMilla: { 1: 'Milla Inicial', 3: 'Milla Impulso', 5: 'Milla Impacto', 10: 'Milla Extra' }[(premioObj.highTicket ? datosPersonales.premium_raffle_tickets : datosPersonales.general_raffle_tickets)?.length] || 'no se pudo determinar',
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
          <div className="h-screen w-screen bg-slate-950 flex overflow-hidden text-white relative">
            <Sidebar 
              sidebarOpen={sidebarOpen} 
              setSidebarOpen={setSidebarOpen} 
              activeWinners={activeWinners} 
              setGanadorActual={setGanadorActual} 
              setView={setView} 
            />
            <main className="flex-1 h-full flex flex-col relative overflow-hidden bg-slate-950">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 pointer-events-none"></div>
                
                <InitScreen onStart={() => setModalOpen(true)} />
 
                <RaffleModal 
                isOpen={modalOpen} 
                onClose={() => setModalOpen(false)} 
                premios={premiosDisponibles} 
                selectedId={selectedPremioId} 
                onSelect={setSelectedPremioId} 
                onContinue={startRaffle} 
                />
            </main>
            </div>
        );
    }

if (view === 'spinning') {
    return (
        <div className="h-screen w-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 overflow-hidden">
            {/* Contenedor de la Ruleta */}
            <div className="relative mb-12 flex flex-col items-center justify-center">
                {/* El resplandor de fondo */}
                <div className="absolute inset-0 bg-blue-600/30 blur-[120px] animate-pulse"></div>
                {/* El marcador superior (triangulito) */}
                <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 z-20">
                    <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-white drop-shadow-2xl animate-bounce"></div>
                </div>

                {/* La Ruleta: Ajustada a la altura de la pantalla (vh) */}
                <div className="relative w-[45vh] h-[45vh] max-w-[300px] max-h-[300px] md:max-w-[500px] md:max-h-[500px]">
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_30px_rgba(37,99,235,0.3)] animate-spin-slow">
                        {[...Array(32)].map((_, i) => (
                            <path
                                key={i}
                                d="M50 50 L50 0 A50 50 0 0 1 59.7 1.1 Z"
                                fill={COLORS[i % COLORS.length]}
                                transform={`rotate(${i * 11.25} 50 50)`}
                            />
                        ))}
                    </svg>
                </div>
            </div>

            {/* Texto de carga: Tamaño controlado y centrado */}
            <h2 className="text-4xl md:text-7xl font-black tracking-tighter animate-pulse uppercase italic text-center leading-none">
                DEFINIENDO <br className="md:hidden" /> <span className="text-blue-500">DESTINO...</span>
            </h2>
        </div>
    );
}

if (view === 'result' && ganadorActual) {
    const isSpecial = PREMIOS.find(p => p.id === ganadorActual.premioId)?.highTicket;

    return (
        <div className={`h-screen w-screen flex flex-col items-center justify-center p-4 md:p-6 text-white transition-all duration-1000 ${isSpecial ? 'bg-amber-950' : 'bg-slate-900'} overflow-hidden`}>
            <MegaConfetti />

            {/* CARD PRINCIPAL: Ajustamos el ancho máximo y padding responsivo */}
            <div className="max-w-2xl w-full bg-slate-900/90 backdrop-blur-3xl p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] text-center relative z-10 animate-in zoom-in-95 duration-700 flex flex-col gap-4">

                {/* ICONO SUPERIOR: Más pequeño en móvil */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white p-4 md:p-5 rounded-[2rem] shadow-2xl animate-bounce">
                    <PartyPopper className="text-blue-600" size={40} />
                </div>

                <div className="mt-4">
                    <h3 className="text-xl md:text-2xl font-black mb-1 text-blue-400 uppercase tracking-widest italic animate-pulse">¡FELICIDADES!</h3>
                    {/* NOMBRE: Ajustado para que no se corte en móviles pequeños */}
                    <h2 className="text-4xl md:text-7xl font-black mb-2 tracking-tighter leading-none uppercase italic break-words">
                        {ganadorActual.userName}
                    </h2>
                </div>

                {/* DISTINTIVO DE MILLAS: Flex-wrap para que no se desborde */}
                <div className="flex justify-center">
                    <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl border-2 shadow-xl ${isSpecial ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'bg-blue-500/20 border-blue-500/50 text-blue-400'}`}>
                        <Star fill="currentColor" size={18} />
                        <span className="font-black text-base md:text-lg uppercase">Aportó {ganadorActual.PlanMilla?.toLocaleString()} </span>
                        <Star fill="currentColor" size={18} />
                    </div>
                </div>

                {/* LA "TABLA" RESPONSIVA (GRID) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full mt-2">
                    {/* Caja Izquierda: Premio */}
                    <div className="bg-white/5 p-4 md:p-6 rounded-[1.5rem] border border-white/10 flex flex-col items-center md:items-start justify-center">
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Premio Ganado</p>
                        <p className="font-black text-xl md:text-2xl text-center md:text-left leading-tight">{ganadorActual.premio}</p>
                    </div>

                    {/* Caja Derecha: Boleto */}
                    <div className="bg-white/5 p-4 md:p-6 rounded-[1.5rem] border border-white/10 flex flex-col items-center md:items-end justify-center">
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Boleto</p>
                        <p className="font-mono font-black text-3xl md:text-4xl text-white">#{ganadorActual.ticketNumber}</p>
                    </div>
                </div>

                {/* BOTÓN: Ocupa el ancho completo y ajusta su tamaño */}
                <button
                    onClick={() => setView('status')}
                    className="w-full mt-2 py-4 md:py-5 bg-blue-600 hover:bg-blue-500 rounded-[1.5rem] md:rounded-[2rem] font-black text-xl md:text-2xl flex items-center justify-center gap-4 transition-all shadow-2xl shadow-blue-600/40 group active:scale-95"
                >
                    GESTIONAR ENTREGA
                    <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                </button>
            </div>
        </div>
    );
}

if (view === 'status' && ganadorActual) {
    const statusOptions = [
        { id: 'Dispositivo', label: `ACEPTO DISPOSITIVO (${ganadorActual.premio})`, icon: <Smartphone className="text-emerald-500" /> },
        { id: 'Dinero', label: 'ACEPTO EFECTIVO EQUIVALENTE', icon: <Coins className="text-blue-500" /> },
        { id: 'Fondo', label: 'ACEPTO MANTENERLO EN EL FONDO', icon: <PartyPopper className="text-amber-500" /> },
        { id: 'Pendiente', label: 'PENDIENTE DE CONFIRMACIÓN', icon: <Clock className="text-rose-500" /> }
    ];

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 md:p-6 text-white relative overflow-hidden">
            {/* BOTÓN CERRAR: Reposicionado para que no se salga en móviles */}
            <button
                onClick={() => setView('home')}
                className="absolute top-4 right-4 md:top-8 md:right-8 p-3 md:p-5 bg-slate-900 border border-white/10 rounded-full hover:bg-slate-800 transition-all z-50 shadow-xl"
            >
                <X size={24} className="md:w-8 md:h-8" />
            </button>

            {/* CARD PRINCIPAL: max-h-[90vh] y overflow-y-auto para evitar que se corte */}
            <div className="max-w-2xl w-full bg-slate-900 rounded-[2rem] md:rounded-[4rem] p-6 md:p-12 border border-white/10 shadow-2xl relative z-10 flex flex-col max-h-[95vh] md:max-h-none overflow-y-auto custom-scrollbar">

                <div className="mb-6 md:mb-10 text-center shrink-0">
                    <h3 className="text-3xl md:text-4xl font-black mb-1 uppercase italic break-words">{ganadorActual.userName}</h3>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] md:text-sm mb-6">Gestión de Ganador</p>

                    {/* BOTÓN WHATSAPP: Más compacto en móvil */}
                    <a href={`https://wa.me/1${ganadorActual.phone1}`} target="_blank"
                        className="w-full mb-6 flex items-center justify-center gap-3 py-4 md:py-6 bg-green-500/10 hover:bg-green-500/20 rounded-[1.5rem] md:rounded-[2rem] border border-green-500/20 transition-all font-black text-green-400 uppercase tracking-widest text-xs md:text-base group">
                        <MessageSquare size={20} className="md:w-6 md:h-6" />
                        Contactar por WhatsApp
                    </a>
                    <div className="h-px bg-white/10 w-full"></div>
                </div>

                {/* LISTA DE ESTADOS: Espaciado inteligente */}
                <div className="space-y-3 md:space-y-4 overflow-visible">
                    {statusOptions.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => updateStatus(opt.id)}
                            className="w-full flex items-center p-3 md:p-5 rounded-[1.5rem] md:rounded-[2rem] border-2 border-transparent bg-slate-800/40 hover:bg-slate-800 hover:border-slate-700 transition-all active:scale-95 text-left group"
                        >
                            {/* Iconos: Más pequeños en móvil para ahorrar espacio */}
                            <div className="mr-4 md:mr-6 p-3 md:p-4 bg-slate-950 rounded-xl md:rounded-2xl shadow-inner shrink-0 group-hover:scale-110 transition-transform">
                                {React.cloneElement(opt.icon, { size: 20, className: opt.icon.props.className + " md:w-7 md:h-7" })}
                            </div>
                            <span className="font-black text-sm md:text-lg uppercase tracking-tighter leading-tight">
                                {opt.label}
                            </span>
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
        <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center p-4 md:p-6 text-white text-center overflow-hidden relative">
            <MegaConfetti />

            <div className="z-10 animate-in zoom-in duration-700 w-full max-w-4xl flex flex-col items-center">

                {/* ICONO DE CHECK: Más pequeño en móvil, gigante en PC */}
                <div className="w-24 h-24 md:w-40 md:h-40 bg-emerald-500 rounded-[2rem] md:rounded-[3rem] mx-auto flex items-center justify-center shadow-[0_0_80px_rgba(16,185,129,0.4)] mb-6 md:mb-10 rotate-12 animate-bounce shrink-0">
                    <CheckCircle className="text-white w-12 h-12 md:w-20 md:h-20" />
                </div>

                {/* TÍTULO: Bajamos de 7xl a 5xl en móvil para que no se corte */}
                <h2 className="text-5xl md:text-9xl font-black mb-2 md:mb-4 uppercase italic tracking-tighter leading-none">
                    ¡REGISTRADO!
                </h2>

                {/* MENSAJE: Ajustado para legibilidad máxima */}
                <p className="text-xl md:text-3xl font-bold text-emerald-400 mb-10 md:mb-16 max-w-prose px-4">
                    {messages[congratsStatus]}
                </p>

                {/* BOTÓN DE REGRESO: Ancho completo en móvil, tamaño fijo en PC */}
                <button
                    onClick={() => { setView('home'); setCongratsStatus(null); setGanadorActual(null); }}
                    className="w-full md:w-auto px-10 py-5 md:px-16 md:py-8 bg-white text-slate-950 rounded-[1.5rem] md:rounded-[2.5rem] font-black text-lg md:text-xl hover:scale-110 active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-4 mx-auto group"
                >
                    REGRESAR AL INICIO
                    <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform md:w-7 md:h-7" />
                </button>
            </div>
        </div>
    );
}


return null;
}