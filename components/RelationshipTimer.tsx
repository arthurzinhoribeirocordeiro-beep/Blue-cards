import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface Props {
  startDate: string;
}

export const RelationshipTimer: React.FC<Props> = ({ startDate }) => {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const start = new Date(startDate).getTime();

    const updateTimer = () => {
      // Validate start date
      if (isNaN(start)) {
         setTime({ days: 0, hours: 0, minutes: 0, seconds: 0 });
         return;
      }
      
      const now = new Date().getTime();
      const distance = now - start;

      if (distance < 0) {
        // Future date
        setTime({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTime({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [startDate]);

  return (
    <div className="relative mx-auto max-w-2xl transform hover:scale-105 transition-transform duration-300">
      {/* Ripple Animation Layers */}
      <div className="absolute -inset-4 bg-baby-200 rounded-[2.5rem] opacity-30 animate-[ping_3s_linear_infinite]"></div>
      <div className="absolute -inset-2 bg-baby-300 rounded-[2.2rem] opacity-20 animate-[ping_3s_linear_infinite_1.5s]"></div>
      
      {/* Main Container */}
      <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-baby-100 z-10">
        <div className="flex items-center justify-center gap-2 mb-4 text-baby-500">
          <Clock size={24} className="animate-spin-slow" />
          <h3 className="text-xl font-bold uppercase tracking-wider">Juntos Há</h3>
        </div>
        
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="flex flex-col p-2 rounded-xl hover:bg-baby-50 transition-colors">
            <span className="text-3xl md:text-5xl font-bold text-baby-600">{time.days}</span>
            <span className="text-xs md:text-sm font-semibold uppercase text-baby-400">Dias</span>
          </div>
          <div className="flex flex-col p-2 rounded-xl hover:bg-baby-50 transition-colors">
            <span className="text-3xl md:text-5xl font-bold text-baby-600">{time.hours}</span>
            <span className="text-xs md:text-sm font-semibold uppercase text-baby-400">Horas</span>
          </div>
          <div className="flex flex-col p-2 rounded-xl hover:bg-baby-50 transition-colors">
            <span className="text-3xl md:text-5xl font-bold text-baby-600">{time.minutes}</span>
            <span className="text-xs md:text-sm font-semibold uppercase text-baby-400">Min</span>
          </div>
          <div className="flex flex-col p-2 rounded-xl hover:bg-baby-50 transition-colors">
            <span className="text-3xl md:text-5xl font-bold text-baby-600">{time.seconds}</span>
            <span className="text-xs md:text-sm font-semibold uppercase text-baby-400">Seg</span>
          </div>
        </div>
      </div>
    </div>
  );
};