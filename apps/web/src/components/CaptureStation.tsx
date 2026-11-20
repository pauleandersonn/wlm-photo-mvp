'use client';

import { useState, useCallback, useRef } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  Layers,
  Check,
  User,
  AlertCircle,
  RefreshCw,
  Palette,
  Smile,
  ShieldCheck,
  Image as ImageIcon,
  Info,
} from 'lucide-react';
import { MontageMode, AiRenderStyle, GuestCapture, WeddingEvent } from '@/types';

interface CaptureStationProps {
  event: WeddingEvent;
  onGenerateMemory: (
    capture: GuestCapture,
    mode: MontageMode,
    styleId: string,
    aiStyle?: AiRenderStyle
  ) => Promise<void>;
  isProcessing: boolean;
  processingStep: string;
}

export function CaptureStation({
  event,
  onGenerateMemory,
  isProcessing,
  processingStep,
}: CaptureStationProps) {
  const [guestName, setGuestName] = useState('');
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [capturedMediaId, setCapturedMediaId] = useState<string | undefined>();
  const [montageMode, setMontageMode] = useState<MontageMode>('classic');
  const [aiStyle, setAiStyle] = useState<AiRenderStyle>('hyperrealistic');
  const [selectedTemplate, setSelectedTemplate] = useState(event.themeStyle);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleTakeCameraPhoto = useCallback(async () => {
    try {
      setErrorMessage(null);
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context');
      ctx.drawImage(video, 0, 0);
      stream.getTracks().forEach((t) => t.stop());
      const dataUrl = canvas.toDataURL('image/png');
      setCapturedPhotoUrl(dataUrl);
      setCapturedMediaId(undefined);
    } catch (err: any) {
      console.error('Erro na câmera:', err);
      setErrorMessage('Não foi possível acessar a câmera do dispositivo.');
    } finally {
      setIsCameraActive(false);
    }
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Arquivo deve ser uma imagem.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCapturedPhotoUrl(reader.result);
        setCapturedMediaId(undefined);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleStartComposition = useCallback(async () => {
    if (!capturedPhotoUrl) {
      setErrorMessage('Por favor, fotografe o convidado antes de prosseguir.');
      return;
    }
    if (!event.couplePhotoUrl) {
      setErrorMessage('A fotografia oficial dos noivos não está configurada no painel.');
      return;
    }
    setErrorMessage(null);
    const mimeType = capturedPhotoUrl.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
    const base64 = capturedPhotoUrl.includes(',') ? capturedPhotoUrl.split(',')[1] : capturedPhotoUrl;
    const capturePayload: GuestCapture = {
      guestName: guestName.trim() || 'Convidado Especial',
      base64,
      mimeType,
      mediaId: capturedMediaId,
    };
    await onGenerateMemory(capturePayload, montageMode, selectedTemplate, aiStyle);
  }, [capturedPhotoUrl, event.couplePhotoUrl, guestName, capturedMediaId, montageMode, selectedTemplate, aiStyle, onGenerateMemory]);

  return (
    <div className="space-y-6">
      {/* Event banner context for mobile operator */}
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest block">
            Evento Selecionado
          </span>
          <h2 className="font-playfair text-base font-bold text-stone-900">
            {event.coupleNames}
          </h2>
          <p className="text-xs text-stone-600">
            {event.dateFormatted} • {event.venue}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 bg-white border border-stone-200 rounded-lg text-stone-700">
            Modo Selecionado: {montageMode === 'classic' ? 'Clássica' : 'IA Realista'}
          </span>
        </div>
      </div>
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
      {/* Main capture panel layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Guest Photo Viewport */}
        <div className="md:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-[320px] aspect-[3/4] bg-stone-100 rounded-2xl border-2 border-dashed border-stone-300 overflow-hidden relative flex flex-col items-center justify-center p-3 shadow-sm group">
            {capturedPhotoUrl ? (
              <img
                src={capturedPhotoUrl}
                alt="Foto do convidado"
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <div className="text-center p-4">
                <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-700 mx-auto flex items-center justify-center mb-3">
                  <Camera size={30} />
                </div>
                <p className="font-playfair text-sm font-bold text-stone-800 mb-1">
                  Fotografar Convidado
                </p>
                <p className="text-[11px] text-stone-600 leading-tight">
                  Tire a foto diretamente pela câmera do celular ou importe da galeria
                </p>
              </div>
            )}
            {isCameraActive && (
              <div className="absolute inset-0 bg-stone-900/70 flex flex-col items-center justify-center text-white text-xs gap-2">
                <RefreshCw size={24} className="animate-spin text-amber-400" />
                <span>Abrindo câmera...</span>
              </div>
            )}
          </div>
          {/* Quick Capture Buttons */}
          <div className="flex flex-wrap gap-2 mt-3 w-full max-w-[320px] justify-center">
            <button
              type="button"
              onClick={handleTakeCameraPhoto}
              disabled={isProcessing}
              className="flex-1 min-w-[130px] px-3.5 py-2.5 bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-sm"
            >
              <Camera size={16} />
              Câmera
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="px-3 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition"
            >
              <Upload size={14} />
              Galeria
            </button>
            <label className="px-3 py-2.5 bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition cursor-pointer">
              <ImageIcon size={14} />
              Arquivo
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>
        {/* Right Column: Parameters, Mode Selection & Execution */}
        <div className="md:col-span-7 space-y-5 bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
          {/* Guest identification */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User size={14} className="text-amber-700" />
              Nome do Convidado (Opcional)
            </label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Ex: Mariana Silva"
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-700 transition"
            />
            <p className="text-[11px] text-stone-600 mt-1">
              O nome será impresso na borda inferior da foto lembrança digital.
            </p>
          </div>
          {/* Montage Mode Selection: Classic vs AI */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Escolha o Tipo de Montagem
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Classic Montage */}
              <button
                type="button"
                onClick={() => setMontageMode('classic')}
                className={`p-3.5 rounded-xl border text-left transition-all relative ${
                  montageMode === 'classic'
                    ? 'border-amber-700 bg-amber-50/50 shadow-sm ring-1 ring-amber-700'
                    : 'border-stone-200 bg-stone-50/50 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                    <Layers size={14} className="text-amber-700" />
                    Clássica — Fotos Originais
                  </span>
                  {montageMode === 'classic' && (
                    <div className="w-4 h-4 bg-amber-700 text-white rounded-full flex items-center justify-center">
                      <Check size={10} strokeWidth={3} />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Preserva as fotografias originais com moldura 10x15, monograma dos noivos e alta fidelidade facial.
                </p>
              </button>
              {/* AI Realistic Montage */}
              <button
                type="button"
                onClick={() => setMontageMode('ai')}
                className={`p-3.5 rounded-xl border text-left transition-all relative ${
                  montageMode === 'ai'
                    ? 'border-purple-600 bg-purple-50/50 shadow-sm ring-1 ring-purple-600'
                    : 'border-stone-200 bg-stone-50/50 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-purple-600" />
                    IA Generativa
                  </span>
                  {montageMode === 'ai' && (
                    <div className="w-4 h-4 bg-purple-600 text-white rounded-full flex items-center justify-center">
                      <Check size={10} strokeWidth={3} />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Cria uma composição com IA: Hiper-realista 100% idêntico, Modelo Pixar 3D ou Desenho Cartoon.
                </p>
              </button>
            </div>
          </div>
          {/* AI Style Sub-selector when IA Generativa is selected */}
          {montageMode === 'ai' && (
            <div className="bg-purple-50/70 border border-purple-200/80 rounded-xl p-3.5 space-y-2.5">
              <label className="block text-xs font-bold text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
                <Palette size={14} className="text-purple-600" />
                Estilo de Arte da IA
              </label>
              <div className="grid grid-cols-3 gap-2">
                {/* Hyperrealistic 100% */}
                <button
                  type="button"
                  onClick={() => setAiStyle('hyperrealistic')}
                  className={`p-2.5 rounded-lg border text-left transition flex flex-col justify-between ${
                    aiStyle === 'hyperrealistic'
                      ? 'border-purple-600 bg-white shadow-sm ring-1 ring-purple-600'
                      : 'border-purple-200/60 bg-white/60 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-bold text-stone-900 flex items-center gap-1">
                      <ShieldCheck size={13} className="text-emerald-600" />
                      Hiper-realista
                    </span>
                    {aiStyle === 'hyperrealistic' && (
                      <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                    )}
                  </div>
                  <p className="text-[10px] text-stone-600 leading-tight">
                    100% idêntico às fotos originais: rostos e roupas preservados.
                  </p>
                </button>
                {/* Pixar 3D */}
                <button
                  type="button"
                  onClick={() => setAiStyle('pixar')}
                  className={`p-2.5 rounded-lg border text-left transition flex flex-col justify-between ${
                    aiStyle === 'pixar'
                      ? 'border-purple-600 bg-white shadow-sm ring-1 ring-purple-600'
                      : 'border-purple-200/60 bg-white/60 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-bold text-stone-900 flex items-center gap-1">
                      <Sparkles size={13} className="text-amber-500" />
                      Pixar 3D
                    </span>
                    {aiStyle === 'pixar' && (
                      <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                    )}
                  </div>
                  <p className="text-[10px] text-stone-600 leading-tight">
                    Animação 3D premium estilo longa-metragem Pixar / Disney.
                  </p>
                </button>
                {/* Desenho Cartoon */}
                <button
                  type="button"
                  onClick={() => setAiStyle('cartoon')}
                  className={`p-2.5 rounded-lg border text-left transition flex flex-col justify-between ${
                    aiStyle === 'cartoon'
                      ? 'border-purple-600 bg-white shadow-sm ring-1 ring-purple-600'
                      : 'border-purple-200/60 bg-white/60 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-bold text-stone-900 flex items-center gap-1">
                      <Smile size={13} className="text-rose-500" />
                      Desenho Cartoon
                    </span>
                    {aiStyle === 'cartoon' && (
                      <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                    )}
                  </div>
                  <p className="text-[10px] text-stone-600 leading-tight">
                    Ilustração 2D vibrante, traços expressivos e toque caricato amigável.
                  </p>
                </button>
              </div>
            </div>
          )}
          {/* Informational banner about selected mode */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-600 flex items-start gap-2.5">
            <Info size={16} className="text-stone-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-stone-800">
                {montageMode === 'classic'
                  ? 'Modo Clássico: Rápido & Fiel às Fotos'
                  : aiStyle === 'hyperrealistic'
                  ? 'Modo IA Hiper-realista: Preservação de Rosto e Roupas'
                  : aiStyle === 'pixar'
                  ? 'Modo IA Pixar 3D: Animação Digital 3D Encantadora'
                  : 'Modo IA Desenho Cartoon: Ilustração Estilizada Divertida'}
              </p>
              <p className="text-[11px] mt-0.5">
                {montageMode === 'classic'
                  ? 'Renderiza instantaneamente em JPEG 1200x1800 px (300 DPI) com a foto oficial e a foto capturada sem modificação.'
                  : aiStyle === 'hyperrealistic'
                  ? 'O prompt impõe estrita fidelidade facial, mantendo 100% dos traços faciais, formato dos olhos, sorriso e trajes originais.'
                  : aiStyle === 'pixar'
                  ? 'Transforma o casal e convidado em personagens 3D de filme de animação mantendo reconhecibilidade e charme.'
                  : 'Transforma a cena num desenho animado 2D colorido e elegante de casamento.'}
              </p>
            </div>
          </div>
          {/* Primary Action Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleStartComposition}
              disabled={isProcessing || !capturedPhotoUrl}
              className={`w-full py-3.5 px-6 rounded-xl font-semibold text-xs uppercase tracking-widest text-white shadow transition flex items-center justify-center gap-2 ${
                isProcessing || !capturedPhotoUrl
                  ? 'bg-stone-300 cursor-not-allowed text-stone-500'
                  : montageMode === 'ai'
                  ? 'bg-purple-700 hover:bg-purple-800 active:scale-[0.99]'
                  : 'bg-amber-700 hover:bg-amber-800 active:scale-[0.99]'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>{processingStep || 'Processando Lembrança...'}</span>
                </>
              ) : (
                <>
                  {montageMode === 'ai' ? <Sparkles size={16} /> : <Layers size={16} />}
                  <span>
                    Gerar Lembrança ({montageMode === 'classic' ? 'Clássica' : 'IA'})
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Need to import Info icon
