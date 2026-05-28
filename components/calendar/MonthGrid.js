import React from 'react';
import { motion } from 'framer-motion';

const MonthGrid = ({ monthData, selectedDates, soldDaysData = [], onDateClick, limitReached }) => {
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
          
          // Selection info
          const userSelection = selectedDates.find(d => d.dateStr === dateStr);
          const isSelected = !!userSelection;
          const isAMSelected = userSelection && (userSelection.slot === 'morning' || userSelection.slot === 'full');
          const isPMSelected = userSelection && (userSelection.slot === 'afternoon' || userSelection.slot === 'full');
          const isFullSelected = userSelection && userSelection.slot === 'full';
          const isGroupSelection = userSelection && userSelection.selectionGroupId && (userSelection.selectionGroupId.startsWith('week-') || userSelection.selectionGroupId.startsWith('month-'));

          // Sponsor/Sold info
          const soldInfo = soldMap[dateStr];
          let morningSponsor = null;
          let afternoonSponsor = null;

          if (soldInfo) {
            if (soldInfo.morning) {
              morningSponsor = soldInfo.morning;
            } else if (soldInfo.nombre) {
              morningSponsor = { nombre: soldInfo.nombre, foto_url: soldInfo.foto_url };
            }

            if (soldInfo.afternoon) {
              afternoonSponsor = soldInfo.afternoon;
            } else if (soldInfo.nombre) {
              afternoonSponsor = { nombre: soldInfo.nombre, foto_url: soldInfo.foto_url };
            }
          }

          const isAMSold = !!morningSponsor;
          const isPMSold = !!afternoonSponsor;
          const isFullySold = isAMSold && isPMSold;
          
          // Consolidated full day if fully sold to the same person
          const isConsolidatedSold = isFullySold && (morningSponsor.nombre === afternoonSponsor.nombre);

          // Render split view if any slot is occupied or selected, but it's not a consolidated full day
          const isSplit = !isConsolidatedSold && (isAMSold || isPMSold || isAMSelected || isPMSelected);

          const isSpecial = specialDates.includes(dateStr);

          // Connected rounding for weekly selection or consecutive sponsor blocks
          let roundingClass = 'rounded-2xl md:rounded-[1.5rem]';
          if (isGroupSelection) {
            const groupId = userSelection.selectionGroupId;
            const groupSelections = selectedDates
              .filter(d => d.selectionGroupId === groupId)
              .sort((a, b) => a.dateStr.localeCompare(b.dateStr));
              
            const isFirst = groupSelections[0]?.dateStr === dateStr;
            const isLast = groupSelections[groupSelections.length - 1]?.dateStr === dateStr;
            
            if (isFirst) {
              roundingClass = 'rounded-l-2xl md:rounded-l-[1.5rem] rounded-r-none';
            } else if (isLast) {
              roundingClass = 'rounded-r-2xl md:rounded-r-[1.5rem] rounded-l-none';
            } else {
              roundingClass = 'rounded-none';
            }
          } else if (isConsolidatedSold) {
            const [y, m, d] = dateStr.split('-').map(Number);
            const prevDate = new Date(y, m - 1, d - 1);
            const nextDate = new Date(y, m - 1, d + 1);
            
            const prevStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(prevDate.getDate()).padStart(2, '0')}`;
            const nextStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`;
            
            const prevSponsor = soldMap[prevStr]?.nombre;
            const nextSponsor = soldMap[nextStr]?.nombre;
            
            const samePrev = prevSponsor === morningSponsor.nombre;
            const sameNext = nextSponsor === morningSponsor.nombre;
            
            if (samePrev && sameNext) {
              roundingClass = 'rounded-none';
            } else if (samePrev) {
              roundingClass = 'rounded-r-2xl md:rounded-r-[1.5rem] rounded-l-none';
            } else if (sameNext) {
              roundingClass = 'rounded-l-2xl md:rounded-l-[1.5rem] rounded-r-none';
            }
          }

          // Accessibility label
          const monthName = name.split(' ')[0].toLowerCase();
          let ariaLabel = `${day} de ${monthName}`;
          if (isConsolidatedSold) {
            ariaLabel += `, patrocinado por ${morningSponsor.nombre}`;
          } else if (isFullySold) {
            ariaLabel += `, mañana patrocinada por ${morningSponsor.nombre}, tarde patrocinada por ${afternoonSponsor.nombre}`;
          } else {
            const amText = isAMSold 
              ? `mañana ocupada por ${morningSponsor.nombre}` 
              : (isAMSelected ? `mañana seleccionada` : `mañana disponible`);
            const pmText = isPMSold 
              ? `tarde ocupada por ${afternoonSponsor.nombre}` 
              : (isPMSelected ? `tarde seleccionada` : `tarde disponible`);
            ariaLabel += `, ${amText}, ${pmText}`;
          }

          // Center badge for split day numbers
          const dayNumberBadge = (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <span className={`
                text-[10px] md:text-[12px] font-black w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center shadow-md transition-all
                ${isFullSelected 
                  ? 'bg-blue-800 text-white border border-blue-400' 
                  : isConsolidatedSold 
                    ? 'bg-amber-950 text-amber-400 border border-amber-500/50'
                    : isSplit
                      ? 'bg-[#050505] text-white border border-white/20'
                      : 'bg-[#161b22] text-white/90 border border-[#30363d]'
                }
              `}>
                {day}
              </span>
            </div>
          );

          return (
            <motion.button
              key={day}
              whileHover={!isFullySold ? { scale: 1.08, y: -4 } : {}}
              whileTap={!isFullySold ? { scale: 0.95 } : {}}
              onClick={() => !isFullySold && onDateClick(dateStr, isFullySold)}
              disabled={isFullySold}
              aria-disabled={isFullySold}
              aria-label={ariaLabel}
              title={ariaLabel}
              className={`
                aspect-square border flex flex-col items-center justify-center relative transition-all duration-300 overflow-hidden
                ${roundingClass}
                ${isConsolidatedSold 
                  ? 'bg-amber-500/20 border-amber-500/50 cursor-not-allowed shadow-[inset_0_0_20px_rgba(245,158,11,0.15)]' 
                  : isFullSelected
                    ? 'bg-blue-600 border-blue-400 shadow-[0_0_30px_rgba(37,99,235,0.4),inset_0_0_20px_rgba(255,255,255,0.2)] z-10'
                    : isSplit
                      ? 'border-[#30363d] bg-transparent'
                      : 'bg-[#161b22] border-[#30363d] hover:bg-[#1f2937] hover:border-[#8b949e]'
                }
              `}
            >
              {isConsolidatedSold ? (
                /* --- CONSOLIDATED SOLD: show single sponsor --- */
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-1">
                  {morningSponsor.foto_url ? (
                    <img
                      src={morningSponsor.foto_url}
                      alt={morningSponsor.nombre}
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-amber-400/60 shadow-md flex-shrink-0"
                      onError={e => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : null}
                  <span className="text-[7px] md:text-[8px] font-black text-amber-400 text-center leading-tight tracking-tight px-0.5 line-clamp-2 w-full">
                    {morningSponsor.nombre}
                  </span>
                  <span className="text-[8px] md:text-[9px] font-black text-amber-500/50 leading-none">
                    {day}
                  </span>
                </div>
              ) : isSplit ? (
                /* --- SPLIT DAY: AM / PM zones --- */
                <>
                  {/* Left Half (AM) */}
                  <div 
                    title={
                      isAMSold 
                        ? `Mañana (AM) - Patrocinado por ${morningSponsor.nombre}` 
                        : (isAMSelected ? `Mañana (AM) - Seleccionado` : `Mañana (AM) - Disponible`)
                    }
                    className={`
                      absolute inset-y-0 left-0 w-1/2 border-r border-[#30363d]/35 flex flex-col items-center justify-center p-0.5 md:p-1 overflow-hidden transition-colors duration-300
                      ${isAMSold 
                        ? 'bg-amber-500/10' 
                        : isAMSelected 
                          ? 'bg-blue-600' 
                          : 'bg-[#161b22]'}
                    `}
                  >
                    {isAMSold && (
                      <div className="flex flex-col items-center justify-center gap-0.5 w-full text-center">
                        {morningSponsor.foto_url ? (
                          <img
                            src={morningSponsor.foto_url}
                            alt={morningSponsor.nombre}
                            className="w-4 h-4 md:w-6 md:h-6 rounded-full object-cover border border-amber-400/50"
                            onError={e => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : null}
                        <span className="text-[5px] md:text-[7px] font-bold text-amber-400 truncate w-full block">
                          {morningSponsor.nombre}
                        </span>
                      </div>
                    )}
                    {isAMSelected && !isAMSold && (
                      <span className="text-[5px] md:text-[7px] font-black text-blue-200 uppercase tracking-widest">AM</span>
                    )}
                  </div>

                  {/* Right Half (PM) */}
                  <div 
                    title={
                      isPMSold 
                        ? `Tarde (PM) - Patrocinado por ${afternoonSponsor.nombre}` 
                        : (isPMSelected ? `Tarde (PM) - Seleccionado` : `Tarde (PM) - Disponible`)
                    }
                    className={`
                      absolute inset-y-0 right-0 w-1/2 flex flex-col items-center justify-center p-0.5 md:p-1 overflow-hidden transition-colors duration-300
                      ${isPMSold 
                        ? 'bg-amber-500/10' 
                        : isPMSelected 
                          ? 'bg-blue-600' 
                          : 'bg-[#161b22]'}
                    `}
                  >
                    {isPMSold && (
                      <div className="flex flex-col items-center justify-center gap-0.5 w-full text-center">
                        {afternoonSponsor.foto_url ? (
                          <img
                            src={afternoonSponsor.foto_url}
                            alt={afternoonSponsor.nombre}
                            className="w-4 h-4 md:w-6 md:h-6 rounded-full object-cover border border-amber-400/50"
                            onError={e => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : null}
                        <span className="text-[5px] md:text-[7px] font-bold text-amber-400 truncate w-full block">
                          {afternoonSponsor.nombre}
                        </span>
                      </div>
                    )}
                    {isPMSelected && !isPMSold && (
                      <span className="text-[5px] md:text-[7px] font-black text-blue-200 uppercase tracking-widest">PM</span>
                    )}
                  </div>

                  {/* Center Badge for Day number */}
                  {dayNumberBadge}
                </>
              ) : (
                /* --- AVAILABLE DAY --- */
                <>
                  <span className={`
                    text-lg md:text-2xl font-black transition-colors
                    ${isFullSelected ? 'text-white' : 'text-white/70'}
                  `}>
                    {day}
                  </span>

                  {isSpecial && (
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
