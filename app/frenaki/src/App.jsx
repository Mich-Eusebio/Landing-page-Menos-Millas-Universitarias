import React, { useState } from 'react'
import CheckoutModal from './CheckoutModal.jsx'
import BusinessCheckoutModal from './BusinessCheckoutModal.jsx'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  Users, 
  Camera, 
  Coffee, 
  ThumbsUp, 
  ThumbsDown, 
  CheckCircle2, 
  Zap, 
  Compass,
  ArrowRight,
  Flame,
  Music,
  Star
} from 'lucide-react'

// --- Components ---

const Navbar = () => (
  <nav className="glass" style={{ position: 'fixed', top: 0, width: '100%', zIndex: 100, padding: '20px 0' }}>
    <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--white)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '36px', height: '36px', background: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Flame size={22} color="var(--secondary)" fill="var(--secondary)" />
        </div>
        Frenaki
      </div>
      <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
        <a href="#features" style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Features</a>
        <a href="#pricing" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '0.85rem' }}>DIME DONDE FRENO</a>
      </div>
    </div>
  </nav>
)

const Hero = () => (
  <header style={{ 
    height: '100vh', 
    position: 'relative', 
    display: 'flex', 
    alignItems: 'center', 
    overflow: 'hidden',
    background: 'var(--bg-darker)' 
  }}>
    <div className="glow-bg animate-pulse-glow" style={{ top: '-10%', right: '-10%', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)' }} />
    <div className="glow-bg animate-pulse-glow" style={{ bottom: '-10%', left: '-10%', background: 'radial-gradient(circle, rgba(255, 200, 61, 0.15) 0%, transparent 70%)' }} />
    
    <div className="container" style={{ position: 'relative', zIndex: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '100px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Star size={14} fill="var(--primary)" color="var(--primary)" />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px' }}>DESCUBRIMIENTO ESPONTÁNEO</span>
        </div>
        <h1 style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', marginBottom: '24px', lineHeight: 1 }}>
          ¿Cansado de no saber qué hacer entre el <span className="highlight">coro de panas?</span>
        </h1>
        <p style={{ fontSize: '1.4rem', color: 'var(--text-muted)', marginBottom: '48px', maxWidth: '600px' }}>
          La app que te manda experiencias sorpresa cerca de ti en segundos. Sin estrés. Sin discutir. <span style={{ color: 'white' }}>Solo aventura.</span>
        </p>
        
        <div style={{ display: 'flex', gap: '20px' }}>
          <a href="#pricing" className="btn btn-primary">SORPRÉNDEME AHORA</a>
          <a href="#how" className="btn btn-outline">¿Cómo funciona?</a>
        </div>

        <div style={{ marginTop: '40px', display: 'flex', gap: '30px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="var(--primary)" /> Pago único</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} color="var(--primary)" /> +100 spots en RD</div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        style={{ position: 'relative' }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, rgba(255,200,61,0.2) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: -1 }} />
        <img 
          src="/assets/frenaki/dark_hero.png" 
          alt="Nightlife Discovery" 
          style={{ width: '100%', borderRadius: '40px', boxShadow: '0 40px 100px rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)' }} 
        />
        <div className="glass" style={{ position: 'absolute', bottom: '40px', left: '-40px', padding: '24px', borderRadius: '24px', maxWidth: '280px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Music size={20} color="black" />
            </div>
            <div>
              <div style={{ fontWeight: 800 }}>Destino Desbloqueado</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Rooftop Secreto • 1.2km</div>
            </div>
          </div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>🔥 "Perfecto para date night"</div>
        </div>
      </motion.div>
    </div>
  </header>
)

const PainSection = () => (
  <section className="section-padding" style={{ background: 'var(--secondary)' }}>
    <div className="container">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '3.5rem', marginBottom: '32px' }}>Siempre pasa lo mismo…</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {[
              { icon: <Camera />, title: 'El scroll infinito', desc: 'Abres Instagram buscando qué hacer y terminas viendo gente que sí salió.' },
              { icon: <Compass />, title: 'La parálisis del coro', desc: 'Nadie decide nada. 2 horas en el chat y todavía no hay plan.' },
              { icon: <MapPin />, title: 'La zona de confort', desc: 'Terminan yendo al mismo sitio de siempre por falta de ideas.' }
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '20px' }}>
                <div style={{ color: 'var(--primary)', paddingTop: '5px' }}>{item.icon}</div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{item.title}</h3>
                  <p style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{ padding: 0, overflow: 'hidden', border: 'none' }}>
          <img src="/assets/frenaki/friends_food.png" alt="Boring night" style={{ width: '100%', opacity: 0.7 }} />
          <div style={{ padding: '32px', textAlign: 'center' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>Y ahí muere el día perfecto para un coro.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
)

const SolutionSection = () => (
  <section id="how" className="section-padding" style={{ background: 'var(--bg-darker)', position: 'relative', overflow: 'hidden' }}>
    <div className="glow-bg animate-pulse-glow" style={{ top: '20%', right: '-10%', background: 'radial-gradient(circle, rgba(255, 200, 61, 0.08) 0%, transparent 70%)' }} />
    
    <div className="container">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '100px', alignItems: 'center' }}>
        {/* Left Column: Text & Filters */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 style={{ fontSize: '4rem', marginBottom: '24px', lineHeight: 1.1 }}>
            Nosotros decidimos <span className="highlight">por ti.</span>
          </h2>
          <p style={{ fontSize: '1.3rem', color: 'var(--text-muted)', marginBottom: '48px', maxWidth: '500px' }}>
            Solo eliges tus preferencias y Frenaki hace la magia. Sin estrés, sin discusiones, solo aventura.
          </p>

          {/* Filter Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            {[
              { label: 'Presupuesto', value: 'RD$500–1500', icon: '💰' },
              { label: 'Distancia', value: '10km', icon: '📍' },
              { label: 'Mood', value: 'Chill', icon: '🍹' },
              { label: 'Compañía', value: 'Pareja', icon: '💑' }
            ].map((pill, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.05, borderColor: 'var(--primary)' }}
                style={{ 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  padding: '16px 24px', 
                  borderRadius: '100px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{pill.label}</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>{pill.icon} {pill.value}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Column: High-End Mockup */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
          {/* Floating Glassmorphism Cards */}
          {[
            { text: 'Food Spot', top: '15%', left: '-25%', delay: 0 },
            { text: 'Hidden Cafe', bottom: '25%', right: '-25%', delay: 0.4 },
            { text: 'Activity', top: '45%', right: '-30%', delay: 0.8 }
          ].map((bubble, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 5, repeat: Infinity, delay: bubble.delay, ease: 'easeInOut' }}
              style={{ 
                position: 'absolute', 
                top: bubble.top, 
                bottom: bubble.bottom, 
                left: bubble.left, 
                right: bubble.right,
                padding: '16px 28px',
                borderRadius: '20px',
                fontSize: '0.95rem',
                fontWeight: 700,
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                zIndex: 10,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)' }} />
              {bubble.text}
            </motion.div>
          ))}

          {/* iPhone 15 Pro Frame */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            style={{ 
              width: '320px', 
              height: '650px',
              background: '#1a1a1a',
              borderRadius: '55px',
              padding: '10px',
              position: 'relative',
              boxShadow: '0 50px 100px -20px rgba(0,0,0,0.8), inset 0 0 2px rgba(255,255,255,0.2)',
              border: '2px solid #333'
            }}
          >
            {/* Screen */}
            <div style={{ 
              background: '#0F0F0F', 
              borderRadius: '45px', 
              height: '100%', 
              width: '100%',
              overflow: 'hidden',
              position: 'relative',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              {/* Dynamic Island */}
              <div style={{ 
                position: 'absolute', 
                top: '12px', 
                left: '50%', 
                transform: 'translateX(-50%)', 
                width: '85px', 
                height: '25px', 
                background: 'black', 
                borderRadius: '20px',
                zIndex: 20
              }} />

              {/* Internal Content */}
              <div style={{ padding: '45px 20px 20px' }}>
                <div style={{ 
                  fontSize: '0.7rem', 
                  fontWeight: 900, 
                  color: 'var(--primary)', 
                  letterSpacing: '2px', 
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <MapPin size={10} fill="var(--primary)" /> DESTINO DESBLOQUEADO
                </div>
                
                <h3 style={{ fontSize: '2.2rem', marginBottom: '20px', lineHeight: 1.1 }}>
                  🔥 Rooftop <br/> Secreto
                </h3>

                {/* Location Card */}
                <div style={{ 
                  background: '#1A1A1A', 
                  borderRadius: '28px', 
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.08)',
                  marginBottom: '24px'
                }}>
                  <div style={{ position: 'relative' }}>
                    <img src="/assets/frenaki/dark_hero.png" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', padding: '6px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800 }}>
                      ⭐ 4.9
                    </div>
                  </div>
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      <MapPin size={12} /> Zona Colonial, SD
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ background: 'rgba(255,200,61,0.1)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700 }}>Chill</span>
                      <span style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--accent)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700 }}>Date Night</span>
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '32px', textAlign: 'center' }}>
                  "Este lugar tiene la mejor vista de la Zona Colonial. Ideal para empezar la noche."
                </p>

                <button className="btn btn-primary" style={{ width: '100%', borderRadius: '20px', padding: '18px', fontSize: '0.9rem', boxShadow: '0 10px 20px rgba(255,200,61,0.2)' }}>
                  REVELAR UBICACIÓN
                </button>
              </div>

              {/* Home Indicator */}
              <div style={{ 
                position: 'absolute', 
                bottom: '10px', 
                left: '50%', 
                transform: 'translateX(-50%)', 
                width: '100px', 
                height: '4px', 
                background: 'rgba(255,255,255,0.2)', 
                borderRadius: '10px' 
              }} />
            </div>
          </motion.div>
          
          {/* Subtle Glow behind phone */}
          <div style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            width: '400px', 
            height: '400px', 
            background: 'radial-gradient(circle, rgba(255, 200, 61, 0.1) 0%, transparent 70%)',
            zIndex: -1,
            filter: 'blur(40px)'
          }} />
        </div>
      </div>
    </div>
  </section>
)

