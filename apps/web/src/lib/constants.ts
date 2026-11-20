import { WeddingEvent } from '@/types';

export const THEME_STYLES = [
  {
    id: 'champagne' as const,
    name: 'Elegante Champagne',
    desc: 'Bordas finas marfim, detalhes em dourado e monograma clássico',
    bg: '#FAF7F2',
    accent: '#C5A059',
    card: '#FFFFFF',
    text: '#2C2621',
  },
  {
    id: 'minimalist' as const,
    name: 'Moderno Minimalista',
    desc: 'Tipografia editorial limpa, preto e branco sofisticado',
    bg: '#FFFFFF',
    accent: '#111827',
    card: '#F9FAFB',
    text: '#111827',
  },
  {
    id: 'botanical' as const,
    name: 'Jardim Botânico',
    desc: 'Toques de verde oliva, folhagens delicadas e ar campestre',
    bg: '#F5F7F4',
    accent: '#4A6B53',
    card: '#FFFFFF',
    text: '#223326',
  },
  {
    id: 'blacktie' as const,
    name: 'Black Tie Noturno',
    desc: 'Fundo escuro dramático, luxo acetinado e dourado fosco',
    bg: '#141416',
    accent: '#E5C07B',
    card: '#1F2024',
    text: '#F3F4F6',
  },
] as const;

export const AI_RENDER_STYLES = [
  {
    id: 'hyperrealistic' as const,
    name: 'Hiper-realista',
    icon: 'ShieldCheck',
    desc: '100% idêntico às fotos originais: rostos e roupas preservados',
    color: 'emerald',
  },
  {
    id: 'pixar' as const,
    name: 'Pixar 3D',
    icon: 'Sparkles',
    desc: 'Animação 3D premium estilo longa-metragem Pixar / Disney',
    color: 'amber',
  },
  {
    id: 'cartoon' as const,
    name: 'Desenho Cartoon',
    icon: 'Smile',
    desc: 'Ilustração 2D vibrante, traços expressivos e toque caricato amigável',
    color: 'rose',
  },
] as const;

export const DEFAULT_COUPLE_PHOTO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#2c2825"/>
          <stop offset="50%" stop-color="#4a3e35"/>
          <stop offset="100%" stop-color="#1f1a17"/>
        </linearGradient>
        <radialGradient id="halo" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stop-color="#e8d5b5" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#e8d5b5" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="800" height="1000" fill="url(#bg)"/>
      <circle cx="400" cy="400" r="380" fill="url(#halo)"/>
      <g fill="#d4af37" opacity="0.15">
        <circle cx="150" cy="200" r="120"/>
        <circle cx="680" cy="280" r="160"/>
        <circle cx="300" cy="850" r="220"/>
      </g>
      <g transform="translate(180, 220)">
        <path d="M 120 180 C 120 130, 160 90, 210 90 C 260 90, 300 130, 300 180 L 320 480 C 320 540, 100 540, 100 480 Z" fill="#181513"/>
        <circle cx="210" cy="95" r="55" fill="#f5d6c6"/>
        <path d="M 160 85 C 160 45, 260 40, 265 85 C 245 70, 185 70, 160 85 Z" fill="#2d1d13"/>
        <polygon points="210,140 190,175 230,175" fill="#ffffff"/>
        <polygon points="200,150 220,150 210,158" fill="#d4af37"/>
        <path d="M 270 200 C 270 145, 310 110, 350 110 C 390 110, 420 145, 420 200 L 470 540 C 470 600, 220 600, 220 540 Z" fill="#faf7f2"/>
        <circle cx="350" cy="115" r="50" fill="#f8dfd4"/>
        <path d="M 305 105 C 305 60, 395 60, 395 105 C 380 90, 320 90, 305 105 Z" fill="#4a2e1d"/>
        <path d="M 290 85 C 350 30, 430 90, 430 380 C 380 320, 320 300, 290 85 Z" fill="#ffffff" fill-opacity="0.35"/>
        <g transform="translate(250, 340)">
          <circle cx="20" cy="15" r="16" fill="#e8d5b5"/>
          <circle cx="35" cy="5" r="14" fill="#ffffff"/>
          <circle cx="10" cy="30" r="14" fill="#d4af37"/>
          <circle cx="32" cy="25" r="12" fill="#c2a68d"/>
          <circle cx="22" cy="18" r="8" fill="#2e4a32"/>
        </g>
      </g>
      <text x="400" y="860" font-family="'Playfair Display', serif" font-size="44" font-style="italic" fill="#e8d5b5" text-anchor="middle" letter-spacing="4">Ana & Pedro</text>
      <text x="400" y="905" font-family="'Playfair Display', serif" font-size="16" fill="#a89a87" text-anchor="middle" letter-spacing="6">FOTOGRAFIA OFICIAL DOS NOIVOS</text>
    </svg>
  `);

export const DEFAULT_GUEST_SAMPLE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
      <defs>
        <linearGradient id="guestBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#3b3345"/>
          <stop offset="100%" stop-color="#1f1b24"/>
        </linearGradient>
      </defs>
      <rect width="800" height="1000" fill="url(#guestBg)"/>
      <circle cx="400" cy="380" r="280" fill="#ffffff" fill-opacity="0.08"/>
      <g transform="translate(200, 180)">
        <path d="M 80 400 C 80 300, 140 250, 200 250 C 260 250, 320 300, 320 400 L 360 620 C 360 660, 40 660, 40 620 Z" fill="#2d3748"/>
        <rect x="175" y="220" width="50" height="50" fill="#f2c8b2" rx="10"/>
        <circle cx="200" cy="160" r="80" fill="#f7d4c1"/>
        <path d="M 120 150 C 120 70, 280 70, 280 150 C 260 110, 140 110, 120 150 Z" fill="#241812"/>
        <polygon points="200,270 170,330 230,330" fill="#ffffff"/>
        <polygon points="185,285 215,285 200,300" fill="#9f7aea"/>
        <circle cx="175" cy="155" r="7" fill="#241812"/>
        <circle cx="225" cy="155" r="7" fill="#241812"/>
        <path d="M 175 185 Q 200 215 225 185" stroke="#a24444" stroke-width="5" fill="none" stroke-linecap="round"/>
      </g>
      <text x="400" y="870" font-family="'Playfair Display', serif" font-size="36" fill="#e2d9f3" text-anchor="middle">Mariana Silva</text>
      <text x="400" y="910" font-family="sans-serif" font-size="14" fill="#a39bb3" text-anchor="middle" letter-spacing="4">FOTO DO CONVIDADO (EXEMPLO)</text>
    </svg>
  `);

export const INITIAL_EVENT: WeddingEvent = {
  id: 'ev-wedding-ana-pedro',
  title: 'Casamento de Ana & Pedro',
  coupleNames: 'Ana & Pedro',
  dateFormatted: '14 de Novembro de 2026',
  venue: 'Villa Giardini — Brasília, DF',
  couplePhotoUrl: DEFAULT_COUPLE_PHOTO,
  themeStyle: 'champagne',
  templateAspectRatio: '10x15',
};