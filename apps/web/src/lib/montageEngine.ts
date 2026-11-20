import { WeddingEvent } from '@/types';

export interface ClassicMontageParams {
  event: WeddingEvent;
  coupleImg: HTMLImageElement;
  guestImg: HTMLImageElement;
  guestName: string;
}

/**
 * Creates high-resolution 1200x1800 (10x15 portrait, 300 DPI equivalent)
 * classic wedding photo booth souvenir with elegant borders, couple's official photo,
 * guest photo, monogram, names, date and venue.
 */
export async function renderClassicSouvenir({
  event,
  coupleImg,
  guestImg,
  guestName,
}: ClassicMontageParams): Promise<string> {
  const canvas = document.createElement('canvas');
  const WIDTH = 1200;
  const HEIGHT = 1800;
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  const themeId = event.themeStyle;
  const isDark = themeId === 'blacktie';

  // Base background
  if (isDark) {
    ctx.fillStyle = '#121214';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    const grad = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    grad.addColorStop(0, '#1c1c20');
    grad.addColorStop(1, '#0e0e10');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  } else if (themeId === 'botanical') {
    ctx.fillStyle = '#f4f6f2';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  } else if (themeId === 'minimalist') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  } else {
    ctx.fillStyle = '#faf8f3';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }

  // Double border / fine hairline frame
  ctx.save();
  const margin = 50;
  ctx.lineWidth = 2;
  ctx.strokeStyle = isDark
    ? '#d4af37'
    : themeId === 'botanical'
    ? '#4a6b53'
    : themeId === 'minimalist'
    ? '#111827'
    : '#c5a059';
  ctx.strokeRect(margin, margin, WIDTH - margin * 2, HEIGHT - margin * 2);
  ctx.lineWidth = 1;
  ctx.strokeStyle = isDark
    ? 'rgba(212, 175, 55, 0.4)'
    : themeId === 'botanical'
    ? 'rgba(74, 107, 83, 0.3)'
    : 'rgba(197, 160, 89, 0.35)';
  ctx.strokeRect(margin + 12, margin + 12, WIDTH - (margin + 12) * 2, HEIGHT - (margin + 12) * 2);
  ctx.restore();

  // Top header area: Couple Title & Brand
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '600 18px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = isDark ? '#a0a0a5' : '#8c827a';
  ctx.letterSpacing = '6px';
  ctx.fillText('WE LOVE MEMORY • FOTO LEMBRANÇA', WIDTH / 2, 110);

  ctx.font = 'italic 700 64px "Playfair Display", Georgia, serif';
  ctx.fillStyle = isDark ? '#f5eedb' : '#2b231d';
  ctx.fillText(event.coupleNames, WIDTH / 2, 185);

  ctx.font = '500 20px "Playfair Display", Georgia, serif';
  ctx.fillStyle = isDark ? '#d4af37' : themeId === 'botanical' ? '#4a6b53' : '#b08d44';
  ctx.fillText(`${event.dateFormatted} • ${event.venue}`, WIDTH / 2, 225);
  ctx.restore();

  // Photo frames layout: two elegant cards side-by-side
  const photoY = 270;
  const photoHeight = 1140;
  const photoWidth = 490;
  const slot1X = 90;
  const slot2X = 620;

  function drawPhotoCard(
    img: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    subLabel: string
  ) {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 10;
    ctx.fillStyle = isDark ? '#1e1e24' : '#ffffff';

    const r = 16;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();

    ctx.clip();
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const boxAspect = w / h;
    let sW = img.naturalWidth;
    let sH = img.naturalHeight;
    let sX = 0;
    let sY = 0;
    if (imgAspect > boxAspect) {
      sW = img.naturalHeight * boxAspect;
      sX = (img.naturalWidth - sW) / 2;
    } else {
      sH = img.naturalWidth / boxAspect;
      sY = (img.naturalHeight - sH) / 2;
    }
    ctx.drawImage(img, sX, sY, sW, sH, x, y, w, h);

    const labelGrad = ctx.createLinearGradient(x, y + h - 160, x, y + h);
    labelGrad.addColorStop(0, 'rgba(0,0,0,0)');
    labelGrad.addColorStop(1, 'rgba(0,0,0,0.85)');
    ctx.fillStyle = labelGrad;
    ctx.fillRect(x, y + h - 160, w, 160);

    ctx.shadowColor = 'transparent';
    ctx.textAlign = 'center';
    ctx.font = 'italic 600 28px "Playfair Display", serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(label, x + w / 2, y + h - 60);
    ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#d4af37';
    ctx.fillText(subLabel.toUpperCase(), x + w / 2, y + h - 32);
    ctx.restore();

    ctx.save();
    ctx.lineWidth = 2;
    ctx.strokeStyle = isDark ? '#d4af37' : '#c5a059';
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  // Left card: Couple official photo
  drawPhotoCard(coupleImg, slot1X, photoY, photoWidth, photoHeight, 'Os Noivos', 'Foto Oficial');
  // Right card: Guest captured photo
  drawPhotoCard(guestImg, slot2X, photoY, photoWidth, photoHeight, guestName || 'Convidado Especial', 'Lembrança Digital');

  // Bottom Footer Area
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = isDark ? '#d4af37' : '#c5a059';
  ctx.font = '18px serif';
  ctx.fillText('❖   ❧   ❖', WIDTH / 2, 1480);

  ctx.font = 'italic 500 26px "Playfair Display", Georgia, serif';
  ctx.fillStyle = isDark ? '#e0ded8' : '#3d342d';
  ctx.fillText('"Obrigado por celebrar este amor e fazer parte da nossa história!"', WIDTH / 2, 1530);

  ctx.font = '500 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = isDark ? '#888890' : '#887d73';
  ctx.fillText('Edição Comemorativa 10 × 15 cm • Guarde sua lembrança digital', WIDTH / 2, 1575);
  ctx.restore();

  return canvas.toDataURL('image/jpeg', 0.95);
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Falha ao carregar imagem: ' + e));
    img.src = src;
  });
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new Blob([u8arr], { type: mime });
}