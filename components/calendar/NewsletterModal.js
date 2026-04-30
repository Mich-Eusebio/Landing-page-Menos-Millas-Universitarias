import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Landmark, Upload, Loader2, Copy, ChevronRight, Calendar } from 'lucide-react';

const NewsletterModal = ({
  isOpen,
  onClose,
  step,
  setStep,
  formData,
  handleInputChange,
  handleFileChange,
  errors,
  loading,
  onSubmit,
  nextStep,
  prevStep
}) => {
  if (!isOpen) return null;

  const TOTAL_STEPS = 3; // Step 1: Info, Step 2: Payment, Step 3: Proof

  const totalPrice = (formData.monthsSubscribed || 1) * 2000;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#020617]/90 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-[#0a0a0a] border border-white/10 w-full max-w-xl rounded-[3rem] overflow-hidden relative shadow-2xl"
      >
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">Estar en Primera Fila</h2>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
              Paso {step} de {TOTAL_STEPS} • Suscripción Exclusiva
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/50 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-white/5">
          <motion.div
            className="h-full bg-blue-500"
            animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        <form onSubmit={onSubmit} className="p-8">
          <AnimatePresence mode="wait">

            {/* ── STEP 1: Datos y Meses ── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                  <input
                    autoFocus
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Ej. Juan Pérez"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  {errors.fullName && <p className="text-red-400 text-[10px] font-bold uppercase ml-1 mt-1">{errors.fullName}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="email@ejemplo.com"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  {errors.email && <p className="text-red-400 text-[10px] font-bold uppercase ml-1 mt-1">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">Meses de Suscripción</label>
                  <div className="relative">
                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                    <select
                      name="monthsSubscribed"
                      value={formData.monthsSubscribed}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-16 py-4 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5, 6, 12].map(num => (
                        <option key={num} value={num} className="bg-[#0a0a0a]">{num} {num === 1 ? 'Mes' : 'Meses'}</option>
                      ))}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                      <ChevronRight className="w-5 h-5 rotate-90" />
                    </div>
                  </div>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-2 ml-1">RD$ 2,000 / mes</p>
                </div>

                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest py-5 rounded-2xl transition-all shadow-lg shadow-blue-600/20 mt-4"
                >
                  Continuar al Pago
                </button>
              </motion.div>
            )}

            {/* ── STEP 2: Datos de Transferencia ── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Total amount preview */}
                <div className="bg-blue-600/20 border border-blue-500/30 rounded-[2rem] p-6 flex items-center justify-between relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-colors" />
                  <div className="relative z-10">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Total a transferir</p>
                    <p className="text-3xl font-black text-white italic tracking-tighter mt-1">
                      RD$ {totalPrice.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right relative z-10">
                    <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Por {formData.monthsSubscribed} meses</p>
                    <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg uppercase tracking-wider">
                      En Primera Fila
                    </span>
                  </div>
                </div>

                {/* Bank selector */}
                <div>
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Selecciona tu banco</p>
                  <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10">
                    {['popular', 'banreservas'].map((bank) => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => handleInputChange({ target: { name: 'bankSelection', value: bank } })}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.bankSelection === bank ? 'bg-blue-600 text-white shadow-lg' : 'text-white/40 hover:text-white/60'}`}
                      >
                        {bank}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bank account info card */}
                <div className="bg-white/5 rounded-[2rem] p-8 border border-white/10 space-y-5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors" />
                  
                  <div className="flex items-center gap-3 mb-2">
                    <Landmark className="w-5 h-5 text-blue-400" />
                    <p className="text-xs font-black text-blue-400 uppercase tracking-widest">Datos de transferencia</p>
                  </div>

                  <div className="space-y-5 relative z-10">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Número de Cuenta</p>
                        <p className="text-lg font-black text-white tracking-wider mt-0.5">
                          {formData.bankSelection === 'popular' ? '0854243391' : '9607058204'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(formData.bankSelection === 'popular' ? '0854243391' : '9607058204')}
                        className="p-3 bg-white/5 hover:bg-blue-600/20 border border-white/5 hover:border-blue-500/30 rounded-xl text-white/40 hover:text-blue-400 transition-all active:scale-90"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-5 border-t border-white/5">
                      <div>
                        <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Tipo</p>
                        <p className="text-[10px] font-black text-white uppercase tracking-widest mt-1">Ahorro</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Titular</p>
                        <p className="text-[10px] font-black text-white uppercase tracking-widest mt-1 text-balance leading-tight">Michael Eusebio</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button type="button" onClick={prevStep} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest py-5 rounded-2xl transition-all">Atrás</button>
                  <button type="button" onClick={nextStep} className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest py-5 rounded-2xl transition-all">Siguiente</button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: Comprobante ── */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">Comprobante de Pago</label>
                  <label 
                    htmlFor="newsletter-proof-upload"
                    className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-white/10 rounded-[2rem] bg-white/5 hover:bg-white/10 hover:border-blue-500/30 cursor-pointer transition-all group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {formData.proof ? (
                      <div className="flex flex-col items-center gap-2 relative z-10 text-center px-6">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/50">
                          <Check className="w-8 h-8 text-green-400" />
                        </div>
                        <span className="text-xs text-white/60 font-bold line-clamp-1">{formData.proof.name}</span>
                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1">Click para cambiar</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4 relative z-10">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-blue-500/50 group-hover:text-blue-400 transition-all">
                          <Upload className="w-8 h-8" />
                        </div>
                        <div className="text-center">
                          <span className="text-xs text-white/60 font-bold uppercase tracking-widest block">Subir Comprobante</span>
                          <span className="text-[10px] text-white/30 font-medium mt-1 block tracking-wider">JPG, PNG o PDF</span>
                        </div>
                      </div>
                    )}
                    <input 
                      id="newsletter-proof-upload"
                      type="file" 
                      onChange={handleFileChange} 
                      className="absolute inset-0 opacity-0 cursor-pointer z-20" 
                      accept="image/*,application/pdf" 
                    />
                  </label>
                </div>

                <label className="flex items-start gap-4 cursor-pointer group p-4 rounded-[2rem] hover:bg-white/5 transition-all">
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
                  <span className="text-[10px] font-bold text-white/40 group-hover:text-white/60 transition-colors uppercase leading-relaxed tracking-wider">
                    Entiendo que mi suscripción comenzará una vez sea verificada y que puedo cancelar en cualquier momento.
                  </span>
                </label>

                <div className="flex gap-4">
                  <button type="button" onClick={prevStep} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest py-5 rounded-2xl transition-all">Atrás</button>
                  <button
                    type="submit"
                    disabled={loading || !formData.terms || !formData.proof}
                    className="flex-[2] bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-600/20"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Finalizar Suscripción"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </motion.div>
    </div>
  );
};

export default NewsletterModal;
