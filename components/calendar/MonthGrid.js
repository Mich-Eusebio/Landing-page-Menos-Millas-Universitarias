import React from 'react';
import { motion } from 'framer-motion';

const MonthGrid = ({ monthData, selectedDates, soldDaysData = [], onDateClick }) => {
  const { name, year, month } = monthData;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 }, (_, i) => i); // Monday start

  // Hitos (Special dates from technical notes)
  const specialDates = [
    '2027-01-25', '2027-02-14', '2027-03-10', '2027-05-15', '2027-08-20', '2027-12-15'
  ];

  const getDateStr = (day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // Build a map for O(1) lookup: dateStr -> { nombre, foto_url }
  const soldMap = Object.fromEntries(soldDaysData.map(d => [d.dateStr, d]));

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">{name}</h3>
        <div className="h-px flex-1 bg-white/10"></div>
      </div>

      <div className="grid grid-cols-7 gap-3 md:gap-6">
        {['L', 'M', 'Mi', 'J', 'V', 'S', 'D'].map(day => (
          <div key={day} className="text-center text-xs md:text-sm font-black text-white/40 uppercase tracking-[0.3em] pb-4">
            {day}
          </div>
        ))}
        
        {blanks.map(b => <div key={`blank-${b}`} />)}

        {days.map(day => {
          const dateStr = getDateStr(day);
          const isSelected = selectedDates.includes(dateStr);
          const soldInfo = soldMap[dateStr];
          const isSold = !!soldInfo;
          const isSpecial = specialDates.includes(dateStr);

          return (
            <motion.button
              key={day}
              whileHover={!isSold ? { scale: 1.08, y: -4 } : {}}
              whileTap={!isSold ? { scale: 0.95 } : {}}
              onClick={() => !isSold && onDateClick(dateStr, isSold)}
              disabled={isSold}
              aria-disabled={isSold}
              className={`
                aspect-square rounded-2xl md:rounded-[1.5rem] border flex flex-col items-center justify-center relative transition-all duration-300 overflow-hidden
                ${isSold 
                  ? 'bg-amber-500/20 border-amber-500/50 cursor-not-allowed shadow-[inset_0_0_20px_rgba(245,158,11,0.15)]' 
                  : isSelected
                    ? 'bg-blue-600 border-blue-400 shadow-[0_0_30px_rgba(37,99,235,0.4),inset_0_0_20px_rgba(255,255,255,0.2)] z-10'
                    : 'bg-[#161b22] border-[#30363d] hover:bg-[#1f2937] hover:border-[#8b949e]'
                }
              `}
            >
              {isSold ? (
                /* --- SOLD DAY: show sponsor info --- */
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-1">
                  {soldInfo.foto_url ? (
                    <img
                      src={soldInfo.foto_url}
                      alt={soldInfo.nombre || 'Patrocinador'}
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-amber-400/60 shadow-md flex-shrink-0"
                      onError={e => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : null}
                  <span className="text-[7px] md:text-[8px] font-black text-amber-400 text-center leading-tight tracking-tight px-0.5 line-clamp-2 w-full">
                    {soldInfo.nombre || ''}
                  </span>
                  <span className="text-[8px] md:text-[9px] font-black text-amber-500/50 leading-none">
                    {day}
                  </span>
                </div>
              ) : (
                <>
                  <span className={`
                    text-lg md:text-2xl font-black transition-colors
                    ${isSelected ? 'text-white' : 'text-white/70'}
                  `}>
                    {day}
                  </span>

                  {isSpecial && !isSelected && (
                    <div className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_12px_rgba(37,99,235,0.8)]" />
                  )}
                </>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default MonthGrid;
