export interface WeddingEvent {
  id: string;
  title: string;
  coupleNames: string;
  dateFormatted: string;
  venue: string;
  couplePhotoUrl: string | null;
  coupleMediaId?: string;
  themeStyle: 'champagne' | 'minimalist' | 'botanical' | 'blacktie';
  templateAspectRatio: '10x15' | 'polaroid';
}

export type MontageMode = 'classic' | 'ai';
export type AiRenderStyle = 'hyperrealistic' | 'pixar' | 'cartoon';

export interface MemoryRecord {
  id: string;
  token: string;
  guestName: string;
  createdAt: string;
  mode: MontageMode;
  aiStyle?: AiRenderStyle;
  templateStyle: string;
  guestPhotoUrl: string;
  guestMediaId?: string;
  resultImageUrl: string;
  resultMediaId?: string;
  status: 'ready' | 'processing' | 'approved' | 'rejected';
  promptUsed?: string;
}

export interface GuestCapture {
  guestName: string;
  guestNote?: string;
  base64: string;
  mimeType: string;
  mediaId?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CreateEventRequest {
  coupleNames: string;
  dateFormatted: string;
  venue: string;
  themeStyle: WeddingEvent['themeStyle'];
  couplePhotoUrl?: string;
}

export interface CreateMemoryRequest {
  eventId: string;
  guestName: string;
  guestPhotoBase64: string;
  mimeType: string;
  mode: MontageMode;
  aiStyle?: AiRenderStyle;
  templateStyle: string;
}

export interface GenerationJob {
  id: string;
  eventId: string;
  memoryId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  mode: MontageMode;
  aiStyle?: AiRenderStyle;
  error?: string;
  createdAt: string;
  completedAt?: string;
}