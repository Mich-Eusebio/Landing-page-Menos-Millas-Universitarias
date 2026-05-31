"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Instagram, MessageCircle, Download, Linkedin, Share2 } from 'lucide-react'
import { toPng } from 'html-to-image';

const GraciasPage = () => {
  const [shareData, setShareData] = useState(null)
  const cardRef = useRef(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('mm_share')
      if (raw) {
        const data = JSON.parse(raw)
        if (Date.now() - data.timestamp < 86400000) {
          setShareData(data)
        }
        localStorage.removeItem('mm_share')
      }
    } catch {}
  }, [])

  const dayNumber = shareData?.dayNumber || 0
  const name = shareData?.name || ''
  const photoUrl = shareData?.photoUrl || null
  const personalize = shareData?.personalize ?? true

  const shareText = `¡Patrociné el día #${dayNumber} del camino de Michael! 🎉\n\nÚnete y apoya este proyecto.`
  const shareOgUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/gracias?day=${encodeURIComponent(dayNumber)}&name=${encodeURIComponent(name)}&photo=${encodeURIComponent(photoUrl || '')}`
    : ''

  const generateShareFile = async () => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const dataUrl = await toPng(cardRef.current, {
      cacheBust: true,
      backgroundColor: '#0a1628',
    })
    const res = await fetch(dataUrl)
    const blobData = await res.blob()
    return new File([blobData], `patrocinio-dia-${dayNumber}.png`, { type: 'image/png' })
  }

  const handleShareImage = async () => {
    try {
      const file = await generateShareFile()
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Menos Millas', text: shareText })
      } else {
        const url = URL.createObjectURL(file)
        const a = document.createElement('a')
        a.href = url
        a.download = file.name
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch {}
  }

  const handleShareWhatsApp = async () => {
    try {
      const file = await generateShareFile()
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Menos Millas', text: shareText })
      } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareOgUrl)}`, '_blank')
      }
    } catch {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareOgUrl)}`, '_blank')
    }
  }

  const handleShareLinkedIn = () => {
    window.open(`https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareOgUrl)}`, '_blank')
  }

  const handleDownloadImage = async () => {
    try {
      const file = await generateShareFile()
      const url = URL.createObjectURL(file)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      a.click()
      URL.revokeObjectURL(url)
    } catch {}
  }

  return (
    <div className="min-h-screen bg-[#0a192f] text-slate-100 font-sans selection:bg-blue-500 selection:text-white relative overflow-hidden flex flex-col items-center justify-center p-6 text-center">
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/10 blur-[120px] rounded-full"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl mx-auto space-y-12 relative z-10"
      >
        <div className="flex justify-center">
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-32 h-32 bg-blue-600/20 rounded-full blur-2xl absolute inset-0"
            ></motion.div>
            <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-600/40 relative border border-white/20">
              <Heart className="w-12 h-12 text-white fill-white animate-pulse" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest">
            <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> ¡Hito Completado!</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none text-white">
            ¡GRACIAS POR <span className="text-blue-400 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-500">CREER!</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100/70 leading-relaxed font-medium">
            Tu aporte no es solo una contribución, es el combustible que hace real esta historia. Acabas de asegurar un día más en mi camino profesional.
          </p>
        </div>

        {/* Share Card */}
        {shareData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-6"
          >
            <div
              ref={cardRef}
              className="w-full bg-gradient-to-br from-[#0a1628] to-[#1a2a4a] rounded-3xl overflow-hidden border border-blue-500/20 shadow-2xl mx-auto"
              style={{ maxWidth: 480 }}
            >
              {/* Brand bar */}
              <div className="bg-blue-600/20 px-6 py-3 flex items-center gap-2 border-b border-blue-500/10">
                <div className="w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-[8px] font-black text-white">MM</span>
                </div>
                <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Menos Millas Universitarias</span>
              </div>

              {/* Body */}
              <div className="px-6 py-8 text-center space-y-4">
                {/* Photo */}
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-0.5">
                    <div className="w-full h-full rounded-full bg-[#0a1628] flex items-center justify-center overflow-hidden">
                      {photoUrl ? (
                        <img src={photoUrl} alt="" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <span className="text-2xl font-black text-blue-400 italic">
                          {name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Text */}
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Patrociné el</p>
                  <p className="text-5xl font-black text-white italic tracking-tighter leading-none">
                    DÍA <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">#{dayNumber}</span>
                  </p>
                  <p className="text-sm font-black text-white/80 uppercase tracking-widest">Del Camino de Michael</p>
                </div>

                {/* Name */}
                {personalize && (
                  <div className="pt-2">
                    <div className="w-12 h-0.5 bg-blue-500/50 mx-auto mb-2" />
                    <p className="text-base font-black text-white italic tracking-tight">{name}</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-blue-600/10 px-6 py-3 border-t border-blue-500/10">
                <p className="text-[9px] font-bold text-blue-400/60 uppercase tracking-widest text-center">
                  menosmillas.com
                </p>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="space-y-3 max-w-lg mx-auto">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest text-center">
                Comparte tu patrocinio
              </p>
              <div className="flex gap-2">
                <button onClick={handleShareWhatsApp} className="flex-1 bg-green-600 hover:bg-green-500 text-white font-black text-[10px] uppercase tracking-widest py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </button>
                <button onClick={handleShareLinkedIn} className="flex-1 bg-blue-700 hover:bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </button>
                <button onClick={handleDownloadImage} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-black text-[10px] uppercase tracking-widest py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Guardar
                </button>
              </div>
              <p className="text-[9px] text-white/30 text-center font-medium">
                O toma un screenshot para compartir en Instagram
              </p>
            </div>
          </motion.div>
        )}

        <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-sm space-y-6">
          <p className="text-sm font-black uppercase tracking-widest text-blue-400">¿Qué sigue ahora?</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-6 bg-slate-900/50 rounded-2xl border border-white/5 text-left space-y-2">
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <Instagram className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-sm font-bold text-white">Actualización en IG</p>
              <p className="text-xs text-blue-100/40 leading-relaxed">Publicaré tu nombre en mis historias como patrocinador oficial.</p>
            </div>
            <div className="p-6 bg-slate-900/50 rounded-2xl border border-white/5 text-left space-y-2">
              <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-sm font-bold text-white">Mensaje Personal</p>
              <p className="text-xs text-blue-100/40 leading-relaxed">Cuando llegue ese día, recibirás un mensaje especial desde el campus.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link href="/" className="px-10 py-5 bg-white text-[#0a192f] font-black rounded-2xl shadow-xl hover:scale-105 transition-all uppercase tracking-widest text-xs">
            Volver al Inicio
          </Link>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Menos Millas Universitarias',
                  text: '¡Acabo de patrocinar un día de estudios de Michael Eusebio! Únete tú también.',
                  url: 'https://millasmichael.do/comprame-un-dia'
                });
              }
            }}
            className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 hover:scale-105 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" /> Compartir Proyecto
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default GraciasPage;
