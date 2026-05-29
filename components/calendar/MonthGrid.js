'use client';
import React from 'react';
import { motion } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────────
// TIER MAP — plan_seleccionado ID → visual color
// Each tier communicates a different sponsorship depth and commitment level.
// ─────────────────────────────────────────────────────────────────────────────
const TIER_MAP = {
  halfDay:          { color: '#3A86FF', glow: 'rgba(58, 134, 255, 0.5)',  label: 'Half Day'        },
  dreamDay:         { color: '#00C896', glow: 'rgba(0, 200, 150, 0.5)',  label: 'Dream Day'       },
  continuousImpact: { color: '#00C896', glow: 'rgba(0, 200, 150, 0.5)',  label: 'Impacto Continuo' },
  careerSprint:     { color: '#9B5DE5', glow: 'rgba(155, 93, 229, 0.5)', label: 'Career Sprint'    },
  silverJourney:    { color: '#A0AEC0', glow: 'rgba(160, 174, 192, 0.5)', label: 'Silver Journey'   },
  legacyMonth:      { color: '#FFD700', glow: 'rgba(255, 215, 0, 0.5)',   label: 'Legacy Month'     },
};

const DEFAULT_TIER = { color: '#00C896', glow: 'rgba(0, 200, 150, 0.5)', label: 'Patrocinado' };

const getTier = (planId) => TIER_MAP[planId] ?? DEFAULT_TIER;

// ─────────────────────────────────────────────────────────────────────────────

