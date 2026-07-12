'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  ArrowRight, 
  Sparkles,
  Play
} from 'lucide-react';
import Link from 'next/link';

// --- CONSTANTES ---
const EVENT_DATE = new Date('2026-08-20T19:00:00-04:00'); // 20 de Agosto de 2026 (7:00 PM local)

const getPricingDetails = (date = new Date()) => {
  const earlyBirdEnd = new Date('2026-07-18T23:59:59-04:00');
  const regularEnd = new Date('2026-08-12T23:59:59-04:00'); // Hasta 8 días antes del evento (última semana empieza el 13 de agosto)
  
  if (date <= earlyBirdEnd) {
    return { price: 1800, label: 'Early Bird', phase: 'early_bird' };
  } else if (date <= regularEnd) {
    return { price: 3000, label: 'Precio Regular', phase: 'regular' };
  } else {
    return { price: 4000, label: 'Última Semana / Puerta', phase: 'puerta' };
  }
};

export default function TechEventPage() {
  // Estados para contadores y precios
  const [timeLeftEvent, setTimeLeftEvent] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [pricePhase, setPricePhase] = useState('early_bird');
  const [openFaq, setOpenFaq] = useState(null);

  // Calcular precio y cuenta regresiva
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      
      // Validar precio
      const details = getPricingDetails(now);
      setPricePhase(details.phase);

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

  return (
    <div className="min-h-screen bg-[#090909] text-slate-100 font-sans relative overflow-hidden pb-24">
      
      {/* GLOWING BACKGROUND DECORATIONS */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[180px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />
      
      {/* CONTENEDOR VERTICAL PRINCIPAL */}
      <div className="max-w-6xl mx-auto px-6 py-16 space-y-20 relative z-10">
        
        {/* SECCIÓN 1: HERO COOL (GRID EN DESKTOP, STACKED EN MÓVIL) */}
        <div className="grid md:grid-cols-12 gap-12 items-center max-w-5xl mx-auto">
          
          {/* Lado izquierdo: Información y Contadores */}
          <div className="md:col-span-7 space-y-8 flex flex-col items-center md:items-start text-center md:text-left">
            {/* BADGE DE EVENTO */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-blue-400" />
              CONFERENCIA EXCLUSIVA
            </div>

            {/* HEADLINE */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black uppercase italic tracking-tighter leading-none text-white text-center md:text-left">
              Cómo lograr tus metas en <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">hard mode</span>
            </h1>

            {/* SUBHEADLINE */}
            <p className="text-xl md:text-2xl text-blue-100/70 leading-relaxed font-bold max-w-2xl">
              La lección de perseverancia que el mundo real no le puede enseñar a tu hijo.
            </p>

            {/* FOTO PRINCIPAL - MÓVIL (Solo visible en pantallas pequeñas) */}
            <div className="block md:hidden relative rounded-3xl overflow-hidden border border-white/10 aspect-[4/5] w-full max-w-[280px] mx-auto group bg-white/5 shadow-2xl">
              <img 
                src="/imagen Michael Eusebio con baston sin fondo.png" 
                alt="Michael Eusebio con bastón" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f] via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-left">
                <p className="text-xs font-black tracking-widest uppercase text-blue-400">Speaker Principal</p>
                <p className="text-lg font-black text-white italic uppercase">Michael Eusebio</p>
              </div>
            </div>

            {/* CUENTA REGRESIVA EVENTO */}
            <div className="bg-gradient-to-br from-blue-900/10 to-indigo-950/10 border border-blue-500/10 rounded-3xl p-6 w-full max-w-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4 flex items-center justify-center md:justify-start gap-2">
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
            <div className="w-full flex justify-center md:justify-start pt-4">
              <Link
                href="/event-a/register"
                className="px-8 py-5 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black rounded-2xl flex items-center gap-3 shadow-2xl shadow-yellow-400/20 hover:scale-[1.03] active:scale-98 transition-all text-base uppercase tracking-wider justify-center"
              >
                Reservar Mi Cupo <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Lado derecho: Foto para PC (Oculto en móvil) */}
          <div className="hidden md:block md:col-span-5 relative rounded-3xl overflow-hidden border border-white/10 aspect-[4/5] w-full max-w-[360px] mx-auto group bg-white/5 shadow-2xl">
            <img 
              src="/imagen Michael Eusebio con baston sin fondo.png" 
              alt="Michael Eusebio con bastón" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f] via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-left">
              <p className="text-xs font-black tracking-widest uppercase text-blue-400">Speaker Principal</p>
              <p className="text-lg font-black text-white italic uppercase">Michael Eusebio</p>
            </div>
          </div>

        </div>

        {/* SECCIÓN: AUTORIDAD / PRUEBA SOCIAL */}
        <div className="pt-12 border-t border-white/10 space-y-12">
          <div className="text-center">
            <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg uppercase tracking-widest inline-block mb-3">
              RESPALDO Y AUTORIDAD
            </span>
            <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-white">
              Validación <span className="text-blue-400">Pública</span>
            </h2>
            <p className="text-blue-100/60 text-sm font-medium mt-3 max-w-xl mx-auto">
              Medios nacionales y referentes en educación respaldan este camino.
            </p>
          </div>

          <div className="max-w-md mx-auto bg-white/5 border border-white/10 p-4 rounded-[2rem] shadow-2xl">
            <video 
              src="/blind_coder_viral.mp4" 
              controls 
              className="w-full rounded-[1.5rem] overflow-hidden"
              playsInline
            />
          </div>
        </div>

        {/* SECCIÓN 2: EL PROBLEMA (Dolor del Padre) */}
        <div className="pt-12 border-t border-white/10 grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-6">
            <div className="space-y-4">
              <span className="text-[10px] font-black text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg uppercase tracking-widest inline-block">
                EL PROBLEMA
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tight leading-snug">
                ¿Cómo le enseñas a un hijo a no rendirse, cuando el mundo real casi nunca da ejemplos honestos de lo que cuesta lograrlo?
              </h2>
            </div>
            <div className="space-y-4 text-slate-300 text-sm md:text-base leading-relaxed font-medium">
              <p>
                Muchos jóvenes dominicanos crecen sin ver de cerca lo que significa realmente perseguir una meta grande cuando todo juega en tu contra.
              </p>
              <p>
                <strong>Michael Eusebio</strong> tiene solo un 3% de visión en un ojo y nada en el otro. Aprendió a programar de manera autodidacta, sin escuela especializada y sin las herramientas que la mayoría da por sentadas. Hoy trabaja en el sector financiero dominicano y va camino a estudiar Ingeniería en Inteligencia Artificial en Estados Unidos.
              </p>
              <p className="text-blue-300 font-bold border-l-2 border-blue-500 pl-4">
                No te va a dar un discurso motivacional genérico. Te va a mostrar, en vivo, lo que significa hacerlo en hard mode.
              </p>
            </div>
          </div>

          {/* Foto de Conferencia de Michael */}
          <div className="md:col-span-5 w-full relative rounded-3xl overflow-hidden border border-white/10 aspect-[4/3] md:aspect-[4/5] bg-white/5 shadow-2xl group">
            <img 
              src="/foto mia de conferencia .jpeg" 
              alt="Michael Eusebio dando conferencia" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#090909]/80 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-left">
              <p className="text-[9px] font-black tracking-widest uppercase text-blue-400">Impactando Vidas</p>
              <p className="text-xs font-black text-white uppercase italic mt-0.5">Conferencias y Liderazgo Presencial</p>
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: PARA QUIÉN ES */}
        <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-white/10">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-4">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block">DIRIGIDO A JÓVENES</span>
            <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Para jóvenes de 15 años en adelante</h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Que necesitan ver, no solo escuchar, que las metas grandes se logran incluso cuando todo está en contra. Una sacudida de realidad y perseverancia en vivo.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-4">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block">DIRIGIDO A PADRES</span>
            <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Para padres comprometidos</h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Que quieren darle a su hijo un ejemplo real de resiliencia ante las dificultades ordinarias del crecimiento y el estudio, no una charla más.
            </p>
          </div>
        </div>

        {/* SECCIÓN 4: FECHA, LUGAR & MAPA */}
        <div className="pt-12 border-t border-white/10 grid md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-5 space-y-6">
            <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg uppercase tracking-widest inline-block">
              ¿DÓNDE Y CUÁNDO?
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tight leading-snug">
              Fecha, hora y ubicación
            </h2>
            
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/5 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600/10 rounded-xl border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Fecha y Hora</p>
                  <p className="text-sm font-black text-white uppercase mt-0.5">Jueves 20 de agosto, 7:00 PM</p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600/10 rounded-xl border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Lugar del Evento</p>
                  <p className="text-sm font-black text-white uppercase mt-0.5">Pyhex Work, Santo Domingo</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a 
                href="https://www.google.com/maps/place/PYHEX+%7C+Work+1+%22Kennedy%22/@18.4821491,-69.9589811,828m/data=!3m2!1e3!4b1!4m6!3m5!1s0x8eaf8a1de8c00001:0x7fde7fa703caa962!8m2!3d18.4821491!4d-69.9564062!16s%2Fg%2F11dzdby9pn?hl=es&entry=ttu"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-300 hover:text-white transition-all inline-block active:scale-98"
              >
                📍 Abrir en Google Maps / Ver cómo llegar
              </a>
            </div>
          </div>

          {/* Iframe de Google Maps */}
          <div className="md:col-span-7 w-full h-[320px] rounded-3xl overflow-hidden border border-white/10 bg-white/5 shadow-2xl relative group">
            <iframe 
              src="https://maps.google.com/maps?q=PYHEX%20%7C%20Work%201%20%22Kennedy%22&t=&z=16&ie=UTF8&iwloc=&output=embed" 
              className="w-full h-full border-0 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* SECCIÓN 4: QUÉ VAS A VIVIR (El Evento) */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 space-y-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors pointer-events-none" />
          
          <div className="space-y-2">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block">LA EXPERIENCIA</span>
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">QUÉ VAS A VIVIR EN EL EVENTO</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 pt-4">
            {[
              {
                title: "Su historia sin filtros",
                desc: "Contada por él mismo, sin filtros ni narrativa de lástima."
              },
              {
                title: "Mentalidad para la movilidad social",
                desc: "El salto de mentalidad necesario para entrar y destacar en nuevos entornos. Qué hacer cuando eres el primero en tu círculo en apuntar tan alto y cómo manejar el síndrome del impostor."
              },
              {
                title: "Construcción de un proyecto de vida",
                desc: "Cómo pasar de \"tener un sueño\" a tener un roadmap ejecutable. Una guía paso a paso para estructurar metas a largo plazo, crear presupuestos reales y trazar rutas viables, aplicando un pensamiento estructurado a la vida personal."
              },
              {
                title: "Vendiendo tu visión (y financiando tus metas)",
                desc: "De nada sirve un gran proyecto si no sabes cómo respaldarlo. Estrategias prácticas sobre cómo estructurar campañas, acercarse a empresas (B2B) o a personas (B2C) para levantar fondos y conseguir el apoyo necesario para la educación o el emprendimiento."
              },
              {
                title: "Dinámica: \"Auditoría de metas en vivo\"",
                desc: "2 o 3 jóvenes del público comparten una meta grande que ven \"imposible\". Se hace un ejercicio rápido y en vivo para desarmar esa meta en pasos lógicos, identificando los verdaderos obstáculos y quitando las excusas."
              },
              {
                title: "Preguntas y Respuestas abiertas",
                desc: "Un espacio interactivo donde tu hijo (o tú) pueda preguntarle lo que quiera."
              },
              {
                title: "Perspectiva real",
                desc: "Un cierre honesto sobre lo que realmente cuesta perseguir un sueño grande — y por qué vale la pena de todas formas."
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white/5 border border-white/5 rounded-2xl p-6 flex items-start gap-4 hover:border-blue-500/30 transition-all">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                  {idx + 1}
                </div>
                <div className="space-y-1">
                  <p className="font-black text-white text-sm uppercase tracking-wide">{item.title}</p>
                  <p className="text-slate-400 text-xs md:text-sm font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>



        {/* SECCIÓN 5: EL TICKET & LOGÍSTICA */}
        <div className="bg-gradient-to-br from-[#0e213b]/80 to-[#0a1526]/80 border border-blue-500/20 rounded-3xl p-8 md:p-12 space-y-8 text-center max-w-3xl mx-auto relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-600/5 blur-3xl pointer-events-none" />
          
          <div className="space-y-2 relative z-10">
            <span className="text-[10px] font-black text-yellow-400 bg-yellow-500/10 px-3 py-1.5 rounded-lg uppercase tracking-widest inline-block mb-2">
              LA ENTRADA
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tight">
              Un ticket, dos entradas
            </h2>
            <p className="text-blue-100/70 text-base md:text-lg font-bold max-w-xl mx-auto">
              Tú y tu hijo/a, juntos en la misma experiencia compartida.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 pt-4 relative z-10">
            {/* Preventa Card */}
            <div className={`bg-white/5 border rounded-2xl p-5 relative overflow-hidden transition-all duration-300 ${
              pricePhase === 'early_bird' 
                ? 'border-yellow-500/40 shadow-[0_0_25px_rgba(234,179,8,0.15)] scale-[1.03] ring-1 ring-yellow-500/20' 
                : 'border-white/5 opacity-30 grayscale'
            }`}>
              {pricePhase === 'early_bird' && (
                <div className="absolute top-0 right-0 bg-yellow-400 text-slate-900 text-[8px] font-black uppercase px-2 py-0.5 rounded-bl-lg">
                  ACTIVO
                </div>
              )}
              <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Preventa</p>
              <p className="text-2xl font-black text-white mt-1">RD$ 1,800</p>
              <p className="text-[9px] font-semibold text-slate-400 mt-1">Solo durante la primera semana de lanzamiento</p>
            </div>

            {/* Regular Card */}
            <div className={`bg-white/5 border rounded-2xl p-5 relative overflow-hidden transition-all duration-300 ${
              pricePhase === 'regular' 
                ? 'border-blue-500/40 shadow-[0_0_25px_rgba(59,130,246,0.15)] scale-[1.03] ring-1 ring-blue-500/20' 
                : 'border-white/5 opacity-30 grayscale'
            }`}>
              {pricePhase === 'regular' && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-bl-lg">
                  ACTIVO
                </div>
              )}
              <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Precio Regular</p>
              <p className="text-2xl font-black text-white mt-1 font-mono">RD$ 3,000</p>
              <p className="text-[9px] font-semibold text-slate-400 mt-1">Siguiente fase</p>
            </div>

            {/* Puerta Card */}
            <div className={`bg-white/5 border rounded-2xl p-5 relative overflow-hidden transition-all duration-300 ${
              pricePhase === 'puerta' 
                ? 'border-red-500/40 shadow-[0_0_25px_rgba(239,68,68,0.15)] scale-[1.03] ring-1 ring-red-500/20' 
                : 'border-white/5 opacity-30 grayscale'
            }`}>
              {pricePhase === 'puerta' && (
                <div className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-bl-lg">
                  ACTIVO
                </div>
              )}
              <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Última Semana / Puerta</p>
              <p className="text-2xl font-black text-white mt-1 font-mono">RD$ 4,000</p>
              <p className="text-[9px] font-semibold text-slate-400 mt-1">Últimos días</p>
            </div>
          </div>

          {/* Detalles logísticos resumidos */}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto pt-6 border-t border-white/5 relative z-10">
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">📍 LUGAR</p>
              <p className="text-xs font-bold text-white uppercase mt-0.5">Pyhex Work</p>
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">📅 FECHA</p>
              <p className="text-xs font-bold text-white uppercase mt-0.5">20 de agosto, 7:00 PM</p>
            </div>
          </div>

          <div className="pt-4 relative z-10">
            <Link
              href="/event-a/register"
              className="px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black rounded-2xl flex items-center gap-3 shadow-2xl shadow-yellow-400/20 hover:scale-[1.03] active:scale-98 transition-all text-sm uppercase tracking-wider mx-auto justify-center inline-flex"
            >
              Reservar Mi Cupo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* SECCIÓN 5.5: PREGUNTAS FRECUENTES (FAQ) */}
        <div className="pt-12 border-t border-white/10 space-y-8 max-w-3xl mx-auto">
          <div className="text-center">
            <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg uppercase tracking-widest inline-block mb-3">
              PREGUNTAS FRECUENTES
            </span>
            <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tight text-white">
              Preguntas Frecuentes
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "¿Pueden asistir jóvenes solos?",
                a: "Sí, a partir de los 15 años pueden asistir de manera independiente. No obstante, recomendamos enormemente que asistan acompañados de al menos uno de sus padres para poder compartir y conversar sobre el plan de acción juntos después del evento."
              },
              {
                q: "¿El lugar cuenta con parqueo?",
                a: "Sí, Pyhex Work cuenta con parqueo vigilado, amplio y seguro para todos los asistentes del evento."
              },
              {
                q: "¿Hay algún requisito previo para asistir?",
                a: "Ninguno. Solo es muy recomendable traer material para anotar (cuaderno y lápiz, o tablet/computadora portátil) para estructurar tu plan de acción en vivo durante las sesiones."
              },
              {
                q: "¿Cómo se realiza el pago?",
                a: "El registro se realiza en línea en menos de 2 minutos. Puedes completar tu reservación vía transferencia bancaria directa (Banco Popular o Banreservas) y subir tu comprobante de pago para recibir tu pase de entrada oficial."
              }
            ].map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-white/5 border border-white/10 rounded-2xl p-5 transition-all hover:bg-white/10"
              >
                <button 
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex justify-between items-center gap-4 text-left outline-none cursor-pointer group"
                  aria-expanded={openFaq === idx}
                >
                  <span className="text-sm font-black text-white uppercase tracking-wide group-hover:text-blue-400 transition-colors">
                    {faq.q}
                  </span>
                  <span className="text-blue-400 font-bold text-lg select-none">
                    {openFaq === idx ? '−' : '+'}
                  </span>
                </button>
                {openFaq === idx && (
                  <p className="text-slate-300 text-xs md:text-sm font-medium leading-relaxed mt-3 pt-3 border-t border-white/5">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SECCIÓN 6: CIERRE & ACCIÓN */}
        <div className="pt-12 border-t border-white/10 text-center max-w-xl mx-auto space-y-6">
          <p className="text-slate-300 text-base md:text-lg leading-relaxed font-semibold italic">
            "No es una charla más. Es una hora que tu hijo va a recordar cada vez que quiera rendirse."
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link
              href="/event-a/register"
              className="w-full sm:w-auto px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-black rounded-2xl flex items-center justify-center gap-3 shadow-2xl shadow-yellow-400/20 hover:scale-[1.03] active:scale-98 transition-all text-sm uppercase tracking-wider"
            >
              Reservar Mi Cupo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
