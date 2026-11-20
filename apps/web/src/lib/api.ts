import { ApiResponse, MemoryRecord, CreateMemoryRequest, WeddingEvent, CreateEventRequest, GenerationJob } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Erro desconhecido' }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  events: {
    create: (data: CreateEventRequest) =>
      fetchApi<WeddingEvent>('/api/events', { method: 'POST', body: JSON.stringify(data) }),
    get: (id: string) => fetchApi<WeddingEvent>(`/api/events/${id}`),
    list: () => fetchApi<WeddingEvent[]>('/api/events'),
    update: (id: string, data: Partial<CreateEventRequest>) =>
      fetchApi<WeddingEvent>(`/api/events/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },

  memories: {
    create: (data: CreateMemoryRequest) =>
      fetchApi<MemoryRecord>('/api/memories', { method: 'POST', body: JSON.stringify(data) }),
    get: (id: string) => fetchApi<MemoryRecord>(`/api/memories/${id}`),
    listByEvent: (eventId: string) => fetchApi<MemoryRecord[]>(`/api/events/${eventId}/memories`),
    approve: (id: string) =>
      fetchApi<MemoryRecord>(`/api/memories/${id}/approve`, { method: 'POST' }),
    delete: (id: string) =>
      fetchApi<void>(`/api/memories/${id}`, { method: 'DELETE' }),
    regenerate: (id: string) =>
      fetchApi<MemoryRecord>(`/api/memories/${id}/regenerate`, { method: 'POST' }),
  },

  jobs: {
    get: (id: string) => fetchApi<GenerationJob>(`/api/jobs/${id}`),
    status: (id: string) => fetchApi<{ status: string; progress?: number }>(`/api/jobs/${id}/status`),
  },

  upload: {
    couplePhoto: (eventId: string, base64: string, mimeType: string) =>
      fetchApi<{ url: string; mediaId: string }>(`/api/events/${eventId}/couple-photo`, {
        method: 'POST',
        body: JSON.stringify({ base64, mimeType }),
      }),
    guestPhoto: (base64: string, mimeType: string) =>
      fetchApi<{ url: string; mediaId: string }>('/api/upload/guest-photo', {
        method: 'POST',
        body: JSON.stringify({ base64, mimeType }),
      }),
  },
};