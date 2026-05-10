'use client'
import React, { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, CheckCircle2, Upload, Loader2, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react'
import { uploadFrenakiComprobante, saveFrenakiUsuario } from '../../../lib/apis/FrenakiActions'

// ---------- Datos bancarios ----------
const BANK_INFO = {
  banco: 'Banco Popular',
  tipoCuenta: 'Cuenta de Ahorros',
  numero: '0854243381',
  titular: 'Michael Eusebio Del Orbe',
  cedula: '40234024806',
}

// ---------- Helper: copiar al portapapeles ----------
function CopyButton({ value }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      title="Copiar"
      style={{
        background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)',
        border: `1px solid ${copied ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.12)'}`,
        borderRadius: '8px',
        padding: '4px 10px',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        color: copied ? '#4ade80' : '#a0aec0',
        fontSize: '0.75rem',
        fontWeight: 700,
        transition: 'all 0.2s',
        flexShrink: 0,
      }}
    >
      {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
      {copied ? 'Copiado' : 'Copiar'}
    </button>
  )
}

// ---------- Modal principal ----------
export default function FrenakiCheckoutModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1) // 1: Datos, 2: Pago
  const [form, setForm] = useState({ nombre: '', correo: '', celular: '' })
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState('')
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [dragOver, setDragOver] = useState(false)

  // --- Validación Paso 1 ---
  const validateStep1 = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'El nombre es requerido.'
    if (!form.correo.trim()) {
      e.correo = 'El correo es requerido.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) {
      e.correo = 'Ingresa un correo válido.'
    }
    if (form.celular && !/^\d{7,15}$/.test(form.celular.replace(/[\s\-()]/g, ''))) {
      e.celular = 'Ingresa un número válido (solo dígitos).'
    }
    return e
  }

  // --- Validación Paso 2 ---
  const validateStep2 = () => {
    const e = {}
    if (!file) e.file = 'Debes adjuntar el comprobante de pago.'
    return e
  }

  const handleNextStep = () => {
    const step1Errors = validateStep1()
    if (Object.keys(step1Errors).length) {
      setErrors(step1Errors)
      return
    }
    setErrors({})
    setStep(2)
  }

  const handlePrevStep = () => {
    setStep(1)
  }

  // --- Manejo de archivo ---
  const handleFile = (selected) => {
    setFileError('')
    if (!selected) return
    const allowed = ['image/jpeg', 'image/png']
    if (!allowed.includes(selected.type)) {
      setFileError('Solo se permiten JPG o PNG.')
      return
    }
    if (selected.size > 15 * 1024 * 1024) {
      setFileError('El archivo no puede superar 15 MB.')
      return
    }
    setFile(selected)
    setErrors(prev => ({ ...prev, file: null }))
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }, [])

  // --- Envío ---
  const handleSubmit = async (e) => {
    e.preventDefault()
    const step2Errors = validateStep2()
    if (Object.keys(step2Errors).length) {
      setErrors(step2Errors)
      return
    }
    setErrors({})
    setStatus('loading')
    try {
      // 1. Subir comprobante
      const uploadFD = new FormData()
      uploadFD.append('file', file)
      const { url: comprobante_url, userId } = await uploadFrenakiComprobante(uploadFD)

      // 2. Guardar en Firestore
      await saveFrenakiUsuario({
        userId,
        nombre: form.nombre,
        correo: form.correo,
        celular: form.celular,
        comprobante_url,
      })

      setStatus('success')
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  const handleClose = () => {
    if (status === 'loading') return
    setStep(1)
    setForm({ nombre: '', correo: '', celular: '' })
    setFile(null)
    setFileError('')
    setErrors({})
    setStatus('idle')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 999,
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(6px)',
            }}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '16px',
              pointerEvents: 'none',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                pointerEvents: 'auto',
                background: '#0F0F0F',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '28px',
                width: '100%',
                maxWidth: '540px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 40px 100px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,200,61,0.06)',
              }}
            >
              {status === 'success' ? (
                <SuccessView onClose={handleClose} />
              ) : (
                <FormView
                  step={step}
                  form={form} setForm={setForm}
                  file={file} fileError={fileError}
                  errors={errors}
                  status={status}
                  dragOver={dragOver} setDragOver={setDragOver}
                  handleFile={handleFile}
                  handleDrop={handleDrop}
                  handleSubmit={handleSubmit}
                  handleClose={handleClose}
                  handleNextStep={handleNextStep}
                  handlePrevStep={handlePrevStep}
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ---------- Vista de éxito ----------
function SuccessView({ onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: '56px 40px', textAlign: 'center' }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
        style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'rgba(255,200,61,0.1)',
          border: '2px solid rgba(255,200,61,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 28px',
        }}
      >
        <CheckCircle2 size={40} color="#FFC83D" />
      </motion.div>
      <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '16px', color: '#fff' }}>
        ¡Registro recibido! 🔥
      </h2>
      <p style={{ color: '#a0aec0', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '360px', margin: '0 auto 36px' }}>
        Validaremos tu comprobante en las próximas <strong style={{ color: '#FFC83D' }}>24 horas</strong>. Te notificaremos por correo cuando tu acceso esté activo.
      </p>
      <button
        onClick={() => window.location.href = '/frenaki/gracias'}
        style={{
          background: 'linear-gradient(135deg, #FFC83D, #ffaa00)',
          color: '#000', fontWeight: 900, fontSize: '1rem',
          border: 'none', borderRadius: '14px',
          padding: '16px 40px', cursor: 'pointer',
          letterSpacing: '0.5px',
        }}
      >
        Continuar 🔥
      </button>
    </motion.div>
  )
}

