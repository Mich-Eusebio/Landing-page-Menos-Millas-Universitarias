"use client";
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Instagram,
  MessageCircle,
  ChevronRight,
  Cpu,
  Loader2,
  Check,
  Sparkles,
  Lock,
  Youtube,
  Mail,
  Quote,
  Play,
  Plus,
  Minus,
  Calendar,
  Zap,
  Target,
  Trophy,
  Newspaper,
  Users
} from 'lucide-react';
import { getSupporters, getCampaignProgress } from '../lib/apis/SorteoActions';

const App = () => {
  const [activeTab, setActiveTab] = useState('supporters');
  const [supporters, setSupporters] = useState([]);
  const [loadingSupporters, setLoadingSupporters] = useState(false);
  const [progressData, setProgressData] = useState({
    totalPercentage: 17.5,
    currentYearProgress: 70
  });
  const [visibleCount, setVisibleCount] = useState(7);
  const [agreedValues, setAgreedValues] = useState({
    talento: false,
    tecnologia: false,
    inclusion: false
  });

  const [openFaq, setOpenFaq] = useState(null);

  const toggleValue = (key) => {
    setAgreedValues(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const allChecked = agreedValues.talento && agreedValues.tecnologia && agreedValues.inclusion;

  useEffect(() => {
    if (activeTab === 'supporters' && supporters.length === 0) {
      setLoadingSupporters(true);
      getSupporters().then(data => {
        setSupporters(data);
        setLoadingSupporters(false);
      });
    }
  }, [activeTab, supporters.length]);

  useEffect(() => {
    getCampaignProgress().then(data => {
      setProgressData(data);
    });
  }, []);

  const faqs = [
    {
      q: "¿A qué universidad vas?",
      a: "He sido admitido en la Universidad de Colorado Boulder, una institución de primer nivel en investigación y tecnología en los Estados Unidos. Mi objetivo es formarme como Ingeniero en Inteligencia Artificial."
    },
    {
      q: "¿Qué es 'Cómprame un día'?",
      a: "Es una forma directa de cubrir los costos operativos y de matrícula de mi carrera. Cada día de estudio tiene un costo calculado de RD$3,100. Al comprar un día, no solo donas, sino que te conviertes en el patrocinador oficial de esa fecha en mi calendario académico, y recibirás una actualización personalizada desde el campus ese día."
    },
    {
      q: "¿Cómo funciona el Newsletter 'En Primera Fila'?",
      a: "Es una suscripción mensual de RD$2,000 que te da acceso exclusivo a mi proceso de aprendizaje, los desafíos de vivir en NYC como estudiante ciego, y las herramientas tecnológicas que utilizo. Es un pase VIP al detrás de escena de este proyecto."
    },
    {
      q: "¿Es seguro mi pago?",
      a: "Utilizamos plataformas de pago seguras y reconocidas internacionalmente. Cada transacción está cifrada y protegida. También aceptamos transferencias directas si te sientes más cómodo."
    }
  ];

  const kpis = [
    { label: 'U. Colorado Boulder', value: '1 de 2,921', desc: 'Estudiantes internacionales admitidos' },
    { label: 'Hito Nacional', value: 'SAT Score', desc: 'Único estudiante ciego del país en rendir el SAT, superando a más de 3.9 Millones de estudiantes' },
    { label: 'Alpha Puesto de Bolsa', value: 'Software Dev', desc: 'Colaborador enfocado en soluciones de alto impacto y accesibilidad' }
  ];


  return (
    <div className="min-h-screen bg-[#0a192f] text-slate-100 font-sans selection:bg-blue-500 selection:text-white relative">
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/10 blur-[120px] rounded-full"></div>
      </div>

      <nav className="fixed top-0 w-full z-50 bg-[#0a192f]/80 backdrop-blur-lg border-b border-blue-900/30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-600/30 text-white">M</div>
            <span className="font-bold tracking-tight uppercase text-white">Michael <span className="text-blue-400">Eusebio</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#apoyar" className="text-sm font-bold uppercase tracking-widest text-blue-300 hover:text-white transition-colors">Cómo apoyar</a>
            <a href="#historia" className="text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Mi Historia</a>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="relative pt-40 pb-16 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8 z-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest">
              <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> Camino a la Universidad · Menos Millas</span>
            </div>
            <h1 className="text-3xl md:text-4xl xl:text-6xl font-black leading-tight text-white tracking-tighter">
              Soy Michael Eusebio. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-500">
                Fui aceptado en una universidad top en EE. UU. y necesito tu apoyo para llegar.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100/70 leading-relaxed font-medium max-w-2xl mx-auto lg:mx-0">
              Acompáñame en el camino para convertirme en el primer ingeniero dominicano en IA con discapacidad visual, abriendo un camino que no existía.
            </p>
            <div className="flex flex-col gap-8 items-center lg:items-start">
              <a href="#apoyar" className="inline-flex items-center justify-center gap-3 px-12 py-6 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black rounded-2xl shadow-2xl shadow-amber-400/20 transition-all uppercase text-lg group">
                👉 QUIERO HACER REAL ESTA HISTORIA
              </a>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-[450px]">
              <div className="absolute -inset-10 bg-blue-600/20 blur-[100px] rounded-full opacity-40"></div>
              <div className="relative rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
                <img src="/EXCELENTE FOTO MÍA.png" className="w-full grayscale hover:grayscale-0 transition-all duration-700 object-cover aspect-[4/5]" alt="Michael Eusebio concentrado en oficina programando" />
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#0a192f] to-transparent">
                  <div className="flex items-center gap-3 text-white">
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                      <Target className="w-6 h-6 text-amber-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* PROGRESS BAR SECTION */}
      <section className="py-12 px-6 bg-slate-950/20 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-blue-400 mb-1">Estado de la meta</h3>
              <div className="text-3xl font-black text-white">PROGRESO ACADÉMICO</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-amber-400">{progressData.totalPercentage}%</div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-40">Completado</div>
            </div>
          </div>

          <div className="relative h-16 bg-white/5 rounded-3xl p-2 border border-white/10 flex gap-2">
            {[1, 2, 3, 4].map((year) => (
              <div key={year} className="flex-1 relative group">
                <div className="absolute inset-0 bg-white/5 rounded-2xl border border-white/5"></div>
                {/* Year markers */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest opacity-30 group-hover:opacity-100 transition-opacity">
                  Año {year}
                </div>
                {/* Active fill logic */}
                <div
                  className={`absolute inset-0 rounded-2xl transition-all duration-1000 flex items-center justify-center overflow-hidden ${progressData.totalPercentage >= (year * 25) ? 'bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]' :
                    progressData.totalPercentage > ((year - 1) * 25) ? 'bg-gradient-to-r from-green-500 to-transparent' : ''
                    }`}
                  style={{
                    width: progressData.totalPercentage > ((year - 1) * 25) && progressData.totalPercentage < (year * 25)
                      ? `${(progressData.totalPercentage - (year - 1) * 25) / 25 * 100}%`
                      : progressData.totalPercentage >= (year * 25) ? '100%' : '0%'
                  }}
                >
                  {/* Show percentage inside the active year bar */}
                  {progressData.totalPercentage > ((year - 1) * 25) && progressData.totalPercentage < (year * 25) && (
                    <span className="text-[10px] font-black text-white relative z-20 animate-pulse">
                      {progressData.currentYearProgress}%
                    </span>
                  )}
                  {progressData.totalPercentage > ((year - 1) * 25) && (
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:20px_20px] animate-[shimmer_2s_linear_infinite]"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2 mt-4 text-center">
            <div className="text-[10px] font-bold uppercase tracking-tighter opacity-40">Freshman</div>
            <div className="text-[10px] font-bold uppercase tracking-tighter opacity-40">Sophomore</div>
            <div className="text-[10px] font-bold uppercase tracking-tighter opacity-40">Junior</div>
            <div className="text-[10px] font-bold uppercase tracking-tighter opacity-40">Senior</div>
          </div>
        </div>
      </section>


      {/* TABS SECTION - COMPACTING HISTORY AND VALIDATION */}
      <section id="historia" className="py-32 px-6 relative">
        <div className="max-w-5xl mx-auto">
          {/* Custom Tab Switcher */}
          <div className="flex flex-wrap justify-center gap-2 mb-16 bg-slate-900/50 p-2 rounded-3xl border border-white/10 w-fit mx-auto">
            {[
              { id: 'logros', label: 'Mis logros', icon: Trophy },
              { id: 'historia', label: 'El problema', icon: Target },
              { id: 'validacion', label: 'Validación pública', icon: Newspaper },
              { id: 'manifiesto', label: '¿Por qué apoyar?', icon: Quote },
              { id: 'supporters', label: '¿Quiénes ya están apoyando?', icon: Users }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(activeTab === tab.id ? null : tab.id)}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-[500px]">
            <AnimatePresence mode="wait">
              {activeTab === 'logros' && (
                <motion.div
                  key="logros"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-12"
                >
                  <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white">
                      Mis <span className="text-blue-400">Logros</span>
                    </h2>
                    <p className="text-blue-100/60 text-lg font-medium mt-4">
                      Hitos que validan mi compromiso y capacidad profesional.
                    </p>
                  </div>
                  <div className="grid md:grid-cols-3 gap-8">
                    {kpis.map((kpi, i) => (
                      <motion.div
                        whileHover={{ y: -10 }}
                        key={i}
                        className="p-10 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur relative overflow-hidden group"
                      >
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                          <Trophy className="w-24 h-24" />
                        </div>
                        <div className="text-4xl font-black text-blue-400 mb-2">{kpi.value}</div>
                        <div className="text-xs font-black uppercase tracking-widest text-white mb-4">{kpi.label}</div>
                        <p className="text-blue-100/60 text-sm leading-relaxed">{kpi.desc}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
              {activeTab === 'historia' && (
                <motion.div
                  key="historia"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-12"
                >
                  <div className="text-center md:text-left space-y-8">
                    <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white">
                      El talento existe. <br /><span className="text-blue-400">El sistema no lo acompaña.</span>
                    </h2>
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                      <div className="space-y-6">
                        <p className="text-lg md:text-xl text-blue-100/80 leading-relaxed font-medium">
                          Según datos del <span className="text-amber-400 font-bold">SIUBEN (2023)</span>, en República Dominicana 8 de cada 10 estudiantes con discapacidad no termina la escuela, solo un 5 % logra completar una licenciatura y apenas un 11 % accede a conocimientos avanzados en informática.
                        </p>
                        <div className="p-8 bg-blue-600/5 border-l-4 border-blue-500 rounded-r-2xl">
                          <p className="text-blue-100/70 italic text-lg leading-relaxed">
                            "No es falta de capacidad: es falta de un sistema que respalde ese talento a largo plazo."
                          </p>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <p className="text-lg text-blue-100/80 leading-relaxed">
                          En mi caso, aprender a programar fue una decisión de riesgo. Lo hice de forma autodidacta con recursos como los programas de Harvard CS50 y Samsung Innovation Campus.
                        </p>
                        <p className="text-lg text-blue-100/80 leading-relaxed">
                          Hoy aporto valor profesional, pero la universidad en el extranjero es el acelerador que necesito para traer soluciones de IA accesibles a mi país.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'validacion' && (
                <motion.div
                  key="validacion"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-12"
                >
                  <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white">
                      Validación <span className="text-blue-400">Pública</span>
                    </h2>
                    <p className="text-blue-100/60 text-lg font-medium mt-4">
                      Medios nacionales y referentes en educación respaldan este camino.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 items-start">
                    <div className="bg-white/5 border border-white/10 p-4 rounded-[2rem]">
                      <iframe
                        src="https://www.instagram.com/reel/DMLiTVHRYxN/embed"
                        width="100%"
                        height="500"
                        frameBorder="0"
                        scrolling="no"
                        allowtransparency="true"
                        style={{ borderRadius: '1.5rem', border: 'none' }}
                        title="Instagram Reel Michael Eusebio"
                      ></iframe>
                    </div>
                    <div className="space-y-6">
                      <div className="p-8 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-between group hover:border-blue-500 transition-all">
                        <div className="space-y-2">
                          <h4 className="text-xl font-bold text-white">Esta Noche Mariasela</h4>
                          <p className="text-xs font-black text-blue-400 uppercase tracking-widest">TV Nacional Dominicana</p>
                        </div>
                        <a href="https://youtu.be/JUKMssSNpE8?si=TDflA-3fEz2Lfg9v" target="_blank" className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-8 h-8 text-white fill-white ml-1" />
                        </a>
                      </div>
                      <div className="p-8 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-between group hover:border-amber-500 transition-all">
                        <div className="space-y-2">
                          <h4 className="text-xl font-bold text-white">ViaTecnológica</h4>
                          <p className="text-xs font-black text-blue-400 uppercase tracking-widest">Tecnología e Inclusión</p>
                        </div>
                        <a href="https://youtu.be/CBO24x7Xr8U?si=9CqqGqBIAigBJfDp" target="_blank" className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-8 h-8 text-slate-900 fill-slate-900 ml-1" />
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'manifiesto' && (
                <motion.div
                  key="manifiesto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-12 text-center"
                >
                  <Quote className="w-20 h-20 text-blue-600 mx-auto opacity-40 mb-8" />
                  <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white">
                    ¿Por qué <span className="text-blue-400">esto importa?</span>
                  </h2>
                  <div className="max-w-3xl mx-auto space-y-8">
                    <p className="text-2xl md:text-3xl font-serif italic text-blue-100/90 leading-relaxed">
                      "Llegué hasta aquí por mérito propio; pero el siguiente paso requiere apoyo. No es un lujo, es el siguiente paso necesario para generar un impacto que trascienda mi historia personal."
                    </p>
                    <p className="text-lg text-blue-100/60 leading-relaxed">
                      Mi meta es crear tecnología que rompa barreras. Al apoyarme, estás apoyando la creación de herramientas de accesibilidad, la investigación en IA y la formación de un líder dominicano en el epicentro tecnológico global.
                    </p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'supporters' && (
                <motion.div
                  key="supporters"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-12"
                >
                  <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white">
                      Quiénes ya están <span className="text-blue-400">apoyando</span>
                    </h2>
                    <p className="text-blue-100/60 text-lg font-medium mt-4">
                      Personas que han decidido ser parte de esta historia.
                    </p>
                  </div>

                  {loadingSupporters ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-4">
                      <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
                      <p className="text-blue-100/40 uppercase font-black tracking-widest text-xs">Cargando aliados...</p>
                    </div>
                  ) : supporters.length > 0 ? (
                    <div className="relative group">
                      <div className="flex gap-6 overflow-x-auto pb-8 snap-x no-scrollbar">
                        {supporters.slice(0, visibleCount).map((s, i) => (
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            key={i}
                            className="min-w-[300px] md:min-w-[400px] p-8 bg-white/5 border border-white/10 rounded-[2.5rem] hover:border-blue-500/30 transition-all flex flex-col gap-4 snap-center group/card"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white tracking-tight text-lg">{s.owner_name}</span>
                              <Quote className="w-5 h-5 text-blue-500/30 group-hover/card:text-blue-400 transition-colors" />
                            </div>
                            <p className="text-blue-100/70 italic font-serif leading-relaxed text-lg">"{s.support_reason}"</p>
                          </motion.div>
                        ))}

                        {visibleCount < supporters.length && (
                          <div className="flex items-center min-w-[200px] px-4">
                            <button
                              onClick={() => setVisibleCount(prev => prev + 7)}
                              className="w-full h-full max-h-[100px] flex flex-col items-center justify-center gap-3 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-400 font-black rounded-[2rem] transition-all uppercase text-[10px] tracking-widest"
                            >
                              <Plus className="w-5 h-5" />
                              Ver más
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Indicador visual de scroll */}
                      <div className="flex justify-center gap-2 mt-4">
                        <div className="h-1 w-12 bg-blue-600 rounded-full"></div>
                        <div className="h-1 w-4 bg-white/10 rounded-full"></div>
                        <div className="h-1 w-4 bg-white/10 rounded-full"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-20 text-center bg-white/5 border border-white/10 rounded-[2.5rem]">
                      <p className="text-blue-100/40 uppercase font-black tracking-widest text-xs">Aún no hay mensajes públicos. ¡Sé el primero!</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* NEW SUPPORT OPTIONS SECTION */}
      <section id="apoyar" className="py-32 px-6 bg-[#050b16] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] bg-blue-600/5 blur-[120px] rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-4 leading-none">ELIGE TU <span className="text-blue-400">IMPACTO</span></h2>
          <p className="text-blue-100/60 text-lg mb-20 max-w-2xl mx-auto">No es una donación. Es tu lugar en una historia que estamos escribiendo juntos.</p>

          <div className="grid lg:grid-cols-2 gap-6 max-w-4xl mx-auto mb-32">
            {/* Cómprame un día */}
            <motion.div
              id="comprame-un-dia"
              whileHover={{ y: -10 }}
              className="p-10 rounded-[2.5rem] bg-blue-700 text-left flex flex-col h-full shadow-2xl relative group"
            >
              <div className="absolute top-6 right-6 w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 group-hover:bg-white transition-colors">
                <Calendar className="w-6 h-6 text-white group-hover:text-blue-700" />
              </div>
              <div className="flex-grow">
                <span className="inline-block px-3 py-1.5 rounded-full bg-white/10 text-white text-[9px] font-black uppercase tracking-widest mb-4 border border-white/10">
                  Patrocinio Directo
                </span>
                <h3 className="text-3xl font-black uppercase tracking-tighter mb-2 text-white">Cómprame un día</h3>
                <div className="text-4xl font-black text-white mb-6 tracking-tighter italic">RD$3,000 <span className="text-base text-white/40 font-medium not-italic">/ día</span></div>

                <div className="space-y-4 text-white/80 text-sm leading-relaxed mb-8 font-medium">
                  <p>Invierte un día de mis estudios y a cambio yo te dedico esa fecha públicamente.</p>
                  <div className="text-xs italic border-l-2 border-white/40 pl-4 bg-white/5 py-2.5 space-y-1.5 text-white/70">
                    <p>"Voy a estudiar ingeniería en Nueva York. Ciego. Dominicano. Sin mapa."</p>
                    <p className="opacity-50">El día que llegué al campus. El día de mi primer examen. El día que entregué mi primer proyecto.</p>
                  </div>
                  <p className="font-bold text-white">Tú puedes ser parte de uno de esos días. No es una donación. Es tu lugar en mi historia.</p>
                  <p className="text-xs text-white/70 italic">Cuando ese día llegue — te mando una foto, un audio, un momento real. Tuyo.</p>
                </div>
              </div>

              <Link href="/comprame-un-dia" className="w-full py-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-center text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2">
                Ver días disponibles <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>

            {/* En primera fila */}
            <motion.div
              whileHover={{ y: -10 }}
              className="p-10 rounded-[2.5rem] bg-amber-400 text-left flex flex-col h-full shadow-2xl relative group"
            >
              <div className="absolute top-6 right-6 w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Newspaper className="w-6 h-6 text-amber-400" />
              </div>
              <div className="flex-grow">
                <h3 className="text-3xl font-black uppercase tracking-tighter mb-2 text-slate-900">En primera fila</h3>
                <div className="text-4xl font-black text-slate-900 mb-6 tracking-tighter italic">RD$2,000 <span className="text-base text-slate-700/60 font-medium not-italic">/ mes</span></div>

                <div className="space-y-4 text-slate-800 text-sm leading-relaxed mb-8 font-medium">
                  <p>Cada semana te informo desde adentro: lo que aprendo en tecnología y negocios, lo que escucho, lo que vivo. <span className="text-slate-900 font-bold underline decoration-slate-900/30 underline-offset-4">No es inspiración genérica.</span> Es el journey sin filtro de alguien abriendo un camino que no existía.</p>
                  <ul className="space-y-2 mt-4">
                    <li className="flex items-center gap-3 font-bold text-slate-900"><Check className="w-4 h-4 text-slate-900" /> Reporte semanal desde adentro</li>
                    <li className="flex items-center gap-3 font-bold text-slate-900"><Check className="w-4 h-4 text-slate-900" /> Acceso a La Caja Negra (Recursos)</li>
                    <li className="flex items-center gap-3 font-bold text-slate-900"><Check className="w-4 h-4 text-slate-900" /> Tu nombre en el Muro de Fundadores</li>
                  </ul>
                  <p className="text-[9px] uppercase font-black tracking-widest text-slate-900/40 mt-4 italic">Cancela cuando quieras.</p>
                </div>
              </div>

              <Link href="/en-primera-fila" className="w-full py-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-center text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20 transition-all flex items-center justify-center gap-2">
                Unirse ahora <ChevronRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>

          {/* CONTACT CTA */}
          <div className="max-w-2xl mx-auto text-center mt-16 pt-16 border-t border-white/5">
            <h3 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-white mb-2">¿Tienes dudas?</h3>
            <p className="text-blue-100/60 text-lg mb-8">Prefiero explicártelo yo mismo.</p>
            <a
              href="https://wa.me/18295705985?text=Hola%20Michael!%20Tengo%20algunas%20dudas%20sobre%20cómo%20apoyar%20tu%20camino%20a%20Colorado."
              target="_blank"
              className="inline-flex items-center gap-4 px-10 py-5 bg-green-600 hover:bg-green-500 text-white font-black rounded-2xl shadow-2xl shadow-green-600/20 transition-all uppercase tracking-widest text-sm group"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              HABLEMOS
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* FAQS SECTION */}
      <section className="py-32 px-6">
        <div className="max-w-3xl mx-auto text-left relative z-20">
          <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-10 text-center text-blue-400 underline decoration-white/20 underline-offset-8">PREGUNTAS FRECUENTES</h3>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-white/10 pb-4">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between py-4 text-left group transition-all"
                >
                  <span className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors uppercase tracking-tight">{faq.q}</span>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-600/20 transition-all">
                    {openFaq === i ? <Minus className="w-4 h-4 text-blue-400" /> : <Plus className="w-4 h-4 text-white/40" />}
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pb-4 text-blue-100/60 leading-relaxed text-sm">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-24 border-t border-white/5 bg-[#071120] text-center">
        <div className="max-w-7xl mx-auto space-y-12 px-6">
          <div className="flex flex-wrap justify-center gap-4">
            <a href="https://instagram.com/mich_eusebio" target="_blank" className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-lg"><Instagram /></a>
            <a href="https://www.youtube.com/@michaeleusebio" target="_blank" className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-lg"><Youtube /></a>
            <a href="https://wa.me/18295705985" target="_blank" className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-lg"><MessageCircle /></a>
            <a href="mailto:michaeleusebiodelorbe@gmail.com" className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-lg"><Mail /></a>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">© 2026 Michael Eusebio · Menos Millas Universitarias</p>
        </div>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@1,400;1,700&display=swap');
        .font-serif { font-family: 'Crimson Pro', serif; }
        
        @keyframes shimmer {
          0% { background-position: -20px 0; }
          100% { background-position: 20px 0; }
        }
      `}</style>
    </div>
  );
};

export default App;
