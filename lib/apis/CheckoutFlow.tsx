'use client'
import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Landmark, Upload, Loader2, Copy, Image as ImageIcon, ChevronRight } from 'lucide-react'
import { saveSoldDays, saveComprameUnDia, uploadFile, getSoldDays } from '@/lib/apis/SorteoActions'

export default function CheckoutFlow({ selectedDays }) {
  const [step, setStep] = useState(1)
  const sponsorInputRef = useRef(null)
  const nameRef = useRef(null)
  const phoneRef = useRef(null)
  const [formData, setFormData] = useState({
    personalize: true,
    sponsor_name: '',
    email: '',
    instagram: '',
    phone: '',
    message: '',
    tooltip_message: '',
    link: '',
    photoFile: null,
    proof: null,
    bankSelection: 'popular',
    terms: false,
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const TOTAL_STEPS = 6
  const n = selectedDays?.reduce((sum, d) => sum + (d.slot === 'full' ? 1 : 0.5), 0) || 0
  const showMessageField = n >= 5
  const charLimit = n === 5 ? 30 : (n <= 10 ? 60 : 120)

  const getTierId = (count) => {
    const slot = count % 1 !== 0 ? 'half' : null
    if (slot === 'half') return 'HalfDay'
    if (count === 1) return 'DreamDay'
    if (count >= 2 && count <= 6) return 'CareerSprint'
    if (count === 7) return 'PushWeek'
    if (count <= 30) return 'SupportJourney'
    return 'LegacyMonth'
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSponsorPhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFormData(prev => ({ ...prev, photoFile: file }))
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, proof: e.target.files[0] }))
    }
  }

  const handleNext = () => {
    if (step === 1) {
      setStep(formData.personalize ? 2 : 5)
    } else if (step === 2) {
      if (!formData.sponsor_name.trim()) {
        setErrors({ sponsor_name: 'El nombre es obligatorio' })
        nameRef.current?.focus()
        return
      }
      if (!formData.phone.trim()) {
        setErrors({ phone: 'El teléfono es obligatorio' })
        phoneRef.current?.focus()
        return
      }
      setStep(3)
    } else {
      setStep(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (step === 2) {
      setStep(1)
    } else if (step === 5 && !formData.personalize) {
      setStep(1)
    } else {
      setStep(prev => prev - 1)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.terms) return

    if (formData.personalize && !formData.sponsor_name.trim()) {
      setErrors({ sponsor_name: 'Por favor, ingresa tu nombre.' })
      setStep(2)
      return
    }

    setLoading(true)
    try {
      const latestSoldDays = await getSoldDays()
      const latestSoldMap = Object.fromEntries(latestSoldDays.map(d => [d.dateStr, d]))

      const conflicted = selectedDays.filter(d => {
        const sold = latestSoldMap[d.dateStr]
        return sold && (sold.nombre || sold.foto_url)
      })

      if (conflicted.length > 0) {
        alert(`⚠️ Lo sentimos, estos días acaban de ser adquiridos: ${conflicted.map(d => d.dateStr).join(', ')}. Por favor revisa el calendario.`)
        setLoading(false)
        return
      }

      let sponsor_foto_url = null
      if (formData.photoFile) {
        const data = new FormData()
        data.append('file', formData.photoFile)
        data.append('path', `sponsors/${Date.now()}_${formData.photoFile.name}`)
        sponsor_foto_url = await uploadFile(data)
      }

      let comprobante_url = null
      if (formData.proof) {
        const data = new FormData()
        data.append('file', formData.proof)
        data.append('path', `comprobantes/${Date.now()}_${formData.proof.name}`)
        comprobante_url = await uploadFile(data)
      }

      const plan_seleccionado = getTierId(n)
      const uid = Math.random().toString(36).substring(2, 9)

      await saveComprameUnDia({
        fullName: formData.sponsor_name,
        phone: formData.phone,
        email: formData.email,
        instagram: formData.instagram,
        paymentMethod: 'transfer',
        bankSelection: formData.bankSelection,
        hasProof: !!formData.proof,
        proofName: formData.proof ? formData.proof.name : null,
        comprobante_url,
        sponsor_foto_url,
        selectedDates: selectedDays,
        plan: plan_seleccionado,
        totalPrice: n * 3000,
        termsAccepted: formData.terms,
        is_anonymous: !formData.personalize,
        custom_message: formData.message,
        tooltip_message: formData.tooltip_message,
        link: formData.link,
      })

      await saveSoldDays({
        dates: selectedDays,
        nombre: formData.sponsor_name,
        foto_url: sponsor_foto_url,
        message: formData.message,
        link: formData.link,
        is_anonymous: !formData.personalize,
        tooltip_message: formData.tooltip_message,
        phone: formData.phone,
        email: formData.email,
        instagram: formData.instagram,
        uid,
        plan: plan_seleccionado,
      })

      window.location.href = '/gracias'
    } catch (error) {
      console.error("Error submitting:", error)
      alert("Hubo un error al procesar tu solicitud.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#0a192f] border border-white/10 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">Confirmar Patrocinio</h2>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
            Paso {step} de {TOTAL_STEPS} • {n} días seleccionados
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-white/5">
        <motion.div
          className="h-full bg-blue-500"
          animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Summary Card */}
      <div className="mx-6 mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-between">
        <div className="flex gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black italic">
            {n}
          </div>
          <div>
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Resumen de Selección</p>
            <p className="text-sm font-black text-white italic tracking-tight">RD$ {(n * 3000).toLocaleString()}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Estado</p>
          <p className="text-[10px] font-black text-green-400 uppercase tracking-widest flex items-center gap-1 justify-end">
            <Check className="w-3 h-3" /> Listo
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <AnimatePresence mode="wait">

          {/* ── STEP 1: Identidad ── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-center space-y-2 pb-2">
                <h3 className="text-base font-black text-white uppercase tracking-tight">
                  Haz que tu día destaque
                </h3>
                <p className="text-[11px] text-white/50 font-medium leading-relaxed max-w-xs mx-auto">
                  Agrega un nombre, mensaje o enlace.
                </p>
              </div>

              <label className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 transition-colors">
                <span className="text-sm font-bold text-white">Mantener como anónimo</span>
                <div className="relative shrink-0">
                  <input
                    type="checkbox"
                    name="personalize"
                    checked={!formData.personalize}
                    onChange={() => setFormData(prev => ({ ...prev, personalize: !prev.personalize }))}
                    className="peer sr-only"
                  />
                  <div className="w-11 h-6 bg-white/10 rounded-full peer-checked:bg-blue-600 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:bg-white after:rounded-full after:shadow-md after:transition-all peer-checked:after:translate-x-5" />
                </div>
              </label>

              <button
                type="button"
                onClick={handleNext}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20"
              >
                {formData.personalize ? 'Personalizar' : 'Revisar compra'}
              </button>
            </motion.div>
          )}

          {/* ── STEP 2: Contacto ── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="text-center space-y-2 pb-2">
                <h3 className="text-base font-black text-white uppercase tracking-tight">
                  Tus datos de contacto
                </h3>
                <p className="text-[11px] text-white/50 font-medium leading-relaxed max-w-xs mx-auto">
                  Para que pueda identificarte como patrocinador.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                <input
                  ref={nameRef}
                  autoFocus
                  type="text"
                  name="sponsor_name"
                  value={formData.sponsor_name}
                  onChange={handleInputChange}
                  placeholder="Ej. Juan Pérez"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
                {errors.sponsor_name && <p className="text-red-400 text-[10px] font-bold uppercase ml-1 mt-1">{errors.sponsor_name}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">Teléfono / WhatsApp</label>
                <input
                  ref={phoneRef}
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="809-000-0000"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
                {errors.phone && <p className="text-red-400 text-[10px] font-bold uppercase ml-1 mt-1">{errors.phone}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">Correo (Opcional)</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="tucorreo@ejemplo.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button type="button" onClick={handlePrev} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all">
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  Continuar
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Personalización ── */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2 pb-2">
                <h3 className="text-base font-black text-white uppercase tracking-tight">
                  Personaliza tu patrocinio ✨
                </h3>
                <p className="text-[11px] text-white/50 font-medium leading-relaxed max-w-xs mx-auto">
                  Agrega tu Instagram, un mensaje o enlace para aparecer en tu día del calendario.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">Instagram</label>
                <input
                  autoFocus
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleInputChange}
                  placeholder="@usuario"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>

              {showMessageField && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">Mensaje de Patrocinio</label>
                  <textarea
                    name="message"
                    maxLength={charLimit}
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder={`Escribe tu mensaje (Máx ${charLimit} caracteres)`}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-colors h-28 resize-none"
                  />
                  <p className="text-right text-[10px] font-bold text-white/30 uppercase tracking-widest">{formData.message.length}/{charLimit}</p>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">Tooltip (al pasar el mouse)</label>
                <input
                  type="text"
                  name="tooltip_message"
                  value={formData.tooltip_message}
                  onChange={handleInputChange}
                  placeholder="Ej: El mejor café de Santo Domingo"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>

              <div className="space-y-1">
                  <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">Link</label>
                <input
                  type="text"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  placeholder="Web / LinkedIn / Facebook"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button type="button" onClick={handlePrev} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all">
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  Continuar
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 4: Foto ── */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2 pb-2">
                <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20 mx-auto">
                  <ImageIcon className="w-7 h-7 text-purple-400" />
                </div>
                <h3 className="text-base font-black text-white uppercase tracking-tight">
                  Tu cara en el calendario ✨
                </h3>
                <p className="text-[11px] text-white/50 font-medium leading-relaxed max-w-xs mx-auto">
                  Sube una foto o sticker para aparecer en tu día del calendario. <span className="text-purple-400 font-bold">100% opcional.</span>
                </p>
              </div>

              <label
                htmlFor="checkoutflow-photo-upload"
                className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-white/10 rounded-2xl bg-white/5 hover:bg-purple-500/5 hover:border-purple-500/30 cursor-pointer transition-all group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                {formData.photoFile ? (
                  <div className="flex flex-col items-center gap-3 relative z-10">
                    <img
                      src={URL.createObjectURL(formData.photoFile)}
                      alt="Vista previa"
                      className="w-20 h-20 rounded-full object-cover border-4 border-purple-400/60 shadow-lg shadow-purple-500/20"
                    />
                    <div className="text-center">
                      <span className="text-xs text-white/70 font-bold block">{formData.photoFile.name}</span>
                      <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest mt-1">Click para cambiar</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 relative z-10">
                    <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center border border-white/10 group-hover:border-purple-500/50 transition-all">
                      <Upload className="w-6 h-6 text-white/40 group-hover:text-purple-400 transition-colors" />
                    </div>
                    <div className="text-center">
                      <span className="text-xs text-white/60 font-bold uppercase tracking-widest block">Subir foto o sticker</span>
                      <span className="text-[10px] text-white/30 font-medium mt-1 block">JPG, PNG, GIF, WEBP</span>
                    </div>
                  </div>
                )}
                <input
                  id="checkoutflow-photo-upload"
                  ref={sponsorInputRef}
                  type="file"
                  onChange={handleSponsorPhotoChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-20"
                  accept="image/*"
                />
              </label>

              <div className="flex gap-4">
                <button type="button" onClick={handlePrev} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all">
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  {formData.photoFile ? 'Continuar con foto' : 'Saltar este paso'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 5: Método de Pago ── */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-blue-600/20 border border-blue-500/30 rounded-2xl p-5 flex items-center justify-between relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-colors" />
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Total a transferir</p>
                  <p className="text-2xl font-black text-white italic tracking-tighter mt-1">
                    RD$ {(n * 3000).toLocaleString()}
                  </p>
                </div>
                <div className="text-right relative z-10">
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Por {n} {n === 1 ? 'día' : 'días'}</p>
                  <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg uppercase tracking-wider">
                    {getTierId(n) || 'Selección Libre'}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Selecciona tu banco</p>
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                  {['popular', 'banreservas'].map((bank) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, bankSelection: bank }))}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${formData.bankSelection === bank ? 'bg-blue-600 text-white shadow-lg' : 'text-white/40 hover:text-white/60'}`}
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10 space-y-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors" />

                <div className="flex items-center gap-3 mb-2">
                  <Landmark className="w-5 h-5 text-blue-400" />
                  <p className="text-xs font-black text-blue-400 uppercase tracking-widest">Datos de transferencia</p>
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Número de Cuenta</p>
                      <p className="text-base font-black text-white tracking-wider mt-0.5">
                        {formData.bankSelection === 'popular' ? '0854243391' : '9607058204'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(formData.bankSelection === 'popular' ? '0854243391' : '9607058204')}
                      className="p-2 bg-white/5 hover:bg-blue-600/20 border border-white/5 hover:border-blue-500/30 rounded-lg text-white/40 hover:text-blue-400 transition-all active:scale-90"
                      title="Copiar número"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                    <div>
                      <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Tipo</p>
                      <p className="text-[10px] font-black text-white uppercase tracking-widest mt-1">Ahorro</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Titular</p>
                      <p className="text-[10px] font-black text-white uppercase tracking-widest mt-1">Michael Eusebio</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <div>
                      <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Cédula</p>
                      <p className="text-[10px] font-black text-white uppercase tracking-widest mt-1">402-3402480-6</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText('40234024806')}
                      className="p-2 bg-white/5 hover:bg-blue-600/20 border border-white/5 hover:border-blue-500/30 rounded-lg text-white/40 hover:text-blue-400 transition-all active:scale-90"
                      title="Copiar cédula"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={handlePrev} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all">Atrás</button>
                <button type="button" onClick={handleNext} className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all">Siguiente</button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 6: Comprobante y Confirmación ── */}
          {step === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">Comprobante de Pago</label>
                <label
                  htmlFor="checkoutflow-proof-upload"
                  className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 hover:border-blue-500/30 cursor-pointer transition-all group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {formData.proof ? (
                    <div className="flex flex-col items-center gap-2 relative z-10">
                      <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/50">
                        <Check className="w-6 h-6 text-green-400" />
                      </div>
                      <span className="text-xs text-white/60 font-bold">{formData.proof.name}</span>
                      <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Click para cambiar</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 relative z-10">
                      <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10 group-hover:border-blue-500/50 group-hover:text-blue-400 transition-all">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div className="text-center">
                        <span className="text-xs text-white/60 font-bold uppercase tracking-widest block">Subir Comprobante</span>
                        <span className="text-[10px] text-white/30 font-medium mt-1 block">JPG, PNG o PDF</span>
                      </div>
                    </div>
                  )}
                  <input
                    autoFocus
                    id="checkoutflow-proof-upload"
                    type="file"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-20"
                    accept="image/*,application/pdf"
                  />
                </label>
              </div>

              <label className="flex items-start gap-4 cursor-pointer group p-2 -ml-2 rounded-xl hover:bg-white/5 transition-all">
                <div className="relative mt-0.5 shrink-0">
                  <input
                    type="checkbox"
                    name="terms"
                    checked={formData.terms}
                    onChange={handleInputChange}
                    className="peer absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-6 h-6 border-2 border-white/10 rounded-lg peer-checked:bg-blue-600 peer-checked:border-blue-500 transition-all flex items-center justify-center bg-white/5 group-hover:border-white/20">
                    <Check className="w-4 h-4 text-white scale-0 peer-checked:scale-100 transition-transform duration-300" />
                  </div>
                </div>
                <span className="text-[11px] font-bold text-white/40 group-hover:text-white/60 transition-colors uppercase leading-relaxed tracking-wide">
                  Entiendo que esta contribución no es reembolsable y que los días seleccionados podrían variar según el calendario académico final y la fecha de ingreso de Michael Eusebio.
                </span>
              </label>

              <div className="flex gap-4">
                <button type="button" onClick={handlePrev} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all">Atrás</button>
                <button
                  type="submit"
                  disabled={loading || !formData.terms}
                  className="flex-[2] bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirmar Pago"}
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </form>
    </div>
  )
}
