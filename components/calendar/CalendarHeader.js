import React from 'react';
import { motion } from 'framer-motion';

const CalendarHeader = () => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#0a192f]/80 backdrop-blur-md border-b border-white/5 py-6">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-blue-500 font-bold uppercase tracking-widest text-xs mb-2 block">
            Cómprame un Día
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter">
            elige cuántos días quieres ser parte de <span className="text-blue-500">mi historia</span>
          </h1>
        </motion.div>
      </div>
    </header>
  );
};

export default CalendarHeader;
