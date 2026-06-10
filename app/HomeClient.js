"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Instagram,
  MessageCircle,
  ChevronRight,
  Youtube,
  Mail,
  Quote,
  Play,
  Plus,
  Loader2,
  Target,
  Trophy,
  Newspaper,
  Users
} from 'lucide-react';
import { getSupporters } from '../lib/apis/SorteoActions';
import HomeCalendar from '../components/HomeCalendar';

const App = () => {
  const [activeTab, setActiveTab] = useState('supporters');
  const [supporters, setSupporters] = useState([]);
  const [loadingSupporters, setLoadingSupporters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(7);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (activeTab === 'supporters' && supporters.length === 0) {
      setLoadingSupporters(true);
      getSupporters().then(data => {
        console.log('Supporters data:', data);
        setSupporters(data);
        setLoadingSupporters(false);
      }).catch(err => {
        console.error('Error loading supporters:', err);
        setLoadingSupporters(false);
      });
    }
  }, [activeTab, supporters.length]);

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
      <header className="relative pt-12 md:pt-40 pb-16 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-4 lg:gap-12 items-center lg:items-center text-center lg:text-left">
          
          {/* IMAGE CONTAINER - FIRST ON MOBILE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="w-full max-w-[240px] lg:max-w-[450px] order-1 lg:order-2"
          >
            <div className="relative">
              <div className="absolute -inset-10 bg-blue-600/20 blur-[100px] rounded-full opacity-40"></div>
              <div className="relative rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
                <img src="/EXCELENTE FOTO MÍA.png" className="w-full grayscale hover:grayscale-0 transition-all duration-700 object-cover aspect-square lg:aspect-[4/5] object-top" alt="Michael Eusebio" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-[#0a192f] to-transparent">
                  <div className="flex items-center gap-3 text-white">
                    <div className="w-8 h-8 md:w-12 md:h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                      <Target className="w-4 h-4 md:w-6 md:h-6 text-amber-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* TEXT CONTAINER */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 space-y-4 md:space-y-8 z-10 order-2 lg:order-1"
          >
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-black leading-[1.1] text-white tracking-tighter">
              365 días. <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">Uno puede ser tuyo.</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100/70 max-w-xl">
              Voy a estudiar ingeniería en EE.UU. Sin vista, primer dominicano en hacerlo. Con los que decidan estar.
            </p>
            <div className="flex flex-col gap-8 items-center lg:items-start pt-4">
              <a href="#calendario" className="w-full lg:w-auto inline-flex items-center justify-center gap-3 px-8 py-5 md:px-12 md:py-6 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black rounded-2xl shadow-2xl shadow-amber-400/20 transition-all uppercase text-base md:text-lg group">
                Reserva tu día en mi historia
              </a>
            </div>
          </motion.div>
        </div>
      </header>

      {/* PARTNERS SECTION */}
      <section className="py-16 md:py-24 px-6 bg-[#050b16] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-blue-600/5 blur-[120px] rounded-full"></div>
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-white text-center mb-12">
            Si me apoyas, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">esto también es tuyo.</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center group hover:border-amber-400/30 transition-all">
              <div className="w-24 h-24 rounded-full overflow-hidden mb-6 border-2 border-white/10 group-hover:border-amber-400/50 transition-all">
                <img src="/logo de stetic.jpg" alt="Stetic RD" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Stetic RD</h3>
              <p className="text-amber-400 font-bold text-lg mb-4">50% de descuento en depilación láser</p>
              <a href="https://www.instagram.com/stetik_rd?igsh=cWl5YmJ1ODI0Z3J4" target="_blank" className="text-xs font-black uppercase tracking-widest text-blue-400 hover:text-white transition-colors">
                Conocer empresa →
              </a>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center text-center group hover:border-amber-400/30 transition-all">
              <div className="w-24 h-24 rounded-full overflow-hidden mb-6 border-2 border-white/10 group-hover:border-amber-400/50 transition-all">
                <img src="/logo de optica megavision.jpg" alt="Óptica Megavisión" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Óptica Megavisión</h3>
              <p className="text-amber-400 font-bold text-lg mb-4">30% de descuento en cristales y monturas</p>
              <a href="https://www.instagram.com/megavisionrd?igsh=MWNhYzFobHdtY2U1Ng%3D%3D" target="_blank" className="text-xs font-black uppercase tracking-widest text-blue-400 hover:text-white transition-colors">
                Conocer empresa →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CALENDAR SECTION */}
      <HomeCalendar />

      {/* TABS SECTION - COMPACTING HISTORY AND VALIDATION */}
      <section id="historia" className="py-32 px-6 relative">
        <div className="max-w-5xl mx-auto">
          {/* Custom Tab Switcher */}
          <div className="flex flex-wrap justify-center gap-2 mb-16 bg-slate-900/50 p-2 rounded-3xl border border-white/10 w-fit mx-auto">
            {[
              { id: 'logros', label: 'Mis logros', icon: Trophy },
              { id: 'historia', label: 'El problema', icon: Target },
              { id: 'validacion', label: 'Validación pública', icon: Newspaper },
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

      <div className="max-w-2xl mx-auto text-center py-16 px-6">
        <h3 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-white mb-2">¿Tienes dudas?</h3>
        <p className="text-blue-100/60 text-lg mb-8">Prefiero hablarlo directo.</p>
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

      <footer className="py-24 bg-[#071120] text-center">
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
        
        html {
          scroll-behavior: smooth;
        }
        
        @keyframes shimmer {
          0% { background-position: -20px 0; }
          100% { background-position: 20px 0; }
        }
      `}</style>
    </div>
  );
};

export default App;
