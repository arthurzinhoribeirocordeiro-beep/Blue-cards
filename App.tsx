import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import LZString from 'lz-string';
import { 
  Heart, 
  Edit3, 
  Trash2, 
  Plus, 
  Save, 
  X, 
  Image as ImageIcon, 
  Music as MusicIcon, 
  Calendar,
  Type,
  ArrowLeft,
  QrCode,
  Sparkles,
  Video
} from 'lucide-react';
import { FallingParticles } from './components/FallingParticles';
import { RelationshipTimer } from './components/RelationshipTimer';
import { PoemSection } from './components/PoemSection';
import { MusicPlayer } from './components/MusicPlayer';
import { ShareModal } from './components/ShareModal';
import { InteractiveCat } from './components/InteractiveCat';
import { VideoModal } from './components/VideoModal';
import { CardModel, DEFAULT_CARD, ParticleType } from './types';

// Fonts map for selection
const FONTS = [
  { name: 'Nunito (Moderno)', value: 'font-nunito' },
  { name: 'Dancing Script (Manuscrito)', value: 'font-dancing' },
  { name: 'Playfair (Clássico)', value: 'font-playfair' },
  { name: 'Pacifico (Divertido)', value: 'font-pacifico' },
];

const PARTICLE_OPTIONS: { id: ParticleType; label: string; icon: string }[] = [
  { id: 'heart', label: 'Corações', icon: '💙' },
  { id: 'penguin', label: 'Pinguins', icon: '🐧' },
  { id: 'snow', label: 'Neve', icon: '❄️' },
  { id: 'star', label: 'Estrelas', icon: '⭐' },
  { id: 'note', label: 'Música', icon: '🎵' },
  { id: 'flower', label: 'Flores', icon: '🌸' },
];

