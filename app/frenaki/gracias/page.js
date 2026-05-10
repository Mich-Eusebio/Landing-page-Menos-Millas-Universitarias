'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, CheckCircle2, Zap, MapPin, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react'
import '../src/index.css'

export default function FrenakiGracias() {
  const whatsappLink = "https://wa.me/18295705985?text=%F0%9F%94%A5%20Hola%20Frenaki%20%F0%9F%91%80%0A%0AYa%20hice%20el%20pago%20y%20estoy%20listo%20para%20descubrir%20d%C3%B3nde%20frenar%20hoy.%0A%0AMi%20mood%20es%3A%0A%5Bescribe%20aqu%C3%AD%20%F0%9F%98%8E%5D%0A%0AEstoy%20saliendo%20con%3A%0A%5Bpareja%2Famigos%2Ffamilia%2Fsolo%5D%0A%0AMi%20presupuesto%20aproximado%20es%3A%0A%5BRD%24___%5D%0A%0AY%20quiero%20una%20experiencia%3A%0A%5Bcerca%2Fmedia%2Flarga%5D%0A%0A%F0%9F%8E%B2%20Sorpr%C3%A9ndeme."

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#090909', 
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Glows */}
      <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255, 200, 61, 0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass"
        style={{
          maxWidth: '700px',
          width: '100%',
          padding: '60px 40px',
          borderRadius: '40px',
          border: '1px solid rgba(255, 200, 61, 0.1)',
          textAlign: 'center',
          boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div style={{ display: 'inline-flex', padding: '15px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '50%', marginBottom: '24px' }}>
          <CheckCircle2 size={40} color="#4ade80" />
        </div>

        <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '16px', lineHeight: 1.1 }}>
          🎉 Pago recibido
        </h1>
        
        <h2 style={{ fontSize: '1.6rem', color: '#FFC83D', marginBottom: '40px', fontWeight: 800 }}>
          Hoy no vas a terminar en el mismo sitio de siempre.
        </h2>

        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '24px', padding: '32px', marginBottom: '48px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ fontSize: '1.1rem', color: '#cbd5e0', marginBottom: '24px', lineHeight: 1.6 }}>
            Tu experiencia sorpresa ya está desbloqueada.<br/>
            Ahora necesitamos conocer tu <span style={{ color: '#fff', fontWeight: 800 }}>vibe</span> para encontrar dónde frenar hoy 👀
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start', maxWidth: '300px', margin: '0 auto' }}>
            {[
              { text: 'No tienes que planear', icon: '❌' },
              { text: 'No tienes que buscar lugares', icon: '❌' },
              { text: 'No tienes que discutir qué hacer', icon: '❌' }
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#a0aec0', fontSize: '0.95rem' }}>
                <span style={{ fontSize: '1.2rem' }}>{item.icon}</span> {item.text}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '32px', padding: '20px', background: 'rgba(255, 200, 61, 0.05)', borderRadius: '16px', border: '1px dashed rgba(255, 200, 61, 0.2)' }}>
            <p style={{ fontWeight: 700, color: '#FFC83D', marginBottom: '8px' }}>Solo dinos:</p>
            <p style={{ color: '#fff', fontSize: '1.1rem' }}>
              Mood + Presupuesto + Distancia
            </p>
            <p style={{ marginTop: '12px', color: '#718096', fontSize: '0.9rem' }}>...y Frenaki hace la magia ✨</p>
          </div>
        </div>

        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px' }}>
          👀 ¿Listo para descubrir dónde frenar hoy?
        </h3>

        <motion.a 
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            background: '#25D366',
            color: '#000',
            padding: '24px 40px',
            borderRadius: '20px',
            fontSize: '1.2rem',
            fontWeight: 900,
            textDecoration: 'none',
            boxShadow: '0 20px 40px rgba(37, 211, 102, 0.2)',
            marginBottom: '32px'
          }}
        >
          <MessageCircle size={24} fill="currentColor" />
          HABLAR CON FRENAKI POR WHATSAPP
        </motion.a>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
          gap: '16px',
          paddingTop: '32px',
          borderTop: '1px solid rgba(255,255,255,0.05)'
        }}>
          {[
            { text: 'Respuesta rápida', icon: <Zap size={16} /> },
            { text: 'Lugares reales en RD', icon: <MapPin size={16} /> },
            { text: 'Personalizado', icon: <Sparkles size={16} /> },
            { text: 'Destinos seguros', icon: <ShieldCheck size={16} /> }
          ].map((feat, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#718096', fontSize: '0.8rem', fontWeight: 600 }}>
              <div style={{ color: '#FFC83D' }}>{feat.icon}</div>
              {feat.text}
            </div>
          ))}
        </div>
      </motion.div>

      <motion.a 
        href="/frenaki"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        style={{ marginTop: '40px', color: '#4a5568', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
      >
        Volver a la landing <ArrowRight size={14} />
      </motion.a>
    </div>
  )
}
