import React from 'react';

const RaffleModal = ({ isOpen, onClose, premios, selectedId, onSelect, onContinue }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-3xl z-50 flex items-center justify-center p-4">
      <div role="dialog" className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl flex flex-col gap-6">
        <h2 className="text-3xl font-black text-center uppercase tracking-tighter italic text-white">
          Selecciona el Premio
        </h2>
        
        <div className="flex flex-col gap-3">
          {premios.length > 0 ? (
            premios.map((p) => (
              <label 
                key={p.id} 
                className={`flex items-center p-4 rounded-3xl border-2 transition-all cursor-pointer ${
                  selectedId === p.id ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-800/30'
                }`}
              >
                <input 
                  type="radio" 
                  name="premio" 
                  className="w-5 h-5 mr-4 accent-blue-500" 
                  checked={selectedId === p.id}
                  onChange={() => onSelect(p.id)} 
                />
                <div className={`p-3 rounded-2xl mr-4 ${p.highTicket ? 'bg-amber-500 text-amber-950' : 'bg-blue-600 text-white'}`}>
                  {p.icon}
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-black text-lg text-white leading-tight">{p.nombre}</span>
                  {p.highTicket && <span className="text-[9px] font-black uppercase text-amber-500 tracking-widest">Milla Extra / Impacto</span>}
                </div>
              </label>
            ))
          ) : (
            <p className="text-white opacity-50 italic text-center">No hay premios disponibles</p>
          )}
        </div>

        <div className="flex gap-4 items-center">
          <button onClick={onClose} className="flex-1 py-4 font-black text-slate-500 hover:text-white transition-colors uppercase text-xs tracking-widest">
            Cancelar
          </button>
          <button 
            onClick={onContinue} 
            disabled={!selectedId} 
            className="flex-[2] py-4 bg-blue-600 disabled:opacity-20 rounded-2xl font-black text-white text-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-transform"
          >
            CONTINUAR
          </button>
        </div>
      </div>
    </div>
  );
};

export default RaffleModal;