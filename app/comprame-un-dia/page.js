"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Calendar, CalendarDays, CalendarRange } from 'lucide-react';
import CalendarHeader from '@/components/calendar/CalendarHeader';
import CalendarLegend from '@/components/calendar/CalendarLegend';
import MonthGrid from '@/components/calendar/MonthGrid';
import CheckoutFlow from '@/lib/apis/CheckoutFlow';
import { getSoldDays } from '@/lib/apis/SorteoActions';

const ComprameUnDia = () => {
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectionMode, setSelectionMode] = useState('day');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasManuallyClosed, setHasManuallyClosed] = useState(false);

  const [soldDaysData, setSoldDaysData] = useState([]);

  useEffect(() => {
    getSoldDays().then(data => setSoldDaysData(data));
  }, []);

  const soldMap = Object.fromEntries(soldDaysData.map(d => [d.dateStr, d]));

  const totalDaysCount = selectedDates.length;
  const totalPrice = totalDaysCount * 3000;

  const handleContinue = () => {
    setHasManuallyClosed(false);
    setIsModalOpen(true);
  };

  const handleDateClick = (dateStr, isFullySold) => {
    if (isFullySold) return;
    setHasManuallyClosed(false);

    const currentSel = selectedDates.find(d => d.dateStr === dateStr);

    if (currentSel) {
      if (currentSel.selectionGroupId) {
        setSelectedDates(prev => prev.filter(d => d.selectionGroupId !== currentSel.selectionGroupId));
      } else {
        setSelectedDates(prev => prev.filter(d => d.dateStr !== dateStr));
      }
      return;
    }

    if (selectionMode === 'day') {
      setSelectedDates(prev => [...prev, { dateStr, slot: 'full' }]);
    } else if (selectionMode === 'week') {
      const start = new Date(dateStr + 'T00:00:00');
      const weekDates = [];
      for (let i = 0; i < 7; i++) {
        const next = new Date(start);
        next.setDate(start.getDate() + i);
        const ystr = next.getFullYear();
        const mstr = String(next.getMonth() + 1).padStart(2, '0');
        const dstr = String(next.getDate()).padStart(2, '0');
        weekDates.push(`${ystr}-${mstr}-${dstr}`);
      }

      const conflicted = weekDates.some(d => {
        const sold = soldMap[d];
        if (!sold) return false;
        const morningSponsor = sold.morning || (sold.nombre ? { nombre: sold.nombre, foto_url: sold.foto_url } : null);
        const afternoonSponsor = sold.afternoon || (sold.nombre ? { nombre: sold.nombre, foto_url: sold.foto_url } : null);
        return morningSponsor || afternoonSponsor;
      });

      if (conflicted) {
        alert("⚠️ Esta semana tiene días ya patrocinados. Selecciona otra fecha.");
        return;
      }

      const groupId = `week-${dateStr}`;
      const newSelections = weekDates.map(d => ({ dateStr: d, slot: 'full', selectionGroupId: groupId }));

      setSelectedDates(prev => {
        const filtered = prev.filter(d => !weekDates.includes(d.dateStr));
        return [...filtered, ...newSelections];
      });
    } else if (selectionMode === 'month') {
      const [year, monthStr] = dateStr.split('-');
      const y = parseInt(year);
      const m = parseInt(monthStr) - 1;
      const numDays = new Date(y, m + 1, 0).getDate();
      const monthDates = [];
      for (let d = 1; d <= numDays; d++) {
        const dateString = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        monthDates.push(dateString);
      }

      const conflicted = monthDates.some(d => {
        const sold = soldMap[d];
        if (!sold) return false;
        const morningSponsor = sold.morning || (sold.nombre ? { nombre: sold.nombre, foto_url: sold.foto_url } : null);
        const afternoonSponsor = sold.afternoon || (sold.nombre ? { nombre: sold.nombre, foto_url: sold.foto_url } : null);
        return morningSponsor || afternoonSponsor;
      });

      if (conflicted) {
        alert("⚠️ Este mes tiene días ya patrocinados. Selecciona otra fecha.");
        return;
      }

      const groupId = `month-${year}-${monthStr}`;
      const newSelections = monthDates.map(d => ({ dateStr: d, slot: 'full', selectionGroupId: groupId }));

      setSelectedDates(prev => {
        const filtered = prev.filter(d => !monthDates.includes(d.dateStr));
        return [...filtered, ...newSelections];
      });
    }
  };

  const months = [
    { name: 'Enero 2027', year: 2027, month: 0 },
    { name: 'Febrero 2027', year: 2027, month: 1 },
    { name: 'Marzo 2027', year: 2027, month: 2 },
    { name: 'Abril 2027', year: 2027, month: 3 },
    { name: 'Mayo 2027', year: 2027, month: 4 },
    { name: 'Junio 2027', year: 2027, month: 5 },
    { name: 'Julio 2027', year: 2027, month: 6 },
    { name: 'Agosto 2027', year: 2027, month: 7 },
    { name: 'Septiembre 2027', year: 2027, month: 8 },
    { name: 'Octubre 2027', year: 2027, month: 9 },
    { name: 'Noviembre 2027', year: 2027, month: 10 },
    { name: 'Diciembre 2027', year: 2027, month: 11 },
  ];

  const toolbarOptions = [
    { id: 'day', label: 'un día', displayLabel: 'Un día', icon: <Calendar className="w-5 h-5" />, desc: 'Día Completo (RD$3,000)' },
    { id: 'week', label: 'semana', displayLabel: 'Semana', icon: <CalendarDays className="w-5 h-5" />, desc: 'Semana Completa (7 Días - RD$21,000)' },
    { id: 'month', label: 'un mes', displayLabel: 'Un mes', icon: <CalendarRange className="w-5 h-5" />, desc: 'Mes Completo (Precios variables)' }
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-slate-100 font-sans selection:bg-blue-500 selection:text-white relative overflow-x-hidden">
      <CalendarHeader />

      {/* Desktop Fixed Sidebar (Floating on far left edge of screen) */}
      <div 
        role="radiogroup" 
        aria-label="Modo de selección del calendario"
        className="hidden md:flex flex-col gap-4 fixed left-6 top-1/2 -translate-y-1/2 w-24 bg-[#0a192f]/60 backdrop-blur-md border border-white/10 rounded-3xl p-3 shadow-2xl z-30"
      >
        <p className="text-[9px] font-black text-white/30 text-center uppercase tracking-widest">Modo</p>
        <div className="flex flex-col gap-2">
          {toolbarOptions.map(opt => {
            const active = selectionMode === opt.id;
            return (
              <button
                key={opt.id}
                role="radio"
                aria-checked={active}
                aria-label={`seleccionador de ${opt.label} ${active ? 'activado' : 'desactivado'}`}
                onClick={() => setSelectionMode(opt.id)}
                title={opt.desc}
                className={`
                  w-full py-4 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all
                  ${active 
                    ? 'bg-blue-600 border border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
                    : 'bg-white/5 border border-transparent text-white/60 hover:text-white hover:bg-white/10'}
                `}
              >
                {opt.icon}
                <span className="text-[9px] font-black uppercase tracking-wider text-center leading-none mt-0.5">{opt.displayLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      <main className="pt-32 pb-48 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:pl-28">
              <div className="space-y-4">
                <h2 className="text-5xl md:text-8xl font-black text-white italic tracking-tighter uppercase leading-[0.8]">
                  Cómprame un <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Día</span>
                </h2>
                <p className="text-white/40 font-bold uppercase tracking-[0.5em] text-xs">
                  elige cuántos días quieres ser parte de mi historia
                </p>
              </div>
              
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Días Seleccionados</p>
                  <p className="text-lg font-black text-white italic">{totalDaysCount}</p>
                </div>
                <div className="w-px h-8 bg-white/10"></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Inversión Total</p>
                  <p className="text-lg font-black text-white italic">
                    RD$ {totalPrice.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="md:pl-28">
              <CalendarLegend />
            </div>

            {/* Layout Grid */}
            <div className="flex flex-col md:flex-row gap-8 items-start relative md:pl-28">
              {/* Mobile Top Toolbar Dock */}
              <div 
                role="radiogroup"
                aria-label="Modo de selección del calendario móvil"
                className="md:hidden w-full flex justify-center sticky top-20 z-30 px-2 mb-2"
              >
                <div className="bg-[#0a192f]/85 backdrop-blur-md border border-white/10 rounded-2xl p-1 flex gap-1 shadow-lg w-full max-w-sm overflow-x-auto no-scrollbar">
                  {toolbarOptions.map(opt => {
                    const active = selectionMode === opt.id;
                    return (
                      <button
                        key={opt.id}
                        role="radio"
                        aria-checked={active}
                        aria-label={`seleccionador de ${opt.label} ${active ? 'activado' : 'desactivado'}`}
                        onClick={() => setSelectionMode(opt.id)}
                        className={`
                          flex-1 py-3 px-3 rounded-xl flex items-center justify-center gap-2 transition-all shrink-0
                          ${active 
                            ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.3)]' 
                            : 'text-white/60 hover:text-white'}
                        `}
                      >
                        {opt.icon}
                        <span className="text-xs font-black uppercase tracking-wider">{opt.displayLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Calendar Grids */}
              <div className="flex-1 space-y-32 w-full">
                {months.map((m, idx) => (
                  <MonthGrid
                    key={idx}
                    monthData={m}
                    selectedDates={selectedDates}
                    soldDaysData={soldDaysData}
                    onDateClick={handleDateClick}
                    selectionMode={selectionMode}
                    limitReached={false}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* STICKY FOOTER FOR BATCH SELECTION */}
      <AnimatePresence>
        {selectedDates.length > 0 && !isModalOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 w-full z-40 p-4 md:p-8 pointer-events-none flex justify-center font-sans"
          >
            <div className="bg-[#050505] border border-blue-500/30 rounded-3xl shadow-[0_-10px_40px_rgba(37,99,235,0.2)] p-6 md:px-8 md:py-6 w-full max-w-4xl pointer-events-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="flex items-center gap-6 relative z-10 w-full md:w-auto justify-between md:justify-start">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Días seleccionados</p>
                  <div className="flex items-end gap-2 mt-1">
                    <p className="text-3xl md:text-4xl font-black text-white leading-none">{totalDaysCount}</p>
                    <p className="text-xs text-white/50 font-bold mb-1 uppercase">{totalDaysCount === 1 ? 'Día' : 'Días'}</p>
                  </div>
                </div>

                <div className="h-10 w-px bg-white/10 hidden md:block"></div>

                <div className="text-right md:text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Inversión Total</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xl md:text-2xl font-black text-white italic tracking-tighter">
                      RD$ {totalPrice.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleContinue}
                className="w-full md:w-auto font-black uppercase tracking-widest text-xs px-8 py-4 md:py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 relative z-10 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-blue-500/20"
              >
                Confirmar <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CheckoutFlow
        selectedDays={selectedDates}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setHasManuallyClosed(true);
        }}
      />

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default ComprameUnDia;
