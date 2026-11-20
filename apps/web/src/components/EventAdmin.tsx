'use client';

import { useState, FormEvent } from 'react';
import { WeddingEvent } from '@/types';
import { THEME_STYLES } from '@/lib/constants';
import { Flow } from 'flow-sdk';
import {
  Calendar,
  Heart,
  Upload,
  Image as ImageIcon,
  Check,
  Palette,
  Camera,
  Layers,
  Sparkles,
  QrCode,
  ShieldCheck,
  Database,
  Cpu,
} from 'lucide-react';

interface EventAdminProps {
  event: WeddingEvent;
  onUpdateEvent: (updated: WeddingEvent) => void;
  memoriesCount: number;
}

export function EventAdmin({ event, onUpdateEvent, memoriesCount }: EventAdminProps) {
  const [coupleNames, setCoupleNames] = useState(event.coupleNames);
  const [dateFormatted, setDateFormatted] = useState(event.dateFormatted);
  const [venue, setVenue] = useState(event.venue);
  const [themeStyle, setThemeStyle] = useState(event.themeStyle);
  const [couplePhotoUrl, setCouplePhotoUrl] = useState(event.couplePhotoUrl);
  const [coupleMediaId, setCoupleMediaId] = useState(event.coupleMediaId);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'architecture'>('info');

  const handleSelectFromGallery = async () => {
    try {
      const item = await Flow.media.select({ filter: 'image' });
      if (item) {
        const url = `data:${item.mimeType};base64,${item.base64}`;
        setCouplePhotoUrl(url);
        setCoupleMediaId(item.mediaId);
        onUpdateEvent({
          ...event,
          couplePhotoUrl: url,
          coupleMediaId: item.mediaId,
        });
      }
    } catch (err) {
      console.error('Erro ao selecionar foto dos noivos:', err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCouplePhotoUrl(reader.result);
          setCoupleMediaId(undefined);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    onUpdateEvent({
      ...event,
      coupleNames,
      dateFormatted,
      venue,
      themeStyle,
      couplePhotoUrl,
      coupleMediaId,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Sub-navigation tabs */}
      <div className="flex border-b border-stone-200">
        <button
          onClick={() => setActiveTab('info')}
          className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === 'info'
              ? 'border-amber-700 text-stone-900'
              : 'border-transparent text-stone-600 hover:text-stone-800'
          }`}
        >
          <Heart size={14} className="text-amber-700" />
          Configuração do Evento
        </button>
        <button
          onClick={() => setActiveTab('architecture')}
          className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 -mb-px flex items-center gap-2 ${
            activeTab === 'architecture'
              ? 'border-amber-700 text-stone-900'
              : 'border-transparent text-stone-600 hover:text-stone-800'
          }`}
        >
          <Cpu size={14} className="text-amber-700" />
          Especificação Técnica do MVP
        </button>
      </div>
      {activeTab === 'architecture' ? (
        <div className="space-y-6 text-stone-700">
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-5">
            <h3 className="font-playfair text-lg font-bold text-stone-900 mb-2 flex items-center gap-2">
              <Database size={18} className="text-amber-700" />
              Arquitetura Técnica do We Love Memory
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed mb-4">
              O sistema foi estruturado para cumprir com o fluxo operacional do casamento sem sobrecarregar a equipe no salão.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-white p-3.5 rounded-lg border border-stone-200 space-y-1.5">
                <span className="font-bold text-stone-900 flex items-center gap-1.5">
                  <Camera size={14} className="text-amber-700" /> 1. Captura e Operação
                </span>
                <p className="text-stone-600">
                  Operador fotografa com celular ou câmera do tablet. Prévia instantânea com confirmação antes do disparo do motor.
                </p>
              </div>
              <div className="bg-white p-3.5 rounded-lg border border-stone-200 space-y-1.5">
                <span className="font-bold text-stone-900 flex items-center gap-1.5">
                  <Layers size={14} className="text-amber-700" /> 2. Motor Clássico (10x15)
                </span>
                <p className="text-stone-600">
                  Canvas de alta resolução (1200x1800 px) a 300 DPI, combinando foto oficial dos noivos, foto do convidado, monograma e tipografia fina.
                </p>
              </div>
              <div className="bg-white p-3.5 rounded-lg border border-stone-200 space-y-1.5">
                <span className="font-bold text-stone-900 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-700" /> 3. Motor IA Realista
                </span>
                <p className="text-stone-600">
                  Geração multimodal com <span className="font-semibold text-stone-900">🍌 Nano Banana 2.1</span> utilizando referências visuais do casal e do convidado para harmonizar luz e ambiente.
                </p>
              </div>
              <div className="bg-white p-3.5 rounded-lg border border-stone-200 space-y-1.5">
                <span className="font-bold text-stone-900 flex items-center gap-1.5">
                  <QrCode size={14} className="text-amber-700" /> 4. Entrega Digital Segura
                </span>
                <p className="text-stone-600">
                  Geração de QR Code e tokens randômicos individuais. O convidado escaneia na tela do operador e recebe sua lembrança com 1 clique.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
            <ShieldCheck size={20} className="text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900 mb-0.5">Segurança & Privacidade no Evento</p>
              <p className="text-amber-800 leading-relaxed">
                As lembranças dos convidados são isoladas por tokens de entrega. O modo clássico garante 100% de fidelidade facial imediata, e o modo IA passa por aprovação do operador na galeria.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: General Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Nomes dos Noivos
                </label>
                <input
                  type="text"
                  value={coupleNames}
                  onChange={(e) => setCoupleNames(e.target.value)}
                  placeholder="Ex: Ana & Pedro"
                  className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-700 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Data Comemorativa
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={dateFormatted}
                    onChange={(e) => setDateFormatted(e.target.value)}
                    placeholder="Ex: 14 de Novembro de 2026"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-700 transition"
                    required
                  />
                  <Calendar size={16} className="absolute left-3 top-3 text-stone-600" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Local / Cidade do Casamento
                </label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="Ex: Villa Giardini — Brasília, DF"
                  className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-700 transition"
                  required
                />
              </div>
              {/* Theme Template Selection */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Palette size={14} className="text-amber-700" />
                  Identidade Visual da Lembrança
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {THEME_STYLES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setThemeStyle(t.id)}
                      className={`p-3 rounded-lg border text-left transition-all relative ${
                        themeStyle === t.id
                          ? 'border-amber-700 bg-amber-50/50 shadow-sm ring-1 ring-amber-700'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-stone-900">{t.name}</span>
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-stone-300"
                          style={{ backgroundColor: t.accent }}
                        />
                      </div>
                      <p className="text-[11px] text-stone-600 leading-snug line-clamp-2">
                        {t.desc}
                      </p>
                      {themeStyle === t.id && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-amber-700 text-white rounded-full flex items-center justify-center">
                          <Check size={10} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* Right: Couple Photo Upload & Preview */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Fotografia Oficial dos Noivos
                </label>
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 flex flex-col items-center">
                  <div className="w-full aspect-[4/5] max-w-[240px] bg-stone-200 rounded-lg overflow-hidden border border-stone-300 shadow-inner relative group">
                    {couplePhotoUrl ? (
                      <img
                        src={couplePhotoUrl}
                        alt="Fotografia dos noivos"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-stone-600 text-xs">
                        <ImageIcon size={32} className="mb-2 opacity-50" />
                        Nenhuma foto enviada
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3 w-full justify-center">
                    <button
                      type="button"
                      onClick={handleSelectFromGallery}
                      className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition shadow-sm"
                    >
                      <Upload size={14} />
                      Galeria do Flow
                    </button>
                    <label className="px-3 py-2 bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer">
                      <ImageIcon size={14} />
                      Arquivo Local
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                  <p className="text-[11px] text-stone-600 mt-2 text-center">
                    Esta fotografia será integrada a todas as montagens clássicas e servirá como referência para o motor de IA.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-stone-200">
            <div className="text-xs text-stone-600">
              Lembranças salvas no evento: <span className="font-semibold text-stone-900">{memoriesCount}</span>
            </div>
            <div className="flex items-center gap-3">
              {savedSuccess && (
                <span className="text-xs text-emerald-800 flex items-center gap-1 font-semibold">
                  <Check size={14} /> Configurações salvas!
                </span>
              )}
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition shadow-sm"
              >
                Salvar Configurações
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}