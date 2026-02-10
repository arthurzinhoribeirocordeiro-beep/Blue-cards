import React from 'react';
import { Cat } from 'lucide-react';

interface Props {
  onClick: () => void;
}

export const InteractiveCat: React.FC<Props> = ({ onClick }) => {
  return (
    <div className="flex justify-center my-16 relative z-20">
      <div 
        onClick={onClick}
        className="group relative cursor-pointer transition-transform hover:scale-105 active:scale-95"
      >
        {/* Aesthetic Speech Bubble */}
        <div className="absolute -top-20 -right-20 z-20 animate-bounce" style={{ animationDuration: '3s' }}>
          <div className="relative bg-white text-baby-800 px-6 py-3 rounded-2xl shadow-xl border-2 border-baby-200 max-w-[200px]">
            <p className="font-dancing text-xl font-bold text-center leading-tight">
              Tenho uma surpresa! Clique em mim! 😺
            </p>
            {/* Bubble Tail */}
            <div className="absolute -bottom-2 left-6 w-4 h-4 bg-white border-b-2 border-r-2 border-baby-200 transform rotate-45"></div>
          </div>
        </div>

        {/* Cat Container */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          {/* Outer glow ring */}
          <div className="absolute inset-0 bg-baby-100 rounded-full animate-pulse border-4 border-baby-300 shadow-[0_0_15px_rgba(125,211,252,0.5)]"></div>
          
          {/* Inner circle */}
          <div className="absolute inset-2 bg-white rounded-full"></div>

          {/* Cat Icon */}
          <Cat 
            size={80} 
            className="text-baby-600 fill-baby-200 relative z-10 drop-shadow-md group-hover:rotate-6 transition-transform duration-300" 
            strokeWidth={1.5}
          />
        </div>
      </div>
    </div>
  );
};