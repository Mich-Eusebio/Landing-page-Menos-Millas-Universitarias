'use client'
import React, { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, CheckCircle2, Upload, Loader2, AlertCircle, ArrowRight, ArrowLeft, MapPin, Briefcase } from 'lucide-react'
import { uploadFrenakiBusinessComprobante, saveFrenakiBusiness } from '../../../lib/apis/FrenakiActions'

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

// ---------- Modal principal Negocios ----------
export default function FrenakiBusinessModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1) // 1: Datos, 2: Pago
  const [form, setForm] = useState({ ownerName: '', businessName: '', correo: '', celular: '', addressUrl: '' })
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState('')
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [dragOver, setDragOver] = useState(false)

  // --- Validación Paso 1 ---
  const validateStep1 = () => {
    const e = {}
    if (!form.ownerName.trim()) e.ownerName = 'El nombre del dueño es requerido.'
    if (!form.businessName.trim()) e.businessName = 'El nombre del negocio es requerido.'
    if (!form.addressUrl.trim()) e.addressUrl = 'La dirección o URL de Maps es requerida.'
    if (!form.correo.trim()) {
      e.correo = 'El correo es requerido.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) {
      e.correo = 'Ingresa un correo válido.'
    }
    if (form.celular && !/^\d{7,15}$/.test(form.celular.replace(/[\s\-()]/g, ''))) {
      e.celular = 'Ingresa un número válido.'
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

  const handleFile = (selected) => {
    setFileError('')
    if (!selected) return
    const allowed = ['image/jpeg', 'image/png', 'application/pdf']
    if (!allowed.includes(selected.type)) {
      setFileError('Solo se permiten JPG, PNG o PDF.')
      return
    }
    if (selected.size > 10 * 1024 * 1024) {
      setFileError('El archivo no puede superar 10 MB.')
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
      const { url: comprobante_url, businessId } = await uploadFrenakiBusinessComprobante(uploadFD)

      // 2. Guardar en Firestore
      await saveFrenakiBusiness({
        businessId,
        ...form,
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
    setForm({ ownerName: '', businessName: '', correo: '', celular: '', addressUrl: '' })
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
          <motion.div
            key="backdrop-biz"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 999,
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(8px)',
            }}
          />

          <motion.div
            key="panel-biz"
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
                maxWidth: '560px',
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
          background: 'rgba(34,197,94,0.1)',
          border: '2px solid rgba(34,197,94,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 28px',
        }}
      >
        <CheckCircle2 size={40} color="#4ade80" />
      </motion.div>
      <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '16px', color: '#fff' }}>
        ¡Negocio Registrado! 🚀
      </h2>
      <p style={{ color: '#a0aec0', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '380px', margin: '0 auto 36px' }}>
        Estamos procesando tu alta. Pronto aparecerás en los descubrimientos de Frenaki y empezarás a recibir tráfico nuevo.
      </p>
      <button
        onClick={onClose}
        style={{
          background: 'linear-gradient(135deg, #FFC83D, #ffaa00)',
          color: '#000', fontWeight: 900, fontSize: '1rem',
          border: 'none', borderRadius: '14px',
          padding: '16px 40px', cursor: 'pointer',
        }}
      >
        Excelente
      </button>
    </motion.div>
  )
}

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
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: '100px', padding: '5px 14px', marginBottom: '12px',
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4ade80', letterSpacing: '1px' }}>
              REGISTRO NEGOCIO · RD$2,000
            </span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', lineHeight: 1.2 }}>
            {step === 1 ? 'Datos del Negocio' : 'Pago de Suscripción'}
          </h2>
          <p style={{ color: '#718096', fontSize: '0.9rem', marginTop: '6px' }}>
            {step === 1 ? 'Completa los detalles para tu visibilidad premium.' : 'Transfiere y sube tu comprobante para activar.'}
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Field
                ref={firstInputRef}
                label="Nombre del Dueño *"
                id="frenaki-owner"
                type="text"
                placeholder="Ej. Juan Pérez"
                value={form.ownerName}
                onChange={(v) => setForm(f => ({ ...f, ownerName: v }))}
                error={errors.ownerName}
                disabled={isLoading}
              />
              <Field
                label="Nombre del Negocio *"
                id="frenaki-biz-name"
                type="text"
                placeholder="Ej. Café La Estancia"
                value={form.businessName}
                onChange={(v) => setForm(f => ({ ...f, businessName: v }))}
                error={errors.businessName}
                disabled={isLoading}
                icon={<Briefcase size={16} />}
              />
            </div>

            <Field
              label="Dirección / Google Maps URL *"
              id="frenaki-address"
              type="text"
              placeholder="C. El Conde #123 o link de Maps"
              value={form.addressUrl}
              onChange={(v) => setForm(f => ({ ...f, addressUrl: v }))}
              error={errors.addressUrl}
              disabled={isLoading}
              icon={<MapPin size={16} />}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Field
                label="Correo electrónico *"
                id="frenaki-correo"
                type="email"
                placeholder="negocio@email.com"
                value={form.correo}
                onChange={(v) => setForm(f => ({ ...f, correo: v }))}
                error={errors.correo}
                disabled={isLoading}
              />
              <Field
                label="WhatsApp del Negocio"
                id="frenaki-celular"
                type="tel"
                placeholder="8091234567"
                value={form.celular}
                onChange={(v) => setForm(f => ({ ...f, celular: v }))}
                error={errors.celular}
                disabled={isLoading}
              />
            </div>

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
              Continuar al Pago <ArrowRight size={20} />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div style={{
              background: 'rgba(34,197,94,0.04)',
              border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: '18px', padding: '20px', marginBottom: '24px',
            }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4ade80', letterSpacing: '1.5px', marginBottom: '16px' }}>
                📋 DATOS DE TRANSFERENCIA
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <BankRow label="Banco" value={BANK_INFO.banco} />
                <BankRow label="Número de cuenta" value={BANK_INFO.numero} copiable />
                <BankRow label="Titular" value={BANK_INFO.titular} />
                <BankRow label="Cédula" value={BANK_INFO.cedula} copiable />
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e0', marginBottom: '8px' }}>
                  Comprobante de pago (RD$2,000) *
                </label>
                <div
                  role="button"
                  tabIndex={isLoading ? -1 : 0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      document.getElementById('frenaki-biz-upload').click();
                    }
                  }}
                  onClick={() => !isLoading && document.getElementById('frenaki-biz-upload').click()}
                  onDragOver={(e) => { e.preventDefault(); !isLoading && setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => !isLoading && handleDrop(e)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: '10px', padding: '32px 20px',
                    border: `2px dashed ${errors.file ? '#fc8181' : dragOver ? '#4ade80' : file ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.12)'}`,
                    borderRadius: '16px',
                    background: dragOver ? 'rgba(34,197,94,0.05)' : file ? 'rgba(34,197,94,0.03)' : 'rgba(255,255,255,0.02)',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    outline: 'none',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#4ade80'}
                  onBlur={(e) => e.currentTarget.style.borderColor = errors.file ? '#fc8181' : 'rgba(255,255,255,0.12)'}
                >
                  <input
                    id="frenaki-biz-upload"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    style={{ display: 'none' }}
                    disabled={isLoading}
                    onChange={(e) => handleFile(e.target.files[0])}
                  />
                  {file ? (
                    <>
                      <CheckCircle2 size={28} color="#4ade80" />
                      <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '0.9rem', textAlign: 'center' }}>
                        ¡Comprobante cargado!
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
                        Toca para subir o arrastra aquí <br/> Máximo 10 MB
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
                    boxShadow: isLoading ? 'none' : '0 10px 30px rgba(255,200,61,0.25)',
                  }}
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : 'Finalizar Registro 🚀'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function BankRow({ label, value, copiable }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
      <div>
        <span style={{ fontSize: '0.73rem', color: '#4a5568', display: 'block', marginBottom: '2px', fontWeight: 600 }}>
          {label}
        </span>
        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#e2e8f0' }}>
          {value}
        </span>
      </div>
      {copiable && <CopyButton value={value} />}
    </div>
  )
}

const Field = React.forwardRef(({ label, id, type, placeholder, value, onChange, error, disabled, icon }, ref) => {
  return (
    <div>
      <label htmlFor={id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e0', marginBottom: '8px' }}>
        {icon} {label}
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
        }}
        onFocus={(e) => { e.target.style.borderColor = '#FFC83D' }}
        onBlur={(e) => { e.target.style.borderColor = error ? '#fc8181' : 'rgba(255,255,255,0.1)' }}
      />
      {error && <p style={{ color: '#fc8181', fontSize: '0.78rem', marginTop: '5px' }}>{error}</p>}
    </div>
  )
})
