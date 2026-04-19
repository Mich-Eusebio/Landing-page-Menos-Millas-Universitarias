import React, { useState } from 'react';
import { X, MessageSquare, Smartphone, Coins, PartyPopper, Clock, Check } from 'lucide-react';

const StatusScreen = ({ ganadorActual, updateStatus, setView }) => {
  const [selectedStatus, setSelectedStatus] = useState(null);

  const statusOptions = [
    { id: 'Dispositivo', label: `ACEPTO DISPOSITIVO (${ganadorActual?.premio})`, icon: <Smartphone className="text-emerald-500" /> },
    { id: 'Dinero', label: 'ACEPTO EFECTIVO EQUIVALENTE', icon: <Coins className="text-blue-500" /> },
    { id: 'Fondo', label: 'ACEPTO MANTENERLO EN EL FONDO', icon: <PartyPopper className="text-amber-500" /> },
    { id: 'Pendiente', label: 'PENDIENTE DE CONFIRMACIÓN', icon: <Clock className="text-rose-500" /> }
  ];

  // --- LÓGICA DE WHATSAPP REFORZADA ---
  const generateWhatsAppLink = () => {
    if (!ganadorActual) return '#';

    // 1. Limpiamos el número de cualquier cosa que no sea un dígito
    let cleanNumber = ganadorActual.phone1.replace(/\D/g, '');

    // 2. Verificamos si empieza con "1". Si no, se lo agregamos.
    if (!cleanNumber.startsWith('1')) {
      cleanNumber = `1${cleanNumber}`;
    }

    // 3. Creamos el mensaje personalizado
    const mensaje = encodeURIComponent(
      `¡Hola ${ganadorActual.userName}! Te escribo de parte del equipo de Menos Millas Universitarias. ¡Muchísimas felicidades por haber ganado: ${ganadorActual.premio} en nuestro sorteo! 🥳🎉`
    );

    return `https://wa.me/${cleanNumber}?text=${mensaje}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 md:p-6 text-white relative overflow-hidden">
      
      {/* BOTÓN CERRAR */}
      <button
        onClick={() => setView('home')}
        className="absolute top-4 right-4 md:top-8 md:right-8 p-3 md:p-5 bg-slate-900 border border-white/10 rounded-full hover:bg-slate-800 transition-all z-50 shadow-xl"
      >
        <X size={24} className="md:w-8 md:h-8" />
      </button>

      <div className="max-w-2xl w-full bg-slate-900 rounded-[2rem] md:rounded-[4rem] p-6 md:p-12 border border-white/10 shadow-2xl relative z-10 flex flex-col max-h-[95vh] md:max-h-none overflow-y-auto custom-scrollbar">

        <div className="mb-6 md:mb-10 text-center shrink-0">
          <h3 className="text-3xl md:text-4xl font-black mb-1 uppercase italic break-words">
            {ganadorActual?.userName}
          </h3>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] md:text-sm mb-6">
            Gestión de Ganador
          </p>

          {/* BOTÓN WHATSAPP CON MENSAJE AUTOMÁTICO */}
          <a 
            href={generateWhatsAppLink()} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full mb-6 flex items-center justify-center gap-3 py-4 md:py-6 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-[1.5rem] md:rounded-[2rem] border border-emerald-500/30 transition-all font-black text-emerald-400 uppercase tracking-widest text-xs md:text-base group"
          >
            <MessageSquare size={20} className="md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
            Enviar Mensaje de Felicitación
          </a>

          <div className="h-px bg-white/10 w-full"></div>
        </div>

        {/* LISTA DE ESTADOS ESTILIZADA */}
        <div className="space-y-3 md:space-y-4">
          {statusOptions.map((opt) => {
            const isSelected = selectedStatus === opt.id;
            
            return (
              <label
                key={opt.id}
                className={`
                  relative w-full flex items-center p-3 md:p-5 rounded-[1.5rem] md:rounded-[2rem] border-2 transition-all cursor-pointer active:scale-[0.98]
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_25px_rgba(37,99,235,0.2)]' 
                    : 'border-transparent bg-slate-800/40 hover:bg-slate-800'}
                `}
              >
                <input 
                  type="radio" 
                  name="status" 
                  className="hidden" 
                  checked={isSelected}
                  onChange={() => {
                    setSelectedStatus(opt.id);
                    updateStatus(opt.id);
                  }}
                />

                <div className={`
                  mr-4 md:mr-6 p-3 md:p-4 rounded-xl md:rounded-2xl transition-all
                  ${isSelected ? 'bg-blue-600 shadow-lg' : 'bg-slate-950'}
                `}>
                  {React.cloneElement(opt.icon, { 
                    size: 20, 
                    className: `${isSelected ? 'text-white' : opt.icon.props.className} md:w-7 md:h-7` 
                  })}
                </div>

                <span className={`
                  font-black text-sm md:text-lg uppercase tracking-tighter leading-tight transition-colors
                  ${isSelected ? 'text-white' : 'text-slate-300'}
                `}>
                  {opt.label}
                </span>

                {isSelected && (
                  <div className="ml-auto bg-blue-500 rounded-full p-1 animate-in zoom-in duration-300">
                    <Check size={16} className="text-white" />
                  </div>
                )}
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StatusScreen;