// ---------- Vista del formulario ----------
function FormView({ step, form, setForm, file, fileError, errors, status, dragOver, setDragOver, handleFile, handleDrop, handleSubmit, handleClose, handleNextStep, handlePrevStep }) {
  const isLoading = status === 'loading'
  const firstInputRef = useRef(null)

  useEffect(() => {
    if (step === 1 && firstInputRef.current) {
      firstInputRef.current.focus()
    }
  }, [step])

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        padding: '28px 28px 0',
      }}>
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,200,61,0.1)', border: '1px solid rgba(255,200,61,0.25)',
            borderRadius: '100px', padding: '5px 14px', marginBottom: '12px',
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#FFC83D', letterSpacing: '1px' }}>
              PASO {step} DE 2 · RD$500
            </span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', lineHeight: 1.2 }}>
            {step === 1 ? 'Tus Datos' : 'Realizar Pago'}
          </h2>
          <p style={{ color: '#718096', fontSize: '0.9rem', marginTop: '6px' }}>
            {step === 1 ? 'Cuéntanos quién eres para preparar tu cuenta.' : 'Transfiere y sube tu comprobante para activar.'}
          </p>
        </div>
        <button
          onClick={handleClose}
          disabled={isLoading}
          style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px', padding: '8px', cursor: 'pointer',
            color: '#718096', display: 'flex', flexShrink: 0, marginLeft: '16px',
          }}
        >
          <X size={18} />
        </button>
      </div>

      <div style={{ padding: '24px 28px' }}>
        
        {step === 1 ? (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {/* Nombre */}
            <Field
              ref={firstInputRef}
              label="Nombre completo *"
              id="frenaki-nombre"
              type="text"
              placeholder="Ej. María García"
              value={form.nombre}
              onChange={(v) => setForm(f => ({ ...f, nombre: v }))}
              error={errors.nombre}
              disabled={isLoading}
            />

            {/* Correo */}
            <Field
              label="Correo electrónico *"
              id="frenaki-correo"
              type="email"
              placeholder="tu@email.com"
              value={form.correo}
              onChange={(v) => setForm(f => ({ ...f, correo: v }))}
              error={errors.correo}
              disabled={isLoading}
            />

            {/* Celular */}
            <Field
              label="Teléfono de WhatsApp"
              id="frenaki-celular"
              type="tel"
              placeholder="8091234567"
              value={form.celular}
              onChange={(v) => setForm(f => ({ ...f, celular: v }))}
              error={errors.celular}
              disabled={isLoading}
            />

            <motion.button
              type="button"
              onClick={handleNextStep}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                marginTop: '12px',
                background: 'linear-gradient(135deg, #FFC83D, #ffaa00)',
                color: '#000', fontWeight: 900, fontSize: '1rem',
                border: 'none', borderRadius: '16px',
                padding: '18px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                letterSpacing: '0.5px', width: '100%',
                boxShadow: '0 10px 30px rgba(255,200,61,0.25)',
              }}
            >
              Siguiente Paso <ArrowRight size={20} />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* Datos bancarios */}
            <div style={{
              background: 'rgba(255,200,61,0.04)',
              border: '1px solid rgba(255,200,61,0.2)',
              borderRadius: '18px', padding: '20px', marginBottom: '24px',
            }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#FFC83D', letterSpacing: '1.5px', marginBottom: '16px' }}>
                📋 DATOS DE TRANSFERENCIA
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <BankRow label="Banco" value={BANK_INFO.banco} />
                <BankRow label="Tipo de cuenta" value={BANK_INFO.tipoCuenta} />
                <BankRow label="Número de cuenta" value={BANK_INFO.numero} copiable />
                <BankRow label="Titular" value={BANK_INFO.titular} />
                <BankRow label="Cédula" value={BANK_INFO.cedula} copiable />
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Upload comprobante */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e0', marginBottom: '8px' }}>
                  Comprobante de pago *
                </label>
                <div
                  role="button"
                  tabIndex={isLoading ? -1 : 0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      document.getElementById('frenaki-comprobante').click();
                    }
                  }}
                  onClick={() => !isLoading && document.getElementById('frenaki-comprobante').click()}
                  onDragOver={(e) => { e.preventDefault(); !isLoading && setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => !isLoading && handleDrop(e)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: '10px', padding: '28px 20px',
                    border: `2px dashed ${errors.file ? '#fc8181' : dragOver ? '#FFC83D' : file ? 'rgba(255,200,61,0.4)' : 'rgba(255,255,255,0.12)'}`,
                    borderRadius: '16px',
                    background: dragOver ? 'rgba(255,200,61,0.05)' : file ? 'rgba(255,200,61,0.03)' : 'rgba(255,255,255,0.02)',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    outline: 'none',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#FFC83D'}
                  onBlur={(e) => e.currentTarget.style.borderColor = errors.file ? '#fc8181' : dragOver ? '#FFC83D' : file ? 'rgba(255,200,61,0.4)' : 'rgba(255,255,255,0.12)'}
                >
                  <input
                    id="frenaki-comprobante"
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    style={{ display: 'none' }}
                    disabled={isLoading}
                    onChange={(e) => handleFile(e.target.files[0])}
                  />
                  {file ? (
                    <>
                      <CheckCircle2 size={28} color="#4ade80" />
                      <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '0.9rem', textAlign: 'center' }}>
                        ¡Transferencia lista!
                      </span>
                      <span style={{ color: '#718096', fontSize: '0.78rem' }}>
                        {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload size={28} color="#718096" />
                      <span style={{ color: '#a0aec0', fontWeight: 600, fontSize: '0.9rem' }}>
                        Sube tu foto de transferencia
                      </span>
                      <span style={{ color: '#4a5568', fontSize: '0.78rem', textAlign: 'center' }}>
                        Toca para subir o arrastra aquí <br/> Solo imágenes · Máximo 15 MB
                      </span>
                    </>
                  )}
                </div>
                {(errors.file || fileError) && (
                  <p style={{ color: '#fc8181', fontSize: '0.78rem', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <AlertCircle size={12} /> {errors.file || fileError}
                  </p>
                )}
              </div>

              {/* Error global */}
              {status === 'error' && (
                <div style={{
                  background: 'rgba(252,129,129,0.08)', border: '1px solid rgba(252,129,129,0.3)',
                  borderRadius: '12px', padding: '14px 16px',
                  color: '#fc8181', fontSize: '0.88rem', display: 'flex', gap: '10px', alignItems: 'center',
                }}>
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  Ocurrió un error al enviar. Revisa tu conexión e inténtalo de nuevo.
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.06)',
                    color: '#fff', fontWeight: 700,
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px',
                    padding: '18px', cursor: isLoading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  }}
                >
                  <ArrowLeft size={18} /> Volver
                </button>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={!isLoading ? { scale: 1.02 } : {}}
                  whileTap={!isLoading ? { scale: 0.98 } : {}}
                  style={{
                    flex: 2,
                    background: isLoading ? 'rgba(255,200,61,0.4)' : 'linear-gradient(135deg, #FFC83D, #ffaa00)',
                    color: '#000', fontWeight: 900, fontSize: '1rem',
                    border: 'none', borderRadius: '16px',
                    padding: '18px', cursor: isLoading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    letterSpacing: '0.5px',
                    boxShadow: isLoading ? 'none' : '0 10px 30px rgba(255,200,61,0.25)',
                    transition: 'all 0.2s',
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                      Enviando…
                    </>
                  ) : (
                    'Confirmar Pago 🔥'
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}

        <p style={{ textAlign: 'center', color: '#4a5568', fontSize: '0.78rem', marginTop: '24px' }}>
          Pago único · Sin suscripción · Validación en 24h
        </p>
      </div>
    </div>
  )
}

// ---------- Sub-componentes ----------
function BankRow({ label, value, copiable }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
      <div>
        <span style={{ fontSize: '0.73rem', color: '#4a5568', display: 'block', marginBottom: '2px', fontWeight: 600 }}>
          {label}
        </span>
        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0', letterSpacing: copiable ? '0.5px' : 'normal' }}>
          {value}
        </span>
      </div>
      {copiable && <CopyButton value={value} />}
    </div>
  )
}

const Field = React.forwardRef(({ label, id, type, placeholder, value, onChange, error, disabled }, ref) => {
  return (
    <div>
      <label htmlFor={id} style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e0', marginBottom: '8px' }}>
        {label}
      </label>
      <input
        ref={ref}
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%', boxSizing: 'border-box',
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${error ? '#fc8181' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: '12px', padding: '14px 16px',
          color: '#e2e8f0', fontSize: '0.95rem',
          outline: 'none', transition: 'border-color 0.2s',
          fontFamily: 'inherit',
        }}
        onFocus={(e) => { e.target.style.borderColor = '#FFC83D' }}
        onBlur={(e) => { e.target.style.borderColor = error ? '#fc8181' : 'rgba(255,255,255,0.1)' }}
      />
      {error && (
        <p style={{ color: '#fc8181', fontSize: '0.78rem', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  )
})
