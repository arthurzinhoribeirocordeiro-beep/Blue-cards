import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import LZString from 'lz-string';
import { X, Copy, AlertTriangle, QrCode } from 'lucide-react';
import { CardModel } from '../types';

interface Props {
  card: CardModel;
  onClose: () => void;
}

export const ShareModal: React.FC<Props> = ({ card, onClose }) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [shareLink, setShareLink] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError('');
    
    // Short delay to allow UI to render before heavy processing
    const timer = setTimeout(() => {
      try {
        // 1. Serialize card
        const json = JSON.stringify(card);
        // 2. Compress
        const compressed = LZString.compressToEncodedURIComponent(json);
        // 3. Construct URL
        const url = `${window.location.origin}${window.location.pathname}?card=${compressed}`;
        setShareLink(url);

        // Check length constraints for QR codes (approx 2.5k limit for reasonable density/safety)
        if (url.length > 2500) {
          setError('O cartão é muito grande para um QR Code. Isso acontece geralmente quando você faz "Upload" de fotos grandes. Para compartilhar via QR Code, por favor, edite o cartão e use um Link (URL) de imagem da internet em vez de enviar o arquivo.');
          setLoading(false);
          return;
        }

        // 4. Generate QR
        QRCode.toDataURL(url, { width: 300, margin: 2, color: { dark: '#0369a1', light: '#ffffff' } }, (err, generatedUrl) => {
          if (err) {
              console.error(err);
              setError('Erro ao gerar QR Code.');
          } else {
              setQrUrl(generatedUrl);
          }
          setLoading(false);
        });
      } catch (e) {
        console.error(e);
        setError('Erro ao processar dados do cartão.');
        setLoading(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [card]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    alert('Link copiado para a área de transferência!');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-baby-900/60 backdrop-blur-sm p-4 animate-fade-in font-nunito">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full relative border-4 border-baby-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-baby-400 hover:text-baby-600 transition-colors bg-baby-50 rounded-full p-1">
          <X size={24} />
        </button>

        <h3 className="text-2xl font-bold text-baby-800 mb-6 text-center flex items-center justify-center gap-2">
           <QrCode className="text-baby-500" />
           Compartilhar Cartão
        </h3>
        
        {error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 mb-4 border border-red-100">
            <AlertTriangle className="shrink-0 mt-1" />
            <p className="text-sm leading-relaxed">{error}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            {loading ? (
                <div className="w-64 h-64 bg-baby-50 animate-pulse rounded-xl flex flex-col items-center justify-center text-baby-300 gap-2 border-2 border-dashed border-baby-200">
                    <QrCode size={48} className="animate-bounce" />
                    <span>Gerando QR Code...</span>
                </div>
            ) : qrUrl ? (
                <div className="p-3 bg-white rounded-xl shadow-lg border border-baby-100">
                    <img src={qrUrl} alt="QR Code" className="rounded-lg max-w-full h-auto" />
                </div>
            ) : null}
            
            <p className="text-center text-baby-600 text-sm px-4">
              Mostre este código para o seu amor escanear e ver o presente no celular del@!
            </p>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-baby-100">
           <label className="block text-xs font-bold text-baby-400 uppercase mb-2 tracking-wider">Link Direto</label>
           <div className="flex gap-2">
             <input 
               readOnly 
               value={shareLink} 
               className="flex-1 bg-baby-50 border border-baby-200 rounded-lg px-3 py-2 text-sm text-baby-800 truncate focus:outline-none focus:ring-2 focus:ring-baby-300"
             />
             <button 
               onClick={copyToClipboard}
               className="bg-baby-500 hover:bg-baby-600 text-white p-2 rounded-lg transition-colors shadow-md"
               title="Copiar Link"
             >
               <Copy size={20} />
             </button>
           </div>
           
           {!error && (
            <p className="text-xs text-baby-400 mt-3 text-center italic">
              Este link contém todo o conteúdo do cartão.
            </p>
           )}
        </div>
      </div>
    </div>
  );
};