const FutureFeatures = () => {
  const features = [
    { 
      name: '“Modo cita”', 
      desc: 'Planes románticos curados para impresionar.', 
      color: '#FF5FA2', 
      icon: '💖', 
      badge: '🔥 Trending' 
    },
    { 
      name: '“Roadtrip sorpresa”', 
      desc: 'Destinos fuera de la ciudad para el fin de semana.', 
      color: '#3B82F6', 
      icon: '🌴', 
      badge: '✨ Nuevo' 
    },
    { 
      name: '“Sorpréndeme en menos de RD$1,000”', 
      desc: 'Filtro de presupuesto estricto para salidas diarias.', 
      color: '#FFC83D', 
      icon: '🎉', 
      badge: '💎 Ahorro' 
    }
  ]

  return (
    <section id="features" className="section-padding">
      <div className="container">
        <div style={{ marginBottom: '60px' }}>
          <h2 className="text-center" style={{ marginBottom: '16px', fontSize: '3.5rem' }}>Vota por lo que viene</h2>
          <p className="text-center" style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Tú decides el futuro de Frenaki.</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
          {features.map((feature, i) => (
            <motion.div 
              key={i} 
              whileHover={{ 
                y: -15, 
                boxShadow: `0 20px 40px -10px ${feature.color}33`,
                borderColor: `${feature.color}66`
              }}
              className="card" 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
                borderTop: `4px solid ${feature.color}`
              }}
            >
              {/* Decorative Glow */}
              <div style={{ 
                position: 'absolute', 
                top: '-20%', 
                right: '-20%', 
                width: '150px', 
                height: '150px', 
                background: `radial-gradient(circle, ${feature.color}11 0%, transparent 70%)`,
                pointerEvents: 'none'
              }} />

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                  <div style={{ fontSize: '3rem' }}>{feature.icon}</div>
                  <div className="glass" style={{ 
                    padding: '6px 14px', 
                    borderRadius: '100px', 
                    fontSize: '0.75rem', 
                    fontWeight: 800,
                    border: `1px solid ${feature.color}33`,
                    color: feature.color
                  }}>
                    {feature.badge}
                  </div>
                </div>
                <h3 style={{ marginBottom: '12px', color: 'white', fontSize: '1.6rem' }}>{feature.name}</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '1rem', lineHeight: '1.6' }}>{feature.desc}</p>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <button className="btn-outline" style={{ 
                  flex: 1, 
                  padding: '14px', 
                  borderRadius: '16px', 
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <ThumbsUp size={18} /> Like
                </button>
                <button className="btn-outline" style={{ 
                  flex: 1, 
                  padding: '14px', 
                  borderRadius: '16px', 
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <ThumbsDown size={18} /> Dislike
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

const Pricing = ({ onOpenModal }) => (
  <section id="pricing" className="section-padding" style={{ background: 'var(--bg-darker)' }}>
    <div className="container">
      <h2 className="text-center" style={{ fontSize: '3.5rem', marginBottom: '80px' }}>Únete a la exploración</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '40px', maxWidth: '1000px', margin: '0 auto' }}>
        {/* User Plan */}
        <motion.div whileHover={{ scale: 1.02 }} className="card glass" style={{ border: '1px solid var(--primary)', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '24px', right: '24px', background: 'var(--primary)', color: 'black', padding: '4px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 900 }}>TOP</div>
          <h3 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>PLAN USUARIO</h3>
          <div style={{ fontSize: '4rem', fontWeight: 900, marginBottom: '8px' }}>RD$500</div>
          <p style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '32px', letterSpacing: '1px' }}>PAGO ÚNICO</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px' }}>
            {['Acceso completo', 'Recomendaciones sorpresa', 'Experiencias locales', 'Vota en el roadmap'].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem' }}>
                <CheckCircle2 size={20} color="var(--primary)" /> {item}
              </div>
            ))}
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={onOpenModal}>OBTENER ACCESO</button>
        </motion.div>

        {/* Business Plan */}
        <motion.div whileHover={{ scale: 1.02 }} className="card" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h3 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>NEGOCIO LOCAL</h3>
          <div style={{ fontSize: '4rem', fontWeight: 900, marginBottom: '8px' }}>RD$2,000</div>
          <p style={{ fontWeight: 700, color: 'var(--text-muted)', marginBottom: '32px', letterSpacing: '1px' }}>PAGO ÚNICO</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px' }}>
            {['Aparecer en descubrimientos', 'Tráfico nuevo garantizado', 'Exposición local premium', 'Visibilidad en la app'].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem' }}>
                <Zap size={20} color="var(--primary)" /> {item}
              </div>
            ))}
          </div>
          <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => onOpenModal('business')}>REGISTRAR NEGOCIO</button>
        </motion.div>
      </div>
    </div>
  </section>
)