const MonthGrid = ({
  monthData,
  selectedDates,
  soldDaysData = [],
  onDateClick,
  onSlotClick,
  selectionMode,
  limitReached,
}) => {
  const { name, year, month } = monthData;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  // Monday-start blanks (Sunday = 0 → 6 blanks, else firstDay - 1)
  const blanks = Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 }, (_, i) => i);

  // Special milestone dates
  const specialDates = [
    '2027-01-25', '2027-02-14', '2027-03-10',
    '2027-05-15', '2027-08-20', '2027-12-15',
  ];

  const getDateStr = (day) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  // O(1) lookup map: dateStr → soldDay object
  const soldMap = Object.fromEntries(soldDaysData.map((d) => [d.dateStr, d]));

  // Build consecutive sponsor groups for merge-strip rendering
  const sponsorGroups = (() => {
    const entries = Object.entries(soldMap)
      .filter(([, d]) => d.nombre)
      .sort(([a], [b]) => a.localeCompare(b));

    const groups = [];
    let current = null;

    for (const [dateStr, info] of entries) {
      const sponsor = info.nombre;
      if (!current) {
        current = { sponsor, planId: info.plan_seleccionado, dates: [dateStr] };
        continue;
      }
      const prevDate = new Date(current.dates[current.dates.length - 1]);
      const curDate  = new Date(dateStr);
      const diff     = (curDate - prevDate) / (1000 * 60 * 60 * 24);

      if (sponsor === current.sponsor && diff === 1) {
        current.dates.push(dateStr);
      } else {
        groups.push(current);
        current = { sponsor, planId: info.plan_seleccionado, dates: [dateStr] };
      }
    }
    if (current) groups.push(current);
    return groups;
  })();

  // ───────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">{name}</h3>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <div className="grid grid-cols-7 gap-3 md:gap-6">
        {/* Day-of-week headers */}
        {['L', 'M', 'Mi', 'J', 'V', 'S', 'D'].map((d) => (
          <div
            key={d}
            className="text-center text-xs md:text-sm font-black text-white/40 uppercase tracking-[0.3em] pb-4"
          >
            {d}
          </div>
        ))}

        {/* Leading blank cells */}
        {blanks.map((b) => <div key={`blank-${b}`} />)}

        {/* Day cells */}
        {days.map((day) => {
          const dateStr = getDateStr(day);

          // ── User selection state ──
          const userSelection    = selectedDates.find((d) => d.dateStr === dateStr);
          const isAMSelected     = userSelection && (userSelection.slot === 'morning'   || userSelection.slot === 'full');
          const isPMSelected     = userSelection && (userSelection.slot === 'afternoon' || userSelection.slot === 'full');
          const isFullSelected   = userSelection && userSelection.slot === 'full';
          const isGroupSelection = userSelection?.selectionGroupId &&
            (userSelection.selectionGroupId.startsWith('week-') ||
             userSelection.selectionGroupId.startsWith('month-'));

          // ── Sold/sponsor state ──
          const soldInfo = soldMap[dateStr];
          let morningSponsor   = null;
          let afternoonSponsor = null;

          if (soldInfo) {
            if (soldInfo.morning) {
              morningSponsor = soldInfo.morning;
            } else if (soldInfo.nombre) {
              morningSponsor = {
                nombre:           soldInfo.nombre,
                foto_url:         soldInfo.foto_url,
                plan_seleccionado: soldInfo.plan_seleccionado,
              };
            }
            if (soldInfo.afternoon) {
              afternoonSponsor = soldInfo.afternoon;
            } else if (soldInfo.nombre) {
              afternoonSponsor = {
                nombre:           soldInfo.nombre,
                foto_url:         soldInfo.foto_url,
                plan_seleccionado: soldInfo.plan_seleccionado,
              };
            }
          }

          const isAMSold          = !!morningSponsor;
          const isPMSold          = !!afternoonSponsor;
          const isFullySold       = isAMSold && isPMSold;
          const isConsolidatedSold = isFullySold && morningSponsor.nombre === afternoonSponsor.nombre;

          const shouldRenderSplit =
            !isConsolidatedSold &&
            !isGroupSelection &&
            (isAMSold || isPMSold || isAMSelected || isPMSelected || selectionMode === 'half');

          const isSpecial = specialDates.includes(dateStr);
          const monthName = name.split(' ')[0].toLowerCase();

          // ── Rounding class based on position in group ──
          let roundingClass = 'rounded-2xl md:rounded-[1.5rem]';

          if (isGroupSelection) {
            const groupId         = userSelection.selectionGroupId;
            const groupSelections = selectedDates
              .filter((d) => d.selectionGroupId === groupId)
              .sort((a, b) => a.dateStr.localeCompare(b.dateStr));
            const isFirst = groupSelections[0]?.dateStr === dateStr;
            const isLast  = groupSelections[groupSelections.length - 1]?.dateStr === dateStr;
            if (isFirst)      roundingClass = 'rounded-l-2xl md:rounded-l-[1.5rem] rounded-r-none';
            else if (isLast)  roundingClass = 'rounded-r-2xl md:rounded-r-[1.5rem] rounded-l-none';
            else              roundingClass = 'rounded-none';

          } else if (isConsolidatedSold) {
            const [y, m, d] = dateStr.split('-').map(Number);
            const prevDate  = new Date(y, m - 1, d - 1);
            const nextDate  = new Date(y, m - 1, d + 1);
            const prevStr   = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(prevDate.getDate()).padStart(2, '0')}`;
            const nextStr   = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`;
            const samePrev  = soldMap[prevStr]?.nombre === morningSponsor.nombre;
            const sameNext  = soldMap[nextStr]?.nombre === morningSponsor.nombre;
            if (samePrev && sameNext) roundingClass = 'rounded-none';
            else if (samePrev)        roundingClass = 'rounded-r-2xl md:rounded-r-[1.5rem] rounded-l-none';
            else if (sameNext)        roundingClass = 'rounded-l-2xl md:rounded-l-[1.5rem] rounded-r-none';
          }

          // ── Consecutive sponsor group ──
          const sponsorGroup   = sponsorGroups.find((g) => g.dates.includes(dateStr));
          const isGroupSponsored = sponsorGroup && sponsorGroup.dates.length > 1;

          if (isGroupSponsored) {
            // Update rounding for merged strip
            const isFirst = sponsorGroup.dates[0] === dateStr;
            const isLast  = sponsorGroup.dates[sponsorGroup.dates.length - 1] === dateStr;
            if (isFirst)     roundingClass = 'rounded-l-2xl md:rounded-l-[1.5rem] rounded-r-none';
            else if (isLast) roundingClass = 'rounded-r-2xl md:rounded-r-[1.5rem] rounded-l-none';
            else             roundingClass = 'rounded-none';
          }

          // ── MERGED STRIP: render only once on the first day of the group ──
          if (isGroupSponsored) {
            if (sponsorGroup.dates[0] !== dateStr) return null; // skip non-first days

            const spanLength     = sponsorGroup.dates.length;
            const groupDayNumbers = sponsorGroup.dates.map((d) => parseInt(d.split('-')[2], 10));
            const tier           = getTier(sponsorGroup.planId);
            const sponsorSubtitle = spanLength === 7
              ? 'Patrocinó esta semana'
              : spanLength >= 28
              ? 'Patrocinó este mes'
              : `Patrocinó ${spanLength} días`;

            const startDate = new Date(sponsorGroup.dates[0] + 'T00:00:00');
            const endDate = new Date(sponsorGroup.dates[sponsorGroup.dates.length - 1] + 'T00:00:00');
            const options = { day: 'numeric', month: 'long', year: 'numeric' };
            const startStr = startDate.toLocaleDateString('es-ES', options);
            const endStr = endDate.toLocaleDateString('es-ES', options);
            const ariaLabel = `${startStr} hasta el ${endStr} patrocinado por ${sponsorGroup.sponsor ?? 'sponsor'}`;

            return (
              <motion.button
                key={dateStr}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  gridColumn:  `span ${spanLength}`,
                  gridRow:     'span 1',
                  borderColor: tier.color,
                  boxShadow:   `0 0 14px ${tier.glow}, 0 0 32px ${tier.glow.replace('0.5', '0.2')}, inset 0 0 16px ${tier.glow.replace('0.5', '0.06')}`,
                }}
                className={`
                  h-full border-2 flex flex-col relative overflow-hidden ${roundingClass}
                  cursor-pointer bg-[#0d1a0f]/50
                `}
                aria-label={ariaLabel}
              >
                {/* Gradient bg tinted to tier color */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    background: `linear-gradient(135deg, ${tier.color}33 0%, transparent 60%, ${tier.color}22 100%)`,
                  }}
                />

                {/* Day numbers row - Fixed Matrix Style */}
                <div className="relative flex w-full pt-2 md:pt-3 px-1 z-10 border-b border-white/5">
                  {groupDayNumbers.map((dn, i) => (
                    <span
                      key={i}
                      className="flex-1 text-center text-xs md:text-sm font-black"
                      style={{ color: `${tier.color}CC` }}
                    >
                      {dn}
                    </span>
                  ))}
                </div>

                {/* Sponsor branding - Content Layer */}
                <div className="relative flex-1 flex items-center justify-center gap-3 md:gap-4 px-4 pb-2 z-10">
                  {morningSponsor?.foto_url ? (
                    <img
                      src={morningSponsor.foto_url}
                      alt={morningSponsor.nombre}
                      className="w-10 h-10 md:w-16 md:h-16 rounded-full object-cover flex-shrink-0 border-2 shadow-2xl"
                      style={{ borderColor: tier.color }}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : null}
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm md:text-xl font-black leading-none tracking-tighter truncate text-white uppercase italic">
                      {morningSponsor?.nombre}
                    </span>
                    <span className="text-[10px] md:text-xs font-bold leading-tight truncate mt-1" style={{ color: `${tier.color}AA` }}>
                      {sponsorSubtitle}
                    </span>
                  </div>
                </div>

                {/* Tier badge */}
                <div
                  className="absolute top-1.5 right-2 text-[6px] md:text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full z-10"
                  style={{ color: tier.color, background: `${tier.color}22`, border: `1px solid ${tier.color}44` }}
                >
                  {tier.label}
                </div>
              </motion.button>
            );
          }

          // ── Day-number badge (used in split view) ──
          const dayNumberBadge = (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <span className={`
                text-[10px] md:text-[12px] font-black w-6 h-6 md:w-8 md:h-8 rounded-full
                flex items-center justify-center shadow-md transition-all
                ${isFullSelected
                  ? 'bg-blue-800 text-white border border-blue-400'
                  : isConsolidatedSold
                    ? 'bg-amber-950 text-amber-400 border border-amber-500/50'
                    : shouldRenderSplit
                      ? 'bg-[#050505] text-white border border-white/20'
                      : 'bg-[#161b22] text-white/90 border border-[#30363d]'
                }
              `}>
                {day}
              </span>
            </div>
          );

          // ── SPLIT VIEW: half-day sold / selected ──
          if (shouldRenderSplit) {
            const amActive = isAMSelected;
            const amSold   = isAMSold;
            const pmActive = isPMSelected;
            const pmSold   = isPMSold;

            const amLabel = `${day} de ${monthName} mañana ${amSold ? 'ocupada por ' + morningSponsor.nombre : amActive ? 'seleccionada' : 'disponible'}`;
            const pmLabel = `${day} de ${monthName} tarde ${pmSold ? 'ocupada por ' + afternoonSponsor.nombre : pmActive ? 'seleccionada' : 'disponible'}`;

            return (
              <div
                key={dateStr}
                className={`aspect-square border relative transition-all duration-300 overflow-hidden ${roundingClass} border-[#30363d] bg-transparent`}
              >
                {/* Morning AM */}
                <button
                  role="radio"
                  aria-checked={amActive}
                  aria-label={amLabel}
                  title={amLabel}
                  disabled={amSold}
                  onClick={() => onSlotClick(dateStr, 'morning')}
                  className={`absolute top-0 left-0 w-full h-1/2 border-b border-[#30363d]/50 flex flex-col items-center justify-center p-0.5 md:p-1 transition-all
                    ${amSold
                      ? 'bg-amber-500/10 cursor-not-allowed text-amber-500/40'
                      : amActive
                        ? 'bg-blue-600 text-white shadow-[inset_0_0_10px_rgba(255,255,255,0.1)]'
                        : 'bg-[#161b22] text-white/50 hover:bg-[#1f2937] hover:text-white'
                    }`}
                >
                  {amSold ? (
                    <div className="flex flex-col items-center justify-center gap-0.5 w-full text-center">
                      {morningSponsor.foto_url ? (
                        <img src={morningSponsor.foto_url} alt={morningSponsor.nombre}
                          className="w-4 h-4 md:w-6 md:h-6 rounded-full object-cover border border-amber-400/50"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      ) : null}
                      <span className="text-[5px] md:text-[7px] font-bold text-amber-400 truncate w-full block">{morningSponsor.nombre}</span>
                    </div>
                  ) : (
                    <span className="text-[5px] md:text-[7px] font-black tracking-widest uppercase opacity-60">☀️</span>
                  )}
                </button>

                {/* Afternoon PM */}
                <button
                  role="radio"
                  aria-checked={pmActive}
                  aria-label={pmLabel}
                  title={pmLabel}
                  disabled={pmSold}
                  onClick={() => onSlotClick(dateStr, 'afternoon')}
                  className={`absolute bottom-0 left-0 w-full h-1/2 flex flex-col items-center justify-center p-0.5 md:p-1 transition-all
                    ${pmSold
                      ? 'bg-amber-500/10 cursor-not-allowed text-amber-500/40'
                      : pmActive
                        ? 'bg-blue-600 text-white shadow-[inset_0_0_10px_rgba(255,255,255,0.1)]'
                        : 'bg-[#161b22] text-white/50 hover:bg-[#1f2937] hover:text-white'
                    }`}
                >
                  {pmSold ? (
                    <div className="flex flex-col items-center justify-center gap-0.5 w-full text-center">
                      {afternoonSponsor.foto_url ? (
                        <img src={afternoonSponsor.foto_url} alt={afternoonSponsor.nombre}
                          className="w-4 h-4 md:w-6 md:h-6 rounded-full object-cover border border-amber-400/50"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      ) : null}
                      <span className="text-[5px] md:text-[7px] font-bold text-amber-400 truncate w-full block">{afternoonSponsor.nombre}</span>
                    </div>
                  ) : (
                    <span className="text-[5px] md:text-[7px] font-black tracking-widest uppercase opacity-60">🌙</span>
                  )}
                </button>

                {dayNumberBadge}
              </div>
            );
          }

