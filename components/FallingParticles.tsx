import React, { useEffect, useRef } from 'react';
import { ParticleConfig } from '../types';

interface Props {
  config: ParticleConfig;
}

const EMOJI_MAP: Record<string, string> = {
  heart: '💙',
  penguin: '🐧',
  snow: '❄️',
  star: '⭐',
  note: '🎵',
  flower: '🌸'
};

export const FallingParticles: React.FC<Props> = ({ config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Use a ref for config to access latest values inside animation loop without restarting loop
  const configRef = useRef(config);
  
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      size: number;
      speed: number;
      emoji: string;
      wobble: number;
      wobbleSpeed: number;
    }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const getActiveEmojis = () => {
      const types = configRef.current.types.length > 0 ? configRef.current.types : ['heart'];
      return types.map(t => EMOJI_MAP[t] || '💙');
    };

    const createParticle = (yStart: number = -50) => {
      const emojis = getActiveEmojis();
      const speedMult = Math.max(0.5, configRef.current.speed * 0.5); // 0.5x to 2.5x base speed
      const sizeMult = Math.max(0.5, configRef.current.size * 0.6); // 0.5x to 3x base size

      return {
        x: Math.random() * canvas.width,
        y: yStart,
        size: (Math.random() * 15 + 10) * sizeMult,
        speed: (Math.random() * 2 + 1) * speedMult,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.05,
      };
    };

    const init = () => {
      resize();
      particles = [];
      // Pre-fill
      for (let i = 0; i < 30; i++) {
        particles.push(createParticle(Math.random() * canvas.height));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const emojis = getActiveEmojis();

      // Maintain particle count based on density (correlated to speed/size slightly for visual balance)
      const maxParticles = 50; 
      
      if (Math.random() < 0.05 && particles.length < maxParticles) {
        particles.push(createParticle());
      }

      particles.forEach((p, index) => {
        p.y += p.speed;
        p.wobble += p.wobbleSpeed;
        p.x += Math.sin(p.wobble) * 0.5;

        // If configuration changed emojis drastically, current particle emoji might be stale, 
        // but we let it fall off screen naturally or we can update it? 
        // Let's keep it natural: it falls until it dies.

        ctx.font = `${p.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.emoji, p.x, p.y);

        // Remove if off screen
        if (p.y > canvas.height + 50) {
          particles.splice(index, 1);
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    init();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []); // Empty dependency array: we rely on configRef for updates to avoid canvas flash

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
    />
  );
};