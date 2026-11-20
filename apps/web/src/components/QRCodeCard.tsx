'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeCardProps {
  value: string;
  guestName: string;
  token: string;
  size?: number;
}

export function QRCodeCard({ value, guestName, token, size = 200 }: QRCodeCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;
    QRCode.toCanvas(
      canvasRef.current,
      value,
      {
        width: size,
        margin: 2,
        color: { dark: '#1c1917', light: '#ffffff' },
      },
      (err) => {
        if (err) console.error('Erro ao gerar QR Code:', err);
      }
    );
  }, [value, size]);

  return (
    <div className="flex flex-col items-center bg-white p-4 rounded-xl shadow-sm border border-stone-200">
      <div className="bg-stone-50 p-2 rounded-lg border border-stone-100 flex items-center justify-center">
        <canvas ref={canvasRef} className="rounded" />
      </div>
      <div className="mt-3 text-center">
        <p className="text-xs font-semibold text-stone-800 tracking-wide uppercase">
          {guestName || 'Convidado'}
        </p>
        <p className="text-[11px] font-mono text-stone-600 mt-0.5">
          Token: #{token.slice(0, 8)}
        </p>
      </div>
    </div>
  );
}