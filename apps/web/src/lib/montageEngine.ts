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
    // Subtle luxury gradient
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
    // Champagne / ivory
    ctx.fillStyle = '#faf8f3';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }
  // Double border / fine hairline frame
  ctx.save();
  const margin = 50;
  ctx.lineWidth = 2;
  ctx.strokeStyle = isDark ? '#d4af37' : themeId === 'botanical' ? '#4a6b53' : themeId === 'minimalist' ? '#111827' : '#c5a059';
  ctx.strokeRect(margin, margin, WIDTH - margin * 2, HEIGHT - margin * 2);
  ctx.lineWidth = 1;
  ctx.strokeStyle = isDark ? 'rgba(212, 175, 55, 0.4)' : themeId === 'botanical' ? 'rgba(74, 107, 83, 0.3)' : 'rgba(197, 160, 89, 0.35)';
  ctx.strokeRect(margin + 12, margin + 12, WIDTH - (margin + 12) * 2, HEIGHT - (margin + 12) * 2);
  ctx.restore();
  // Top header area: Couple Title & Brand
  ctx.save();
  ctx.textAlign = 'center';
  // "WE LOVE MEMORY" micro brand mark
  ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = isDark ? '#a0a0a5' : '#8c827a';
  ctx.letterSpacing = '6px';
  ctx.fillText('WE LOVE MEMORY • FOTO LEMBRANÇA', WIDTH / 2, 110);
  // Couple names in large romantic serif
  ctx.font = 'italic 700 64px "Playfair Display", Georgia, serif';
  ctx.fillStyle = isDark ? '#f5eedb' : '#2b231d';
  ctx.fillText(event.coupleNames, WIDTH / 2, 185);
  // Subtitle / Date & Venue
  ctx.font = '500 20px "Playfair Display", Georgia, serif';
  ctx.fillStyle = isDark ? '#d4af37' : themeId === 'botanical' ? '#4a6b53' : '#b08d44';
  ctx.fillText(`${event.dateFormatted} • ${event.venue}`, WIDTH / 2, 225);
  ctx.restore();
  // Photo frames layout:
  // Dual photo montage side-by-side.
  // In classic 10x15 wedding souvenirs, two vertical balanced slots (Couple on left, Guest on right)
  // or stacked with elegant passepartout. Let's do two elegant cards side-by-side:
  // Width available: 1200 - 160 = 1040. Two slots: width ~490 each, height ~1100.
  const photoY = 270;
  const photoHeight = 1140;
  const photoWidth = 490;
  const slot1X = 90;
  const slot2X = 620;
  // Helper to draw image cover inside rect with rounded corners and border
  function drawPhotoCard(
    img: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    subLabel: string,
    context: CanvasRenderingContext2D
  ) {
    context.save();
    context.shadowColor = 'rgba(0, 0, 0, 0.12)';
    context.shadowBlur = 20;
    context.shadowOffsetY = 10;
    context.fillStyle = isDark ? '#1e1e24' : '#ffffff';

    const r = 16;
    context.beginPath();
    context.moveTo(x + r, y);
    context.lineTo(x + w - r, y);
    context.quadraticCurveTo(x + w, y, x + w, y + r);
    context.lineTo(x + w, y + h - r);
    context.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    context.lineTo(x + r, y + h);
    context.quadraticCurveTo(x, y + h, x, y + h - r);
    context.lineTo(x + r, y + h);
    context.quadraticCurveTo(x, y, x + r, y);
    context.closePath();
    context.fill();

    context.clip();
    // Cover math
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
    context.drawImage(img, sX, sY, sW, sH, x, y, w, h);
    // Subtle bottom gradient for label legibility
    const labelGrad = context.createLinearGradient(x, y + h - 160, x, y + h);
    labelGrad.addColorStop(0, 'rgba(0,0,0,0)');
    labelGrad.addColorStop(1, 'rgba(0,0,0,0.85)');
    context.fillStyle = labelGrad;
    context.fillRect(x, y + h - 160, w, 160);
    // Label text
    context.shadowColor = 'transparent';
    context.textAlign = 'center';
    context.font = 'italic 600 28px "Playfair Display", serif';
    context.fillStyle = '#ffffff';
    context.fillText(label, x + w / 2, y + h - 60);
    context.font = '600 13px "Plus Jakarta Sans", sans-serif';
    context.fillStyle = '#d4af37';
    context.fillText(subLabel.toUpperCase(), x + w / 2, y + h - 32);
    context.restore();
    // Fine gold outline on card
    context.save();
    context.lineWidth = 2;
    context.strokeStyle = isDark ? '#d4af37' : '#c5a059';
    context.beginPath();
    context.moveTo(x + r, y);
    context.lineTo(x + w - r, y);
    context.quadraticCurveTo(x + w, y, x + w, y + r);
    context.lineTo(x + w, y + h - r);
    context.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    context.lineTo(x + r, y + h);
    context.quadraticCurveTo(x, y + h, x, y + h - r);
    context.lineTo(x + r, y + h);
    context.quadraticCurveTo(x, y, x + r, y);
    context.closePath();
    context.stroke();
    context.restore();
  }
  // Left card: Couple official photo
  drawPhotoCard(coupleImg, slot1X, photoY, photoWidth, photoHeight, 'Os Noivos', 'Foto Oficial', ctx);
  // Right card: Guest captured photo
  drawPhotoCard(guestImg, slot2X, photoY, photoWidth, photoHeight, guestName || 'Convidado Especial', 'Lembrança Digital', ctx);
  // Bottom Footer Area
  ctx.save();
  ctx.textAlign = 'center';
  // Decorative ornamental diamond/filigree
  ctx.fillStyle = isDark ? '#d4af37' : '#c5a059';
  ctx.font = '18px serif';
  ctx.fillText('❖   ❧   ❖', WIDTH / 2, 1480);
  // Warm commemorative quote
  ctx.font = 'italic 500 26px "Playfair Display", Georgia, serif';
  ctx.fillStyle = isDark ? '#e0ded8' : '#3d342d';
  ctx.fillText('"Obrigado por celebrar este amor e fazer parte da nossa história!"', WIDTH / 2, 1530);
  // Authentication token & Digital memory disclaimer
  ctx.font = '500 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = isDark ? '#888890' : '#887d73';
  ctx.fillText('Edição Comemorativa 10 × 15 cm • Guarde sua lembrança digital', WIDTH / 2, 1575);
  // Small QR code placeholder simulation box for physical print compatibility
  ctx.restore();
  return canvas.toDataURL('image/jpeg', 0.95);
}
/**
 * Loads an image from URL or data-uri into an HTMLImageElement
 */
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