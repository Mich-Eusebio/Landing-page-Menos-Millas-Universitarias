"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import MonthGrid from '@/components/calendar/MonthGrid';
import { getSoldDays } from '@/lib/apis/SorteoActions';

const HomeCalendar = () => {
  const [soldDaysData, setSoldDaysData] = useState([]);

  useEffect(() => {
    getSoldDays().then(data => setSoldDaysData(data));
  }, []);

  const monthData = { name: 'Enero 2027', year: 2027, month: 0 };

  const totalDays = 31;
  const soldCount = soldDaysData.length;
  const availableCount = totalDays - soldCount;
  const soldPercentage = Math.round((soldCount / totalDays) * 100);

  return (
    <section className="py-12 md:py-20 px-6 bg-[#000000] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-600/5 blur-[150px] rounded-full"></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="bg-[#0a192f]/30 border border-white/5 rounded-3xl p-4 md:p-8 backdrop-blur-sm">
          <MonthGrid
            monthData={monthData}
            selectedDates={[]}
            soldDaysData={soldDaysData}
            onDateClick={() => {}}
            onSlotClick={() => {}}
            selectionMode="day"
            limitReached={false}
          />
        </div>

        <div className="text-center mt-8 md:mt-12">
          <Link
            href="/comprame-un-dia"
            className="inline-flex items-center gap-3 px-8 py-5 md:px-12 md:py-6 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black rounded-2xl shadow-2xl shadow-amber-400/20 transition-all uppercase text-base md:text-lg group"
          >
            Reserva tu día
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeCalendar;