// --- Explosion Component ---
const ExplosionCanvas = ({ onComplete }: { onComplete: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      size: number;
      emoji: string;
      rotation: number;
      rotSpeed: number;
    }> = [];

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 3; // Approx where the heart is

    // Create particles
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 15 + 5;
      particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        life: 1.0,
        size: Math.random() * 30 + 20,
        emoji: Math.random() > 0.5 ? '💙' : '🌹',
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach(p => {
        if (p.life > 0) {
          alive = true;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.5; // Gravity
          p.vx *= 0.95; // Drag
          p.vy *= 0.95;
          p.life -= 0.015; // Fade out
          p.rotation += p.rotSpeed;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.font = `${p.size}px serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // Apply filter to turn Red Roses blue
          if (p.emoji === '🌹') {
             ctx.filter = 'hue-rotate(210deg) brightness(1.2)';
          }
          
          ctx.fillText(p.emoji, 0, 0);
          ctx.restore();
        }
      });

      if (alive) {
        animationId = requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, [onComplete]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[60]" />;
};


function App() {
  const [cards, setCards] = useState<CardModel[]>(() => {
    const saved = localStorage.getItem('blue_love_cards');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration: Ensure all cards have new fields (like particleConfig, musicType, galleryImage)
        return parsed.map((c: any) => ({
          ...DEFAULT_CARD, // Fills in defaults
          ...c,
          particleConfig: c.particleConfig || DEFAULT_CARD.particleConfig,
          videoMessageUrl: c.videoMessageUrl || '',
          musicType: c.musicType || 'mp3',
          galleryImage: c.galleryImage || DEFAULT_CARD.galleryImage
        }));
      } catch (e) {
        console.error("Error parsing saved cards", e);
        return [DEFAULT_CARD];
      }
    }
    return [DEFAULT_CARD];
  });
  
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<CardModel | null>(null);
  const [showExplosion, setShowExplosion] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  
  // Share state
  const [cardToShare, setCardToShare] = useState<CardModel | null>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('blue_love_cards', JSON.stringify(cards));
  }, [cards]);

  // Check for shared card in URL on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get('card');
    
    if (sharedData) {
      try {
        const decompressed = LZString.decompressFromEncodedURIComponent(sharedData);
        if (decompressed) {
          const parsedCard = JSON.parse(decompressed);
          
          // Verify integrity
          if (parsedCard && parsedCard.title) {
             const newId = uuidv4();
             // Maintain original title for better experience, merge with default to ensure new props exist
             const newCard = { 
               ...DEFAULT_CARD,
               ...parsedCard, 
               id: newId,
               particleConfig: parsedCard.particleConfig || DEFAULT_CARD.particleConfig,
               videoMessageUrl: parsedCard.videoMessageUrl || '',
               musicType: parsedCard.musicType || 'mp3',
               galleryImage: parsedCard.galleryImage || DEFAULT_CARD.galleryImage
             };
             
             // Confirm before adding
             if (confirm(`Você recebeu um cartão especial: "${parsedCard.title}".\nDeseja abrir e salvar este presente?`)) {
               setCards(prev => {
                 return [...prev, newCard];
               });
               
               // Clean URL
               window.history.replaceState({}, '', window.location.pathname);
               
               // Immediately open the card
               setActiveCardId(newId);
             }
          }
        }
      } catch (e) {
        console.error("Erro ao importar cartão", e);
      }
    }
  }, []);

  const activeCard = cards.find(c => c.id === activeCardId) || cards[0];

  // Handlers
  const handleCreate = () => {
    const newCard: CardModel = { ...DEFAULT_CARD, id: uuidv4(), title: 'Novo Modelo' };
    setCards([...cards, newCard]);
    setActiveCardId(newCard.id);
    setEditForm(newCard);
    setIsEditing(true);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (cards.length === 1) {
      alert("Você precisa ter pelo menos um modelo!");
      return;
    }
    if (confirm("Tem certeza que deseja excluir este modelo?")) {
      const newCards = cards.filter(c => c.id !== id);
      setCards(newCards);
      if (activeCardId === id) setActiveCardId(null);
    }
  };

  const handleShare = (e: React.MouseEvent, card: CardModel) => {
    e.stopPropagation();
    setCardToShare(card);
  };

  const handleSave = () => {
    if (editForm) {
      try {
        setCards(cards.map(c => c.id === editForm.id ? editForm : c));
        setIsEditing(false);
        setEditForm(null);
      } catch (e) {
        alert("Erro ao salvar! O conteúdo pode ser muito grande para o navegador. Tente reduzir o tamanho das imagens ou vídeos.");
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editForm) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm({ ...editForm, heroImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handler for the second image (Gallery/Moments)
  const handleGalleryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editForm) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm({ ...editForm, galleryImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Video Upload Handler - Warning: LocalStorage limits are strict (approx 5MB)
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editForm) {
      // Basic size check (limit to 1GB as requested)
      const ONE_GB = 1024 * 1024 * 1024;
      if (file.size > ONE_GB) {
        alert("O vídeo é muito grande! Por favor, use um vídeo menor que 1GB ou use um Link (URL) externo.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm({ ...editForm, videoMessageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleParticleType = (type: ParticleType) => {
    if (!editForm) return;
    const currentTypes = editForm.particleConfig.types;
    let newTypes: ParticleType[];
    
    if (currentTypes.includes(type)) {
      newTypes = currentTypes.filter(t => t !== type);
    } else {
      newTypes = [...currentTypes, type];
    }
    
    // Ensure at least one is selected
    if (newTypes.length === 0) newTypes = ['heart'];

    setEditForm({
      ...editForm,
      particleConfig: {
        ...editForm.particleConfig,
        types: newTypes
      }
    });
  };
  
  // View: Card Selection List
  if (!activeCardId) {
    return (
      <div className="min-h-screen bg-baby-50 p-8 font-nunito relative overflow-hidden">
        <FallingParticles config={DEFAULT_CARD.particleConfig} />
        <div className="relative z-10 max-w-6xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-5xl font-dancing text-baby-800 mb-4">Meus Presentes Especiais</h1>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cards.map(card => (
              <div 
                key={card.id}
                onClick={() => setActiveCardId(card.id)}
                className="bg-white rounded-2xl shadow-xl overflow-hidden cursor-pointer hover:shadow-2xl hover:scale-105 transition-all border-2 border-transparent hover:border-baby-300 group"
              >
                <div className="h-48 bg-baby-100 relative">
                  <img src={card.heroImage} alt="Cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-baby-800 mb-2 truncate">{card.title}</h3>
                  <p className="text-baby-500 text-sm mb-4">Para: {card.recipientName}</p>
                  <div className="flex justify-between items-center pt-4 border-t border-baby-100">
                    <button 
                      onClick={(e) => handleShare(e, card)}
                      className="text-baby-500 hover:text-baby-700 p-2 rounded-full hover:bg-baby-50 transition-colors flex items-center gap-1 text-sm font-bold"
                      title="Gerar QR Code"
                    >
                      <QrCode size={18} /> Salvar/QR
                    </button>
                    <button 
                      onClick={(e) => handleDelete(e, card.id)}
                      className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button 
              onClick={handleCreate}
              className="bg-white/50 border-4 border-dashed border-baby-300 rounded-2xl flex flex-col items-center justify-center p-8 text-baby-400 hover:text-baby-600 hover:border-baby-500 hover:bg-white/80 transition-all min-h-[300px]"
            >
              <Plus size={64} className="mb-4" />
              <span className="text-xl font-bold">Criar Novo Modelo</span>
            </button>
          </div>
        </div>
        
        {cardToShare && (
           <ShareModal card={cardToShare} onClose={() => setCardToShare(null)} />
        )}
      </div>
    );
  }

  // View: Edit Mode
  if (isEditing && editForm) {
    return (
      <div className="min-h-screen bg-baby-50 p-4 md:p-8 font-nunito overflow-y-auto">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-baby-600 p-6 flex justify-between items-center text-white sticky top-0 z-50">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Edit3 /> Editando Cartão
            </h2>
            <div className="flex gap-2">
              <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-baby-700 rounded-lg transition">
                <X />
              </button>
              <button onClick={handleSave} className="px-6 py-2 bg-white text-baby-600 rounded-full font-bold hover:bg-baby-50 transition flex items-center gap-2">
                <Save size={18} /> Salvar
              </button>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* General Info */}
            <section className="space-y-4">
              <h3 className="text-xl font-bold text-baby-800 border-b pb-2 border-baby-200">Informações Básicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-baby-600 mb-1">Nome do Modelo (para você)</label>
                  <input 
                    type="text" 
                    value={editForm.title} 
                    onChange={e => setEditForm({...editForm, title: e.target.value})}
                    className="w-full p-3 rounded-lg border border-baby-200 focus:ring-2 focus:ring-baby-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-baby-600 mb-1">Nome da Pessoa Amada</label>
                  <input 
                    type="text" 
                    value={editForm.recipientName} 
                    onChange={e => setEditForm({...editForm, recipientName: e.target.value})}
                    className="w-full p-3 rounded-lg border border-baby-200 focus:ring-2 focus:ring-baby-400 focus:outline-none"
                  />
                </div>
              </div>
            </section>

            {/* Date & Style */}
            <section className="space-y-4">
              <h3 className="text-xl font-bold text-baby-800 border-b pb-2 border-baby-200 flex items-center gap-2">
                <Calendar size={20} /> Data e Estilo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-baby-600 mb-1">Data do Início do Namoro/Evento</label>
                  <input 
                    type="datetime-local" 
                    value={editForm.startDate && editForm.startDate.length >= 16 ? editForm.startDate.substring(0, 16) : ''} 
                    onChange={e => {
                      const val = e.target.value;
                      if (!val) return;
                      const date = new Date(val);
                      if (!isNaN(date.getTime())) {
                        setEditForm({...editForm, startDate: date.toISOString()});
                      }
                    }}
                    className="w-full p-3 rounded-lg border border-baby-200 focus:ring-2 focus:ring-baby-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-baby-600 mb-1">Fonte Principal</label>
                  <select 
                    value={editForm.fontFamily}
                    onChange={(e: any) => setEditForm({...editForm, fontFamily: e.target.value})}
                    className="w-full p-3 rounded-lg border border-baby-200 focus:ring-2 focus:ring-baby-400 focus:outline-none"
                  >
                    {FONTS.map(f => (
                      <option key={f.value} value={f.value}>{f.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

             {/* Animation Configuration */}
             <section className="space-y-4">
              <h3 className="text-xl font-bold text-baby-800 border-b pb-2 border-baby-200 flex items-center gap-2">
                <Sparkles size={20} /> Animação
              </h3>
              <div>
                <label className="block text-sm font-semibold text-baby-600 mb-3">Elementos Caindo</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  {PARTICLE_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => toggleParticleType(opt.id)}
                      className={`p-3 rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${
                        editForm.particleConfig.types.includes(opt.id)
                          ? 'bg-baby-100 border-baby-400 text-baby-800'
                          : 'bg-white border-baby-100 text-baby-400 hover:border-baby-200'
                      }`}
                    >
                      <span className="text-xl">{opt.icon}</span>
                      <span className="font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-sm font-semibold text-baby-600">Velocidade</label>
                      <span className="text-xs text-baby-400">{editForm.particleConfig.speed}x</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="5" 
                      step="0.5"
                      value={editForm.particleConfig.speed}
                      onChange={e => setEditForm({
                        ...editForm, 
                        particleConfig: { ...editForm.particleConfig, speed: parseFloat(e.target.value) }
                      })}
                      className="w-full h-2 bg-baby-100 rounded-lg appearance-none cursor-pointer accent-baby-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                       <label className="text-sm font-semibold text-baby-600">Tamanho</label>
                       <span className="text-xs text-baby-400">{editForm.particleConfig.size}x</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="5" 
                      step="0.5"
                      value={editForm.particleConfig.size}
                      onChange={e => setEditForm({
                        ...editForm, 
                        particleConfig: { ...editForm.particleConfig, size: parseFloat(e.target.value) }
                      })}
                      className="w-full h-2 bg-baby-100 rounded-lg appearance-none cursor-pointer accent-baby-500"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Media */}
            <section className="space-y-4">
              <h3 className="text-xl font-bold text-baby-800 border-b pb-2 border-baby-200 flex items-center gap-2">
                <ImageIcon size={20} /> Mídia
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-sm font-semibold text-baby-600 mb-1">Foto Principal (Upload)</label>
                   <input 
                     type="file" 
                     accept="image/*"
                     onChange={handleImageUpload}
                     className="w-full p-2 text-sm text-baby-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-baby-100 file:text-baby-700 hover:file:bg-baby-200"
                   />
                </div>
                
                {/* Second Photo Upload */}
                <div>
                   <label className="block text-sm font-semibold text-baby-600 mb-1">Foto Momentos (Upload)</label>
                   <input 
                     type="file" 
                     accept="image/*"
                     onChange={handleGalleryImageUpload}
                     className="w-full p-2 text-sm text-baby-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-baby-100 file:text-baby-700 hover:file:bg-baby-200"
                   />
                </div>
                
                {/* Music Selection with Spotify Support */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-baby-600 mb-2">Música de Fundo</label>
                  
                  <div className="flex gap-2 mb-3">
                    <button
                       onClick={() => setEditForm({...editForm, musicType: 'mp3'})}
                       className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold border transition-all ${editForm.musicType === 'mp3' ? 'bg-baby-500 text-white border-baby-500' : 'bg-white text-baby-400 border-baby-200'}`}
                    >
                      MP3 / Link Direto
                    </button>
                    <button
                       onClick={() => setEditForm({...editForm, musicType: 'spotify'})}
                       className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold border transition-all ${editForm.musicType === 'spotify' ? 'bg-[#1DB954] text-white border-[#1DB954]' : 'bg-white text-baby-400 border-baby-200'}`}
                    >
                      Spotify
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder={editForm.musicType === 'spotify' ? "Link da Música ou Playlist do Spotify" : "https://exemplo.com/musica.mp3"}
                      value={editForm.musicUrl} 
                      onChange={e => setEditForm({...editForm, musicUrl: e.target.value})}
                      className="w-full p-3 rounded-lg border border-baby-200 focus:ring-2 focus:ring-baby-400 focus:outline-none"
                    />
                    <div className="text-xs text-baby-400 self-center">
                        <MusicIcon size={16} />
                    </div>
                  </div>
                  <p className="text-xs text-baby-400 mt-1">
                    {editForm.musicType === 'spotify' 
                      ? "Cole o link 'Compartilhar' do Spotify (Música ou Playlist)." 
                      : "Use links diretos para arquivos de áudio (.mp3)."}
                  </p>
                </div>
              </div>
              
              {/* New Video Section */}
              <div className="border-t border-baby-100 pt-4 mt-2">
                <label className="block text-sm font-semibold text-baby-600 mb-1 flex items-center gap-2">
                   <Video size={16} /> Vídeo Surpresa (Aparece ao clicar no Gatinho)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                         <label className="text-xs text-baby-400 mb-1 block">Opção A: Link Direto (Recomendado)</label>
                         <input 
                            type="text" 
                            placeholder="URL do vídeo (ex: .mp4)"
                            value={editForm.videoMessageUrl} 
                            onChange={e => setEditForm({...editForm, videoMessageUrl: e.target.value})}
                            className="w-full p-3 rounded-lg border border-baby-200 focus:ring-2 focus:ring-baby-400 focus:outline-none"
                         />
                    </div>
                    <div>
                        <label className="text-xs text-baby-400 mb-1 block">Opção B: Upload (Máx 1GB)</label>
                        <input 
                            type="file" 
                            accept="video/*"
                            onChange={handleVideoUpload}
                            className="w-full p-2 text-sm text-baby-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-baby-100 file:text-baby-700 hover:file:bg-baby-200"
                        />
                    </div>
                </div>
              </div>
            </section>

            {/* Poem */}
            <section className="space-y-4">
              <h3 className="text-xl font-bold text-baby-800 border-b pb-2 border-baby-200 flex items-center gap-2">
                <Type size={20} /> Cantinho do Poema
              </h3>
              <div>
                <label className="block text-sm font-semibold text-baby-600 mb-1">Título do Poema</label>
                <input 
                  type="text" 
                  value={editForm.poemTitle} 
                  onChange={e => setEditForm({...editForm, poemTitle: e.target.value})}
                  className="w-full p-3 rounded-lg border border-baby-200 focus:ring-2 focus:ring-baby-400 focus:outline-none mb-4"
                />
                <label className="block text-sm font-semibold text-baby-600 mb-1">Conteúdo</label>
                <textarea 
                  rows={6}
                  value={editForm.poemContent}
                  onChange={e => setEditForm({...editForm, poemContent: e.target.value})}
                  className="w-full p-3 rounded-lg border border-baby-200 focus:ring-2 focus:ring-baby-400 focus:outline-none"
                />
              </div>
            </section>

          </div>
        </div>
      </div>
    );
  }

  // View: Active Card Display (The Gift)
  return (
    <div className={`min-h-screen relative overflow-x-hidden ${activeCard.fontFamily}`}>
      <FallingParticles config={activeCard.particleConfig || DEFAULT_CARD.particleConfig} />
      
      {showExplosion && <ExplosionCanvas onComplete={() => setShowExplosion(false)} />}
      
      {showVideo && (
        <VideoModal 
            videoUrl={activeCard.videoMessageUrl} 
            onClose={() => setShowVideo(false)} 
        />
      )}
      
      <MusicPlayer src={activeCard.musicUrl} type={activeCard.musicType} />

      {/* Navigation Controls */}
      <div className="fixed top-4 left-4 z-50 flex gap-2">
        <button 
          onClick={() => setActiveCardId(null)}
          className="bg-white/80 p-2 rounded-full shadow-lg hover:bg-white text-baby-600 transition"
          title="Voltar"
        >
          <ArrowLeft size={24} />
        </button>
        <button 
          onClick={() => { setEditForm(activeCard); setIsEditing(true); }}
          className="bg-white/80 p-2 rounded-full shadow-lg hover:bg-white text-baby-600 transition"
          title="Editar"
        >
          <Edit3 size={24} />
        </button>
        <button 
          onClick={() => setCardToShare(activeCard)}
          className="bg-white/80 p-2 rounded-full shadow-lg hover:bg-white text-baby-600 transition"
          title="QR Code"
        >
          <QrCode size={24} />
        </button>
      </div>

      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img src={activeCard.heroImage} alt="Hero" className="w-full h-full object-cover opacity-90" />
          <div className="absolute inset-0 bg-baby-900/30 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-baby-50 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 text-center px-4 animate-fade-in-up">
          <div 
             className="inline-block bg-white/20 backdrop-blur-md p-8 rounded-full border border-white/40 shadow-2xl mb-8 transform hover:scale-105 transition-transform duration-700 cursor-pointer select-none"
             onDoubleClick={() => setShowExplosion(true)}
             title="Dê um clique duplo!"
          >
             <Heart className="text-baby-200 w-20 h-20 md:w-32 md:h-32 animate-pulse fill-baby-400" />
          </div>
          <h1 className="text-6xl md:text-8xl font-dancing text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.3)] mb-4">
            Feliz Aniversário
          </h1>
          <h2 className="text-4xl md:text-6xl text-baby-100 font-bold drop-shadow-lg">
            {activeCard.recipientName}
          </h2>
          <p className="text-white/60 text-sm mt-4 animate-pulse">(Dê um clique duplo no coração!)</p>
        </div>
        
        <div className="absolute bottom-10 left-0 right-0 text-center animate-bounce text-white/80">
          <p className="text-sm uppercase tracking-widest">Role para baixo</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-baby-50 py-20 px-4 relative z-10">
        <div className="max-w-4xl mx-auto space-y-24">
          
          {/* Timer Section */}
          <section className="text-center">
             <h3 className="text-3xl text-baby-800 font-bold mb-8">Cada segundo ao seu lado conta</h3>
             <RelationshipTimer startDate={activeCard.startDate} />
          </section>

          {/* Poem Section */}
          <section>
             <PoemSection title={activeCard.poemTitle} content={activeCard.poemContent} />
          </section>

          {/* Photo Gallery Placeholder (Visual Enhancement) */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white p-8 rounded-3xl shadow-lg border border-baby-100">
             <div className="order-2 md:order-1">
                <img 
                  src={activeCard.galleryImage} 
                  alt="Decorative" 
                  className="rounded-2xl shadow-md rotate-[-3deg] hover:rotate-0 transition-transform duration-500 w-full h-auto object-cover" 
                />
             </div>
             <div className="order-1 md:order-2 text-center md:text-left space-y-4">
                <h3 className="text-4xl font-dancing text-baby-700">Momentos Inesquecíveis</h3>
                <p className="text-baby-800 text-lg leading-relaxed">
                  Que este dia seja tão lindo quanto o seu sorriso e tão especial quanto você é para mim.
                  Vamos celebrar hoje e todos os dias que virão.
                </p>
                <div className="flex justify-center md:justify-start gap-4 text-baby-400">
                   <Heart className="fill-current" />
                   <Heart className="fill-current" />
                   <Heart className="fill-current" />
                </div>
             </div>
          </section>

          {/* Interactive Cat Section (Moved to Bottom) */}
          <section className="flex justify-center">
            <InteractiveCat onClick={() => {
                setShowExplosion(true);
                // Delay showing video slightly so explosion starts first
                setTimeout(() => setShowVideo(true), 1000);
            }} />
          </section>

        </div>

        {/* Footer */}
        <footer className="mt-24 text-center text-baby-400 pb-10">
           <p className="flex items-center justify-center gap-2">
             Feito com <Heart size={16} className="fill-baby-400 animate-pulse" /> para você
           </p>
        </footer>
      </div>

      {cardToShare && (
         <ShareModal card={cardToShare} onClose={() => setCardToShare(null)} />
      )}
    </div>
  );
}

export default App;