// ── FULL DAY: available, selected, or consolidated sold ──
          let ariaLabel = `${day} de ${monthName}`;
          if (isConsolidatedSold) ariaLabel += `, patrocinado por ${morningSponsor.nombre}`;
          else ariaLabel += isFullSelected ? ' seleccionada' : ' disponible';

          // Tier color for consolidated single-day sold block
          const singleTier = isConsolidatedSold
            ? getTier(morningSponsor?.plan_seleccionado ?? soldInfo?.plan_seleccionado)
            : null;

          return (
            <motion.button
              key={dateStr}
              whileHover={!isFullySold ? { scale: 1.08, y: -4 } : {}}
              whileTap={!isFullySold ? { scale: 0.95 } : {}}
              onClick={() => !isFullySold && onDateClick(dateStr, isFullySold)}
              disabled={isFullySold}
              aria-disabled={isFullySold}
              aria-label={ariaLabel}
              title={ariaLabel}
              style={isConsolidatedSold && singleTier ? {
                borderColor: singleTier.color,
                boxShadow:   `inset 0 0 20px ${singleTier.glow.replace('0.5', '0.15')}`,
              } : {}}
              className={`
                aspect-square border flex flex-col items-center justify-center relative transition-all duration-300 overflow-hidden
                ${roundingClass}
                ${isConsolidatedSold
                  ? 'bg-[#050505] cursor-not-allowed'
                  : isFullSelected
                    ? 'bg-blue-600 border-blue-400 shadow-[0_0_30px_rgba(37,99,235,0.4),inset_0_0_20px_rgba(255,255,255,0.2)] z-10'
                    : 'bg-[#161b22] border-[#30363d] hover:bg-[#1f2937] hover:border-[#8b949e]'
                }
              `}
            >
              {isConsolidatedSold ? (
                <div className="absolute inset-0 flex flex-col items-stretch z-10">
                  {/* Day Number - Matrix Top */}
                  <div className="pt-2 text-center border-b border-white/5 pb-1">
                    <span className="text-xs md:text-sm font-black" style={{ color: `${singleTier?.color ?? DEFAULT_TIER.color}80` }}>
                      {day}
                    </span>
                  </div>
                  
                  {/* Sponsor Content */}
                  <div className="flex-1 flex flex-col items-center justify-center p-1 gap-1">
                    {morningSponsor.foto_url ? (
                      <img
                        src={morningSponsor.foto_url}
                        alt={morningSponsor.nombre}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 shadow-lg flex-shrink-0"
                        style={{ borderColor: singleTier?.color ?? DEFAULT_TIER.color }}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : null}
                    <span className="text-[8px] md:text-[10px] font-black text-center leading-none tracking-tighter truncate text-white uppercase italic w-full px-1">
                      {morningSponsor.nombre}
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="absolute top-2 w-full text-center">
                     <span className={`text-xs md:text-sm font-black transition-colors ${isFullSelected ? 'text-white' : 'text-white/40'}`}>
                      {day}
                    </span>
                  </div>
                  {!isFullSelected && (
                    <div className="mt-4 flex flex-col items-center opacity-20">
                       <span className="text-[10px] font-bold uppercase tracking-widest">Libre</span>
                    </div>
                  )}
                  {isSpecial && (
                    <div className="absolute bottom-3 right-3 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_12px_rgba(37,99,235,0.8)]" />
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
