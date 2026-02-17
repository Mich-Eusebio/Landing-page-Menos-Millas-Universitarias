"use client";
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
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
  Minus
} from 'lucide-react';

const App = () => {
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

  const faqs = [
    {
      q: "¿Cómo puedo comprar mi ticket?",
      a: "Al elegir tu plan de participación, serás redirigido a nuestra plataforma de gestión de boletos o contacto directo. Allí podrás seleccionar tus números, completar tus datos y realizar el pago. Si prefieres pagar vía transferencia bancaria, escríbeme directamente por WhatsApp; coordinaremos el registro manual de tus tickets una vez confirmada la transacción."
    },
    {
      q: "¿Qué tan seguro es mi pago?",
      a: "Tu seguridad es prioridad. Utilizamos Lemon Squeezy (respaldado por Stripe), una pasarela con cifrado bancario de nivel internacional para procesar tarjetas de crédito y débito. Si optas por transferencia bancaria, tu ticket se valida tras confirmar el depósito y recibirás un comprobante digital único vía WhatsApp para tu tranquilidad."
    },
    {
      q: "¿No es muy caro el monto de participación?",
      a: "Esta no es una colecta convencional; es una inversión en tecnología, inclusión y educación de alto impacto, respaldada por premios de alta gama. Entiendo que los planes pueden ser elevados para algunos, y valoro profundamente tu intención de apoyar. Si deseas participar pero el monto individual te resulta difícil, te sugiero la Milla Compartida: divide el costo con un amigo y compartan la oportunidad de ganar. Mi meta es llegar a la universidad con socios comprometidos con la excelencia; si no puedes sumarte hoy, me ayudas inmensamente compartiendo este enlace con alguien que sí pueda."
    },
    {
      q: "¿Puedo participar si vivo fuera de República Dominicana?",
      a: "¡Totalmente! Puedes adquirir tus tickets desde cualquier parte del mundo utilizando tu tarjeta de crédito. En caso de resultar ganador, coordinaremos el envío seguro a tu ubicación o la entrega directa a un familiar dentro de RD."
    },
    {
      q: "¿Cómo recibo mi premio si gano?",
      a: "Si resides en Santo Domingo, la entrega se realizará de forma personal. Para ganadores en el interior del país o el extranjero, coordinaremos un envío seguro y certificado a tu dirección. Es importante destacar que todos los dispositivos son nuevos y cuentan con su garantía original de Apple."
    },
    {
      q: "¿Cuándo y cómo se conocerán los ganadores?",
      a: "El sorteo se celebrará en vivo el sábado 28 de marzo a las 6:45 PM a través de nuestro canal de YouTube. Te invito a seguirme en Instagram para actualizaciones de último minuto, anuncios de nuevos premios y para participar en nuestras sesiones semanales sobre tecnología, IA, inclusión, y nos conozcamos mejor."
    },
    {
      q: "¿Cómo puedo contactarte?",
      a: "Estoy a tu disposición para cualquier duda adicional. Puedes escribirme directamente a mi WhatsApp o enviarme un correo electrónico a: michaeleusebiodelorbe@gmail.com."
    }
  ];

  const kpis = [
    { label: 'U. Colorado Boulder', value: '1 de 2,921', desc: 'Estudiantes internacionales admitidos' },
    { label: 'Hito Nacional', value: 'SAT Score', desc: 'Único estudiante ciego del país en rendir el SAT, sobrepasando a más de 3.9 Millones  de estudiantes' },
    { label: 'Alpha Puesto de Bolsa', value: 'Top 18 LATAM', desc: 'Colaborador como Desarrollador de Software enfocado en soluciones de alto impacto' }
  ];

  const premios = [
    { lugar: '1er Lugar', nombre: 'iPhone 15 Plus', img: 'https://cdn.jiostore.online/v2/jmd-asp/jdprod/wrkr/products/pictures/item/free/resize-w:450/apple/493839337/0/jDXEAvENvS-IMHWPqFPhN-Apple-iPhone-15-Plus-512-GB-Blue-493839337-i-1-1200Wx1200H.jpeg', disponibilidad: 'Todos los participantes' },
    { lugar: '2do Lugar', nombre: 'iPad 10th Gen', img: 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/ipad-10th-gen-storage-select-202212-blue?wid=5120&hei=2880&fmt=webp&qlt=90&.v=K0VQT3FFaHFhTWU0ME1DRnlHMFM3bEIvTXY5NjBUQVhVcnFORUt4SFI2QXVydldlTjVqQnhYWVhaM3FCVnF1VE9UVDVQbVhkcDIxQlRzeDZXVVpQSzNPRWVyeSszMEt5U205VEFxelFHR21ZZ2lWdVRBc0YzbEJkM3NURkZpSy8&traceId=1', disponibilidad: 'Todos los participantes' },
    { lugar: '3er Lugar', nombre: 'AirPods 4', img: 'https://portatilshoprd.com/wp-content/uploads/2024/12/2e373d_fceb919ac4404e6f8e4f9cffc8fa78dcmv2.png', disponibilidad: 'Todos los participantes' },
    { lugar: 'Premio SORPRESA', nombre: 'Dispositivo Especial O Efectivo', img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop', disponibilidad: 'Solo Millas de Impacto y Millas Extras', especial: true }
  ];

  const plans = [
    { name: 'Milla Extra', price: 'RD$5,000', tickets: '10 Tickets + 3 especiales', color: 'bg-indigo-900 text-white border-indigo-500', tag: 'Máximo Impacto', benefit: 'Para quienes quieren dejar huella.', url: "/rifa" },
    { name: 'Milla Impacto', price: 'RD$3,000', tickets: '5 Tickets + 1 ticket de Rifa Especial', color: 'bg-amber-400 text-slate-900 border-amber-500', tag: 'Recomendado', benefit: 'Incluye ticket de Rifa Especial', url: "/rifa" },
    { name: 'Milla de Impulso', price: 'RD$1,500', tickets: '3 Tickets', color: 'bg-blue-600 text-white border-blue-300', tag: '🔥 El mejor valor', benefit: 'Triplicas impacto y oportunidades.', featured: true, url: "/rifa" },
    { name: 'Milla Inicial', price: 'RD$1,000', tickets: '1 Ticket', color: 'bg-white text-slate-900 border-white', benefit: 'Participación base en el sorteo', url: "/rifa" }
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
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-600/30">M</div>
            <span className="font-bold tracking-tight uppercase">Michael <span className="text-blue-400">Eusebio</span></span>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="relative pt-40 pb-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-center lg:text-left">
          <div className="space-y-8 z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest">
              <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> Rifa Menos Millas Universitarias</span>
            </div>
            <h1 className="text-3xl md:text-5xl xl:text-6xl font-black leading-tight text-white tracking-tighter">
              Soy Michael Eusebio. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-amber-200">
                Fui aceptado en una universidad top en EE. UU. y necesito tu apoyo para llegar.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100/70 leading-relaxed font-medium max-w-2xl mx-auto lg:mx-0">
              Participa en la rifa Menos Millas Universitarias y acompáñame en el camino para convertirme en el primer ingeniero dominicano en IA con discapacidad visual, mientras compites por premios reales.
            </p>
            <div className="flex flex-col gap-6 justify-center lg:justify-start items-center lg:items-start">
              <a href="#planes" className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black rounded-2xl shadow-xl transition-all uppercase">
                👉 Quiero hacer real esta historia
              </a>
              <p className="text-sm font-bold text-red-400/90 uppercase tracking-widest bg-red-400/5 px-4 py-2 rounded-lg border border-red-400/10 italic">
                "Si este paso no se concreta ahora, la oportunidad con la universidad se pierde."
              </p>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[400px]">
              <div className="absolute -inset-10 bg-blue-600/20 blur-[100px] rounded-full opacity-40"></div>
              <img src="/foto trabajando .jpg" className="relative rounded-[3rem] border border-white/10 shadow-2xl grayscale hover:grayscale-0 transition-all duration-700" alt="Michael Eusebio concentrado en oficina programando con su laptop" />
            </div>
          </div>
        </div>
      </header>

      {/* KPIs */}
      <section className="py-20 px-6 border-y border-white/5 bg-slate-950/20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {kpis.map((kpi, i) => (
            <div key={i} className="p-10 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur text-center md:text-left">
              <div className="text-4xl font-black text-blue-400 mb-2">{kpi.value}</div>
              <div className="text-xs font-black uppercase tracking-widest text-white mb-4">{kpi.label}</div>
              <p className="text-blue-100/60 text-sm leading-relaxed">{kpi.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECCIÓN DOLOR */}
      <section className="py-24 px-6 bg-slate-950/40 relative">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center md:text-left space-y-6">
            <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white">
              El talento existe. <span className="text-blue-400">El sistema no lo acompaña.</span>
            </h2>
            <p className="text-lg md:text-xl text-blue-100/80 leading-relaxed font-medium">
              Según datos del <span className="text-amber-400">SIUBEN (2023)</span>, en República Dominicana 8 de cada 10 estudiantes con discapacidad no termina la escuela, solo un 5 % logra completar una licenciatura y apenas un 11 % accede a conocimientos avanzados en informática.
            </p>
            <div className="p-8 bg-blue-600/5 border-l-4 border-blue-500 rounded-r-2xl">
              <p className="text-blue-100/70 italic text-lg leading-relaxed">
                "No es falta de capacidad: es falta de un sistema que respalde ese talento a largo plazo."
              </p>
            </div>
            <p className="text-lg text-blue-100/80 leading-relaxed">
              En mi caso, aprender a programar fue una decisión de riesgo. Lo hice de forma autodidacta con recursos gratuitos como los programas de Harvard CS50 y Samsung Innovation Campus, y hoy ya aporto valor profesional.
            </p>
          </div>
        </div>
      </section>

      {/* VALIDACIÓN PÚBLICA */}
      <section className="py-32 px-6 relative overflow-hidden bg-gradient-to-b from-transparent to-slate-950/50">
        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white">
              Esta historia ya fue <span className="text-blue-400">validada públicamente</span>
            </h2>
            <p className="text-blue-100/60 text-lg font-medium">
              Medios nacionales y referentes en educación, inclusión y tecnología respaldan este camino.
            </p>
          </div>

          <div className="flex flex-col items-center">
            {/* IFRAME DE INSTAGRAM */}
            <div className="relative z-20 w-full max-w-[540px] flex flex-col items-center mb-10">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400 mb-6 bg-amber-400/10 px-6 py-2 rounded-full border border-amber-400/20">
                “Entrevistas completas disponibles públicamente”
              </span>
              <iframe 
                src="https://www.instagram.com/reel/DMLiTVHRYxN/embed" 
                width="100%" 
                height="700" 
                frameBorder="0" 
                scrolling="no" 
                allowtransparency="true"
                style={{ borderRadius: '12px', border: 'none', maxWidth: '540px' }}
                title="Instagram Reel Michael Eusebio"
              ></iframe>
            </div>

            {/* SECCIÓN DE VIDEOS DE YOUTUBE */}
            <div className="grid md:grid-cols-2 gap-12 lg:gap-64 w-full mt-24 pb-10">
              <div className="flex flex-col items-center text-center group z-10">
                <div className="mb-6">
                  <h4 className="text-lg font-black uppercase italic tracking-tighter text-white">Entrevista en TV Nacional</h4>
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mt-1 flex items-center justify-center gap-2">
                    <Youtube className="w-4 h-4" /> Esta Noche Mariasela
                  </p>
                </div>
                <a 
                  href="https://youtu.be/JUKMssSNpE8?si=TDflA-3fEz2Lfg9v" 
                  target="_blank" 
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-600/30 hover:scale-110 hover:bg-blue-500 transition-all"
                >
                  <Play className="w-10 h-10 text-white fill-white ml-1" />
                </a>
              </div>

              <div className="flex flex-col items-center text-center group z-10">
                <div className="mb-6">
                  <h4 className="text-lg font-black uppercase italic tracking-tighter text-white">Tecnología e Inclusión</h4>
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mt-1 flex items-center justify-center gap-2">
                    <Youtube className="w-4 h-4" /> ViaTecnológica
                  </p>
                </div>
                <a 
                  href="https://youtu.be/CBO24x7Xr8U?si=9CqqGqBIAigBJfDp" 
                  target="_blank" 
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-amber-500 flex items-center justify-center shadow-2xl shadow-amber-500/30 hover:scale-110 hover:bg-amber-400 transition-all"
                >
                  <Play className="w-10 h-10 text-slate-900 fill-slate-900 ml-1" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MANIFIESTO */}
      <section className="py-32 px-6 bg-[#050b16] border-y border-white/5 relative">
        <div className="absolute top-10 left-10 opacity-5 pointer-events-none"><Quote className="w-64 h-64 rotate-180" /></div>
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-6">
            <h3 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-white underline decoration-blue-500/30 underline-offset-8 decoration-4">¿Por qué esta rifa?</h3>
            <p className="text-xl md:text-2xl font-serif italic text-blue-100/90 leading-relaxed max-w-3xl mx-auto">
              Además de superar las limitaciones sistémicas y poder capacitarme formalmente, debido a mi performance siempre he querido formarme en una gran universidad. Llegué hasta aquí por mérito propio; pero el siguiente paso requiere apoyo.
            </p>
            <p className="text-xl md:text-2xl font-serif italic text-blue-100/90 leading-relaxed max-w-3xl mx-auto">
              Más allá de la universidad, pretendo crear tecnología con impacto social e inclusivo, abriendo oportunidades reales en startups, investigación y accesibilidad. De manera que la formación universitaria no es un lujo, es el siguiente paso necesario para generar dicho impacto.
            </p>
          </div>
        </div>
      </section>

      {/* PREMIOS */}
      <section className="py-32 px-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-20">¿QUÉ <span className="text-amber-400">GANARÁS?</span></h2>
          <div className="grid md:grid-cols-4 gap-8">
            {premios.map((p, i) => (
              <div key={i} className={`p-8 rounded-[3rem] border border-white/10 flex flex-col items-center bg-white/5 hover:border-blue-500/50 transition-all group ${p.especial ? 'ring-2 ring-amber-500/30' : ''}`}>
                <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-6">{p.lugar}</div>
                <div className="h-48 flex items-center justify-center relative mb-8">
                  {p.especial && <Lock className="absolute z-10 w-12 h-12 text-amber-500" />}
                  <img src={p.img} className={`max-h-full transition-transform group-hover:scale-110 ${p.especial ? 'grayscale blur-sm opacity-30' : ''}`} alt={p.nombre} />
                </div>
                <h4 className={`text-xl font-black uppercase tracking-tighter leading-tight ${p.especial ? 'text-amber-500' : 'text-white'}`}>{p.nombre}</h4>
                <p className="text-[9px] font-bold text-white/30 uppercase mt-4">{p.disponibilidad}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOQUE DETERMINANTE ANTES DE PLANES */}
      <section className="pt-32 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-xl md:text-2xl text-white font-medium italic mb-2">Este no es un apoyo simbólico.</p>
          <p className="text-2xl md:text-3xl text-blue-400 font-black uppercase tracking-tighter">Es el paso que determina si este hito ocurre o no.</p>
        </div>
      </section>

      {/* PLANES */}
      <section id="planes" className="py-24 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter mb-24 leading-none">ELIGE TU <span className="text-blue-400">IMPACTO</span></h2>
          <div className="grid md:grid-cols-4 gap-6 items-end mb-32">
            {plans.map((p, i) => (
              <div key={i} className={`p-10 rounded-[40px] border-2 flex flex-col text-left transition-all relative ${p.featured ? 'scale-105 md:scale-110 -translate-y-6 z-10 shadow-3xl' : 'hover:-translate-y-2'} ${p.color}`}>
                {p.tag && <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-widest">{p.tag}</span>}
                <h3 className="text-3xl font-black uppercase tracking-tighter mb-2">{p.name}</h3>
                <div className="text-[10px] font-bold opacity-60 mb-6 italic">{p.tickets}</div>
                <div className="text-4xl font-black mb-8 tracking-tighter">{p.price}</div>
                <p className="text-xs font-bold mb-10 opacity-90 uppercase leading-relaxed flex-grow">{p.benefit}</p>
                <a href={p.url} target="_blank" className={`w-full py-5 rounded-3xl font-black text-center text-[10px] uppercase tracking-widest ${p.color.includes('text-slate-900') ? 'bg-slate-900 text-white' : 'bg-white/20'}`}>SELECCIONAR</a>
              </div>
            ))}
          </div>

          <div className="max-w-4xl mx-auto bg-blue-600/5 border border-white/5 rounded-[4rem] p-10 md:p-20 mb-32">
            <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-12 leading-none">HOY DECIDES QUÉ <span className="text-blue-400">CONSTRUIR.</span></h2>
            <div className="max-w-md mx-auto space-y-4 mb-12">
              {[
                { label: 'EL TALENTO DOMINICANO', key: 'talento' },
                { label: 'LA TECNOLOGÍA COMO MOTOR', key: 'tecnologia' },
                { label: 'LA INCLUSIÓN REAL', key: 'inclusion' }
              ].map((v, i) => (
                <div 
                  key={i} 
                  onClick={() => toggleValue(v.key)} 
                  className={`flex items-center gap-4 p-6 rounded-3xl border-2 cursor-pointer transition-all ${agreedValues[v.key] ? 'bg-blue-600 border-blue-400' : 'bg-white/5 border-white/10'}`}
                >
                  <Check className={`w-6 h-6 ${agreedValues[v.key] ? 'text-white' : 'text-transparent'}`} />
                  <span className="font-black uppercase tracking-tighter text-lg">{v.label}</span>
                </div>
              ))}
            </div>

            {/* FRASE DE CIERRE ROTUNDO */}
            <p className="text-lg md:text-xl text-blue-100/70 font-bold italic mb-8 max-w-2xl mx-auto leading-relaxed">
              “El apoyo que reciba en esta etapa define si puedo llegar a la universidad este año o no.”
            </p>

            <a 
              href={allChecked ? "https://wa.me/18295705985?text=Hola!%20He%20completado%20el%20manifiesto%20y%20quiero%20apoyar%20tu%20camino%20a%20Colorado." : "#"} 
              className={`w-full py-8 rounded-3xl font-black text-2xl flex items-center justify-center gap-4 shadow-2xl transition-all ${allChecked ? 'bg-green-600 hover:scale-105' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
            >
               SUMAR UNA MILLA {allChecked && <ChevronRight />}
            </a>
          </div>

          {/* PREGUNTAS FRECUENTES (FAQS) */}
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
                  {openFaq === i && (
                    <div className="pb-4 text-blue-100/60 leading-relaxed text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="py-24 border-t border-white/5 bg-[#071120] text-center">
        <div className="max-w-7xl mx-auto space-y-12 px-6">
          <div className="flex flex-wrap justify-center gap-4">
            <a href="https://instagram.com/mich_eusebio" target="_blank" className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-lg"><Instagram /></a>
            <a href="https://www.youtube.com/live/F02FrEz-HhA?si=15MvolC65KgH7CpD" target="_blank" className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-lg"><Youtube /></a>
            <a href="https://wa.me/18295705985" target="_blank" className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-lg"><MessageCircle /></a>
            <a href="mailto:michaeleusebiodelorbe@gmail.com" className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-lg"><Mail /></a>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">© 2024 Michael Eusebio · Menos Millas Universitarias</p>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@1,400;1,700&display=swap');
        .font-serif { font-family: 'Crimson Pro', serif; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-in-from-top-2 { from { transform: translateY(-0.5rem); } to { transform: translateY(0); } }
        .animate-in { animation: fade-in 0.3s ease-out forwards, slide-in-from-top-2 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default App;