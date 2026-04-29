import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Landmark, Upload, Loader2, Copy, Image as ImageIcon, ChevronRight } from 'lucide-react';

const CheckoutModal = ({
  isOpen,
  onClose,
  step,
  setStep,
  formData,
  handleInputChange,
  handleFileChange,
  handleSponsorPhotoChange,
  errors,
  loading,
  onSubmit,
  nextStep,
  prevStep,
  selectedDates
}) => {
  const sponsorInputRef = useRef(null);
  if (!isOpen) return null;

  const TOTAL_STEPS = 4;

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
        className="bg-[#0a192f] border border-white/10 w-full max-w-xl rounded-3xl overflow-hidden relative shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">Confirmar Patrocinio</h2>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
              Paso {step} de {TOTAL_STEPS} • {selectedDates.length} días seleccionados
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/50 hover:text-white"
            aria-label="Cerrar modal"
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

        <form onSubmit={onSubmit} className="p-6">
          <AnimatePresence mode="wait">

            {/* ── STEP 1: Datos personales ── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                  <input
                    autoFocus
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Ej. Juan Pérez"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                  {errors.fullName && <p className="text-red-400 text-[10px] font-bold uppercase ml-1 mt-1">{errors.fullName}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">Instagram</label>
                    <input
                      type="text"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleInputChange}
                      placeholder="@usuario"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                    {errors.instagram && <p className="text-red-400 text-[10px] font-bold uppercase ml-1 mt-1">{errors.instagram}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="email@ejemplo.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                    />
                    {errors.email && <p className="text-red-400 text-[10px] font-bold uppercase ml-1 mt-1">{errors.email}</p>}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">WhatsApp</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="809-000-0000"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>
                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 mt-4"
                >
                  Siguiente
                </button>
              </motion.div>
            )}

            {/* ── STEP 2: Foto opcional del patrocinador (HU2) ── */}
            {step === 2 && (
              <motion.div
                key="step2"
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

                {/* Upload area */}
                <label
                  htmlFor="sponsor-photo-upload"
                  className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-white/10 rounded-2xl bg-white/5 hover:bg-purple-500/5 hover:border-purple-500/30 cursor-pointer transition-all group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {formData.sponsorPhoto ? (
                    <div className="flex flex-col items-center gap-3 relative z-10">
                      <img
                        src={URL.createObjectURL(formData.sponsorPhoto)}
                        alt="Vista previa"
                        className="w-20 h-20 rounded-full object-cover border-4 border-purple-400/60 shadow-lg shadow-purple-500/20"
                      />
                      <div className="text-center">
                        <span className="text-xs text-white/70 font-bold block">{formData.sponsorPhoto.name}</span>
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
                    id="sponsor-photo-upload"
                    ref={sponsorInputRef}
                    type="file"
                    onChange={handleSponsorPhotoChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-20"
                    accept="image/*"
                  />
                </label>

                <div className="flex gap-4">
                  <button type="button" onClick={prevStep} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all">
                    Atrás
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
                  >
                    {formData.sponsorPhoto ? 'Continuar con foto' : 'Saltar este paso'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: Método de pago (solo transferencia — HU3) ── */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Bank selector */}
                <div>
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Selecciona tu banco</p>
                  <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                    {['popular', 'banreservas'].map((bank) => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => handleInputChange({ target: { name: 'bankSelection', value: bank } })}
                        className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${formData.bankSelection === bank ? 'bg-blue-600 text-white shadow-lg' : 'text-white/40 hover:text-white/60'}`}
                      >
                        {bank}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bank account info card */}
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
                        onClick={() => {
                          navigator.clipboard.writeText(formData.bankSelection === 'popular' ? '0854243391' : '9607058204');
                        }}
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
                  <button type="button" onClick={prevStep} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all">Atrás</button>
                  <button type="button" onClick={nextStep} className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all">Siguiente</button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 4: Comprobante + términos ── */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">Comprobante de Pago</label>
                  <label 
                    htmlFor="proof-upload"
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
                      id="proof-upload"
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
                  <button type="button" onClick={prevStep} className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all">Atrás</button>
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
      </motion.div>
    </div>
  );
};

export default CheckoutModal;
