'use client';

import { useState } from 'react';
import { MemoryRecord, WeddingEvent } from '@/types';
import { QRCodeCard } from './QRCodeCard';
import {
  Download,
  Share2,
  Trash2,
  ExternalLink,
  Sparkles,
  Layers,
  CheckCircle,
  Eye,
  Check,
  RotateCcw,
  Copy,
} from 'lucide-react';

interface GalleryAndDeliveryProps {
  event: WeddingEvent;
  memories: MemoryRecord[];
  onDeleteMemory: (id: string) => void;
  onApproveMemory: (id: string) => void;
  onRegenerate: (memory: MemoryRecord) => void;
}

export function GalleryAndDelivery({
  event,
  memories,
  onDeleteMemory,
  onApproveMemory,
  onRegenerate,
}: GalleryAndDeliveryProps) {
  const [selectedMemory, setSelectedMemory] = useState<MemoryRecord | null>(
    memories[0] || null
  );
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const activeMemory = selectedMemory || memories[0];

  const handleDownload = async (memory: MemoryRecord) => {
    try {
      const response = await fetch(memory.resultImageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanName = memory.guestName.replace(/[^a-zA-Z0-9]/g, '_') || 'Lembranca';
      const ext = memory.resultImageUrl.startsWith('data:image/png') ? 'png' : 'jpg';
      a.download = `WeLoveMemory_${cleanName}_${memory.token.slice(0, 6)}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao baixar:', err);
    }
  };

  const handleCopyLink = (token: string) => {
    const url = `${window.location.origin}/l/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  if (memories.length === 0) {
    return (
      <div className="bg-stone-50 border border-dashed border-stone-300 rounded-2xl p-12 text-center text-stone-600">
        <Sparkles size={36} className="mx-auto mb-3 text-amber-700/60" />
        <h4 className="font-playfair text-lg font-bold text-stone-900 mb-1">
          Nenhuma lembrança gerada ainda
        </h4>
        <p className="text-xs text-stone-600 max-w-sm mx-auto">
          Utilize a aba de <strong>Captura</strong> para fotografar o primeiro convidado do casamento de {event.coupleNames}.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Side: Thumbnail List of Memories */}
        <div className="w-full md:w-80 shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
              Lembranças Realizadas ({memories.length})
            </h4>
            <span className="text-[11px] text-stone-600">Mais recentes</span>
          </div>
          <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
            {memories.map((m) => {
              const isSelected = activeMemory?.id === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMemory(m)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 relative ${
                    isSelected
                      ? 'border-amber-700 bg-amber-50/60 shadow-sm ring-1 ring-amber-700'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <img
                    src={m.resultImageUrl}
                    alt={m.guestName}
                    className="w-14 h-16 object-cover rounded-lg border border-stone-200 shrink-0 bg-stone-100"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-xs font-bold text-stone-900 truncate">
                        {m.guestName || 'Convidado'}
                      </span>
                      {m.mode === 'ai' ? (
                        <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-[9px] font-bold uppercase flex items-center gap-0.5 shrink-0">
                          <Sparkles size={8} /> {m.aiStyle === 'pixar' ? 'Pixar 3D' : m.aiStyle === 'cartoon' ? 'Cartoon' : 'Hiper-realista'}
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-stone-100 text-stone-700 rounded text-[9px] font-bold uppercase flex items-center gap-0.5 shrink-0">
                          <Layers size={8} /> Clássica
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-600 truncate">
                      {m.createdAt} • #{m.token.slice(0, 6)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {m.status === 'approved' ? (
                        <span className="text-[10px] text-emerald-800 flex items-center gap-0.5 font-medium">
                          <CheckCircle size={10} /> Aprovada
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-800 font-medium">
                          Pronta para entrega
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Right Side: Active Souvenir Preview & Digital Delivery Terminal */}
        {activeMemory && (
          <div className="flex-1 min-w-0 bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-playfair text-xl font-bold text-stone-900">
                    {activeMemory.guestName || 'Lembrança do Convidado'}
                  </h3>
                  {activeMemory.mode === 'ai' ? (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {activeMemory.aiStyle === 'pixar'
                        ? 'Modelo Pixar 3D'
                        : activeMemory.aiStyle === 'cartoon'
                        ? 'Desenho Cartoon'
                        : 'IA Hiper-realista (Preservação Total)'}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      Montagem Clássica 10x15
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-600 mt-0.5">
                  Gerada para {event.coupleNames} • {activeMemory.createdAt}
                </p>
              </div>
              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload(activeMemory)}
                  className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                >
                  <Download size={14} />
                  Baixar Imagem
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyLink(activeMemory.token)}
                  className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
                  title="Copiar link de entrega digital"
                >
                  {copiedToken === activeMemory.token ? (
                    <>
                      <Check size={14} className="text-emerald-800" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Share2 size={14} />
                      Link
                    </>
                  )}
                </button>
                {activeMemory.status !== 'approved' && (
                  <button
                    type="button"
                    onClick={() => onApproveMemory(activeMemory.id)}
                    className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
                  >
                    <CheckCircle size={14} />
                    Aprovar
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onDeleteMemory(activeMemory.id)}
                  className="p-2 text-stone-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Excluir lembrança"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Central high-res visual render preview */}
              <div className="lg:col-span-7 flex flex-col items-center">
                <div className="w-full max-w-[340px] aspect-[2/3] bg-stone-100 rounded-xl overflow-hidden shadow-lg border border-stone-200 relative group">
                  <img
                    src={activeMemory.resultImageUrl}
                    alt="Foto Lembrança Final"
                    className="w-full h-full object-contain bg-stone-900"
                  />
                  <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleDownload(activeMemory)}
                      className="px-3 py-1.5 bg-white text-stone-900 rounded-lg text-xs font-semibold shadow flex items-center gap-1"
                    >
                      <Download size={12} /> Salvar HD
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-stone-600 mt-2 text-center">
                  Formato proporcional 10 × 15 cm • Alta resolução digital
                </p>
              </div>
              {/* QR Code and Delivery Station for Guest */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-center">
                  <h5 className="font-playfair text-sm font-bold text-stone-900 mb-1">
                    Entrega Digital Instantânea
                  </h5>
                  <p className="text-[11px] text-stone-600 mb-3">
                    Aponte a câmera do celular do convidado para ler o QR Code e abrir a lembrança:
                  </p>
                  <div className="flex justify-center mb-3">
                    <QRCodeCard
                      value={`${window.location.origin}/l/${activeMemory.token}`}
                      guestName={activeMemory.guestName}
                      token={activeMemory.token}
                      size={180}
                    />
                  </div>
                  <div className="bg-white border border-stone-200 rounded-lg p-2.5 text-left text-xs space-y-1">
                    <div className="flex justify-between text-stone-600">
                      <span>Status de Envio:</span>
                      <span className="font-semibold text-emerald-800">Pronto para escaneamento</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>URL Curta:</span>
                      <span className="font-mono text-stone-800">
                        {window.location.hostname}/l/{activeMemory.token.slice(0, 6)}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Source photos used in montage */}
                <div className="bg-white border border-stone-200 rounded-xl p-3.5 space-y-2">
                  <h6 className="text-[11px] font-semibold text-stone-700 uppercase tracking-wider">
                    Fotografias de Origem
                  </h6>
                  <div className="grid grid-cols-2 gap-2 text-center text-[10px] text-stone-600">
                    <div>
                      <img
                        src={event.couplePhotoUrl || ''}
                        alt="Noivos"
                        className="w-full h-24 object-cover rounded border border-stone-200"
                      />
                      <span className="mt-1 block truncate">Noivos</span>
                    </div>
                    <div>
                      <img
                        src={activeMemory.guestPhotoUrl}
                        alt="Convidado"
                        className="w-full h-24 object-cover rounded border border-stone-200"
                      />
                      <span className="mt-1 block truncate">Convidado</span>
                    </div>
                  </div>
                  {activeMemory.mode === 'ai' && (
                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-[11px] text-stone-600">Harmonização Facial</span>
                      <button
                        type="button"
                        onClick={() => onRegenerate(activeMemory)}
                        className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1"
                      >
                        <RotateCcw size={12} /> Regenerar IA
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}