const FinalCTA = () => (
  <section className="section-padding" style={{ position: 'relative', overflow: 'hidden' }}>
    <div className="glow-bg" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(255, 200, 61, 0.05) 0%, transparent 70%)' }} />
    <div className="container text-center" style={{ position: 'relative', zIndex: 1 }}>
      <h2 style={{ fontSize: '4rem', marginBottom: '32px', maxWidth: '900px', margin: '0 auto 40px' }}>
        “Tu próxima salida ya existe. Solo falta descubrirla.”
      </h2>
      <button className="btn btn-primary" style={{ fontSize: '1.5rem', padding: '24px 80px' }}>
        DIME DONDE FRENO! <ArrowRight size={24} />
      </button>
    </div>
  </section>
)

const Footer = () => (
  <footer style={{ background: 'var(--bg-darker)', color: 'var(--text-muted)', padding: '80px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '40px' }}>
        <div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'white', marginBottom: '16px' }}>Frenaki</div>
          <p style={{ maxWidth: '300px' }}>Rompiendo la rutina en República Dominicana, una sorpresa a la vez.</p>
        </div>
        <div style={{ display: 'flex', gap: '60px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ color: 'white', fontWeight: 700 }}>APP</span>
            <a href="#">Download</a>
            <a href="#">Spots</a>
            <a href="#">Pricing</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ color: 'white', fontWeight: 700 }}>SOCIAL</span>
            <a href="#">TikTok</a>
            <a href="#">Instagram</a>
            <a href="#">Twitter</a>
          </div>
        </div>
      </div>
      <div style={{ marginTop: '80px', textAlign: 'center', fontSize: '0.8rem' }}>
        &copy; 2026 Frenaki. Hecho con 🔥 para los que no quieren aburrirse.
      </div>
    </div>
  </footer>
)

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false)

  const handleOpenModal = (type) => {
    if (type === 'business') {
      setIsBusinessModalOpen(true)
    } else {
      setIsModalOpen(true)
    }
  }

  return (
    <div>
      <Navbar />
      <Hero />
      <PainSection />
      <SolutionSection />
      <FutureFeatures />
      <Pricing onOpenModal={handleOpenModal} />
      <FinalCTA />
      <Footer />
      <CheckoutModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <BusinessCheckoutModal isOpen={isBusinessModalOpen} onClose={() => setIsBusinessModalOpen(false)} />
    </div>
  )
}

export default App
