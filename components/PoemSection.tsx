import React from 'react';
import { Flower } from 'lucide-react';

interface Props {
  title: string;
  content: string;
}

export const PoemSection: React.FC<Props> = ({ title, content }) => {
  return (
    <div className="relative bg-white/90 backdrop-blur-sm p-4 md:p-12 rounded-2xl shadow-xl max-w-4xl mx-auto my-12 border border-baby-200 transition-transform hover:scale-[1.01] duration-500">
      {/* Decorative Flowers - Positioned absolutely to frame the letter */}
      <Flower className="absolute -top-3 -left-3 text-baby-400 w-10 h-10 animate-spin-slow drop-shadow-md z-10" />
      <Flower className="absolute -top-3 -right-3 text-baby-400 w-10 h-10 animate-spin-slow drop-shadow-md z-10" />
      <Flower className="absolute -bottom-3 -left-3 text-baby-400 w-10 h-10 animate-spin-slow drop-shadow-md z-10" />
      <Flower className="absolute -bottom-3 -right-3 text-baby-400 w-10 h-10 animate-spin-slow drop-shadow-md z-10" />
      
      {/* Inner Border Frame (The Paper Look) */}
      <div className="border-2 border-baby-300 border-dashed rounded-xl p-6 md:p-12 h-full flex flex-col bg-baby-50/50">
        <h2 className="text-3xl md:text-5xl font-dancing text-baby-800 mb-8 text-center drop-shadow-sm border-b border-baby-200 pb-4 mx-auto px-10">
          {title}
        </h2>
        
        {/* Content Container with improved typography for long texts */}
        <div className="relative">
          <p className="text-lg md:text-xl text-baby-900 leading-loose whitespace-pre-wrap md:text-justify text-left italic font-medium opacity-90 tracking-wide">
            {content}
          </p>
        </div>

        {/* Footer Decoration */}
        <div className="mt-8 flex items-center justify-center gap-2 opacity-60">
           <div className="h-[1px] w-12 bg-baby-400"></div>
           <Flower size={12} className="text-baby-500" />
           <div className="h-[1px] w-12 bg-baby-400"></div>
        </div>
      </div>
    </div>
  );
};