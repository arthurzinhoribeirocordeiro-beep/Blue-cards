import React from 'react';
import { X, Heart } from 'lucide-react';

interface Props {
  videoUrl: string;
  onClose: () => void;
}

export const VideoModal: React.FC<Props> = ({ videoUrl, onClose }) => {
  // Simple check to determine if it's a file path/direct link or likely an embed code needs handling
  // For this simplified version, we assume direct URL (mp4) or we try to render it in a video tag.
  // If it's a youtube link, we'd ideally need to parse it to embed format, but for now we trust the user puts a playable link.

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden relative border-4 border-baby-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-baby-100 p-4 flex justify-between items-center border-b border-baby-200">
           <h3 className="font-dancing text-2xl text-baby-800 font-bold flex items-center gap-2">
             <Heart className="fill-baby-500 text-baby-500" size={24} /> 
             Uma Surpresa Especial
           </h3>
           <button 
             onClick={onClose}
             className="p-2 bg-white hover:bg-red-50 text-baby-400 hover:text-red-500 rounded-full transition-colors shadow-sm"
           >
             <X size={24} />
           </button>
        </div>

        {/* Video Container */}
        <div className="flex-1 bg-black flex items-center justify-center p-2">
          {videoUrl ? (
            <video 
              controls 
              autoPlay 
              className="w-full h-full max-h-[70vh] rounded-xl object-contain"
              src={videoUrl}
            >
              Seu navegador não suporta a tag de vídeo.
            </video>
          ) : (
             <div className="text-white text-center p-10">
               <p>Nenhum vídeo foi configurado neste cartão ainda 😢</p>
             </div>
          )}
        </div>
        
        {/* Footer decoration */}
        <div className="bg-baby-50 p-3 text-center text-baby-400 text-sm">
           Feito com muito amor
        </div>
      </div>
    </div>
  );
};