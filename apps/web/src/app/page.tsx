'use client';

import { useState, useEffect } from 'react';
import { CaptureStation } from '@/components/CaptureStation';
import { GalleryAndDelivery } from '@/components/GalleryAndDelivery';
import { EventAdmin } from '@/components/EventAdmin';
import { MemoryRecord, WeddingEvent, MontageMode, AiRenderStyle, GuestCapture } from '@/types';
import { INITIAL_EVENT } from '@/lib/constants';
import { renderClassicSouvenir, loadImage } from '@/lib/montageEngine';
import {
  Camera,
  Heart,
  Images,
  Settings,
  Sparkles,
  Info,
  X,
  CheckCircle,
  HelpCircle,
  Layers,
  ArrowRight,
  ShieldCheck,
  Smile,
  Palette,
} from 'lucide-react';

export default function HomePage() {
  // Navigation tabs
  const [activeView, setActiveView] = useState<'capture' | 'gallery' | 'admin'>('capture');
  // Event configuration
  const [event, setEvent] = useState<WeddingEvent>(INITIAL_EVENT);
  // Stored memories (in-memory demonstration store)
  const [memories, setMemories] = useState<MemoryRecord[]>([]);
  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  // Info modal state
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Initialize sample demonstration memory on initial load
  useEffect(() => {
    let isMounted = true;
    async function initSample() {
      try {
        const coupleImg = await loadImage(INITIAL_EVENT.couplePhotoUrl || '');
        const guestImg = await loadImage(
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
            `)
        );
        const initialResultUrl = await renderClassicSouvenir({
          event: INITIAL_EVENT,
          coupleImg,
          guestImg,
          guestName: 'Mariana Silva',
        });
        if (isMounted) {
          const sampleRecord: MemoryRecord = {
            id: 'mem-sample-01',
            token: 'a9f2bc481e',
            guestName: 'Mariana Silva',
            createdAt: 'Hoje às 19:42',
            mode: 'classic',
            templateStyle: 'champagne',
            guestPhotoUrl: guestImg.src,
            resultImageUrl: initialResultUrl,
            status: 'approved',
          };
          setMemories([sampleRecord]);
        }
      } catch (err) {
        console.error('Falha ao inicializar exemplo:', err);
      }
    }
    initSample();
    return () => {
      isMounted = false;
    };
  }, []);

  // Main generation handler for both Classic and AI engines
  const handleGenerateMemory = async (
    capture: GuestCapture,
    mode: MontageMode,
    styleId: string,
    aiStyle: AiRenderStyle = 'hyperrealistic'
  ) => {
    setIsProcessing(true);
    const guestDataUrl = `data:${capture.mimeType};base64,${capture.base64}`;

    try {
      if (mode === 'classic') {
        setProcessingStep('Renderizando montagem clássica 10x15...');
        const coupleImg = await loadImage(event.couplePhotoUrl || '');
        const guestImg = await loadImage(guestDataUrl);
        const resultUrl = await renderClassicSouvenir({
          event,
          coupleImg,
          guestImg,
          guestName: capture.guestName,
        });
        const newToken = Math.random().toString(36).substring(2, 12);
        const now = new Date();
        const timeStr = `Hoje às ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const newMemory: MemoryRecord = {
          id: `mem-${Date.now()}`,
          token: newToken,
          guestName: capture.guestName,
          createdAt: timeStr,
          mode: 'classic',
          templateStyle: styleId,
          guestPhotoUrl: guestDataUrl,
          guestMediaId: capture.mediaId,
          resultImageUrl: resultUrl,
          status: 'ready',
        };
        setMemories((prev) => [newMemory, ...prev]);
        setActiveView('gallery');
      } else {
        // AI Mode - placeholder for now (requires external API)
        setProcessingStep('Modo IA requer integração com provedor externo...');
        // Simulate processing delay
        await new Promise((r) => setTimeout(r, 2000));

        const newToken = Math.random().toString(36).substring(2, 12);
        const now = new Date();
        const timeStr = `Hoje às ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const newMemory: MemoryRecord = {
          id: `mem-${Date.now()}`,
          token: newToken,
          guestName: capture.guestName,
          createdAt: timeStr,
          mode: 'ai',
          aiStyle,
          templateStyle: styleId,
          guestPhotoUrl: guestDataUrl,
          guestMediaId: capture.mediaId,
          resultImageUrl: guestDataUrl, // Placeholder - would be AI result
          status: 'ready',
          promptUsed: `AI ${aiStyle} generation for ${capture.guestName}`,
        };
        setMemories((prev) => [newMemory, ...prev]);
        setActiveView('gallery');
      }
    } catch (err: any) {
      console.error('Falha na geração da lembrança:', err);
      alert('Houve um erro ao processar a lembrança: ' + (err.message || err));
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const handleDeleteMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const handleApproveMemory = (id: string) => {
    setMemories((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'approved' } : m))
    );
  };

  const handleRegenerate = async (memory: MemoryRecord) => {
    const base64 = memory.guestPhotoUrl.includes(',')
      ? memory.guestPhotoUrl.split(',')[1]
      : memory.guestPhotoUrl;
    await handleGenerateMemory(
      {
        guestName: memory.guestName,
        base64,
        mimeType: 'image/jpeg',
        mediaId: memory.guestMediaId,
      },
      memory.mode,
      memory.templateStyle,
      memory.aiStyle || 'hyperrealistic'
    );
  };

  return (
    <div className="w-full h-full min-h-screen bg-[#faf8f5] text-[#2c2621] flex flex-col font-jakarta">
      {/* Main App Container */}
      <div className="flex-1 flex flex-col max-w-6xl w-full mx-auto p-4 md:p-6 min-h-0">
        {/* Navigation & Controls Bar */}
        <header className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-700 text-white flex items-center justify-center shadow-sm">
              <Heart size={18} fill="currentColor" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-playfair text-base font-bold text-stone-900">
                  {event.coupleNames}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 bg-amber-100/80 text-amber-800 rounded-full">
                  Foto Lembrança
                </span>
              </div>
              <p className="text-[11px] text-stone-600">
                {event.dateFormatted} • {memories.length} lembrança{memories.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          {/* Navigation Pill Switcher */}
          <div className="flex items-center bg-stone-200/70 p-1 rounded-xl">
            <button
              onClick={() => setActiveView('capture')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeView === 'capture'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Camera size={14} />
              Captura
            </button>
            <button
              onClick={() => setActiveView('gallery')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition relative ${
                activeView === 'gallery'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Images size={14} />
              Galeria & Entrega
              {memories.length > 0 && (
                <span className="w-4 h-4 bg-amber-700 text-white rounded-full text-[9px] flex items-center justify-center">
                  {memories.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveView('admin')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeView === 'admin'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Settings size={14} />
              Admin
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowInfoModal(true)}
              className="p-2 text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition"
              title="Sobre o We Love Memory"
            >
              <HelpCircle size={18} />
            </button>
          </div>
        </header>
        {/* Dynamic Viewport */}
        <main className="flex-1 min-h-0 overflow-y-auto">
          {activeView === 'capture' && (
            <CaptureStation
              event={event}
              onGenerateMemory={handleGenerateMemory}
              isProcessing={isProcessing}
              processingStep={processingStep}
            />
          )}
          {activeView === 'gallery' && (
            <GalleryAndDelivery
              event={event}
              memories={memories}
              onDeleteMemory={handleDeleteMemory}
              onApproveMemory={handleApproveMemory}
              onRegenerate={handleRegenerate}
            />
          )}
          {activeView === 'admin' && (
            <EventAdmin
              event={event}
              onUpdateEvent={setEvent}
              memoriesCount={memories.length}
            />
          )}
        </main>
      </div>
      {/* Introductory / Technical Specs Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowInfoModal(false)}
              className="absolute top-4 right-4 text-stone-600 hover:text-stone-700 p-1 rounded-lg"
            >
              <X size={18} />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
              <Heart size={24} fill="currentColor" />
            </div>
            <h3 className="font-playfair text-2xl font-bold text-stone-900 mb-1">
              We Love Memory
            </h3>
            <p className="text-xs text-stone-600 mb-4">
              Foto Lembrança Digital para Casamentos • MVP e Arquitetura Técnica
            </p>
            <div className="space-y-3 text-xs text-stone-700 mb-6">
              <div className="flex items-start gap-2.5">
                <CheckCircle size={16} className="text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900">Montagem Clássica (10x15):</strong> Preserva a
                  fotografia original do casal e do convidado em resolução 1200x1800 px (300 DPI) com layout elegante e monograma.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle size={16} className="text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900">Montagem IA com 3 Estilos:</strong> Com <strong>🍌 Nano Banana 2.1</strong>, escolha entre <em>Hiper-realista</em> (preservação 100% de rostos e roupas originais), <em>Modelo Pixar 3D</em> (animação 3D premium) ou <em>Desenho Cartoon</em> (ilustração 2D alegre).
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle size={16} className="text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-stone-900">Entrega Digital por QR Code:</strong> O convidado aponta
                  a câmera do smartphone para o QR Code individual com token seguro e baixa sua foto na hora.
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition"
            >
              Acessar Sistema
            </button>
          </div>
        </div>
      )}
    </div>
  );
}