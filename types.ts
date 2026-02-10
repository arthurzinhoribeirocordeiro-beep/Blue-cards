export type ParticleType = 'heart' | 'penguin' | 'snow' | 'star' | 'note' | 'flower';

export interface ParticleConfig {
  types: ParticleType[];
  speed: number; // 1 to 5
  size: number; // 1 to 5
}

export interface CardModel {
  id: string;
  title: string;
  recipientName: string;
  startDate: string; // ISO String
  heroImage: string; // Base64 or URL
  galleryImage: string; // New field for the second photo section
  poemTitle: string;
  poemContent: string;
  musicType: 'mp3' | 'spotify'; // New field for music source type
  musicUrl: string;
  videoMessageUrl: string; // New field for the surprise video
  fontFamily: 'font-nunito' | 'font-dancing' | 'font-playfair' | 'font-pacifico';
  particleConfig: ParticleConfig;
}

export const DEFAULT_CARD: CardModel = {
  id: 'default',
  title: 'Meu Amor',
  recipientName: 'Amor da Minha Vida',
  startDate: new Date().toISOString(),
  heroImage: 'https://images.unsplash.com/photo-1598439210625-5067c578f3f6?auto=format&fit=crop&w=1000&q=80', // Penguins
  galleryImage: 'https://picsum.photos/id/1011/800/800', // Default decorative image
  poemTitle: 'Um Dia Especial',
  poemContent: 'Nos seus olhos encontrei meu lar,\nNo seu sorriso, minha paz.\nCada dia ao seu lado é um presente,\nQue guardo no coração, eternamente.',
  musicType: 'mp3',
  musicUrl: '',
  videoMessageUrl: '', 
  fontFamily: 'font-nunito',
  particleConfig: {
    types: ['heart', 'penguin', 'snow'],
    speed: 3,
    size: 3
  }
};