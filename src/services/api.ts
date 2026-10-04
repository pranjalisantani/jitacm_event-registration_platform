import type { EventItem } from '../types';
import { storageService } from './storage';

export interface BackendStatus {
  isOnline: boolean;
  dbConnected: boolean;
  latencyMs?: number;
}

class ApiService {
  private backendAvailable: boolean | null = null;

  async checkStatus(): Promise<BackendStatus> {
    try {
      const res = await fetch('/health', { signal: AbortSignal.timeout(2500) });
      if (!res.ok) {
        this.backendAvailable = false;
        return { isOnline: false, dbConnected: false };
      }
      const data = await res.json();
      const isOnline = data.status === 'UP' || data.status === 'DEGRADED';
      const dbConnected = data.services?.database?.connected ?? false;
      this.backendAvailable = isOnline && dbConnected;
      return {
        isOnline,
        dbConnected,
        latencyMs: data.services?.database?.latencyMs,
      };
    } catch {
      this.backendAvailable = false;
      return { isOnline: false, dbConnected: false };
    }
  }

  getIsBackendAvailable(): boolean | null {
    return this.backendAvailable;
  }

  async getEvents(): Promise<EventItem[]> {
    try {
      const res = await fetch('/api/v1/events', { signal: AbortSignal.timeout(3000) });
      if (!res.ok) {
        throw new Error(`API returned HTTP ${res.status}`);
      }
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    } catch (err) {
      // Graceful fallback to storageService so UI never fails
      console.info('[ApiService] Backend offline or unreachable, falling back to local dataset:', err);
    }
    return storageService.getEvents();
  }

  async getEventBySlug(slug: string): Promise<EventItem | undefined> {
    try {
      const res = await fetch(`/api/v1/events/${slug}`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch {
      // Fallback
    }
    return storageService.getEvents().find((e) => e.slug === slug);
  }

  async createEvent(newEvent: Omit<EventItem, 'id' | 'registeredCount' | 'checkedInCount' | 'createdAt'>): Promise<EventItem> {
    try {
      const res = await fetch('/api/v1/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newEvent.title,
          tagline: newEvent.tagline,
          description: newEvent.description,
          category: newEvent.category,
          mode: newEvent.mode,
          venue: newEvent.venue,
          eventDate: newEvent.date,
          eventTime: newEvent.time,
          registrationDeadline: newEvent.registrationDeadline,
          bannerUrl: newEvent.bannerUrl,
          feePaise: Math.round(newEvent.fee * 100),
          capacity: newEvent.capacity,
          tags: newEvent.tags,
          isFeatured: newEvent.isFeatured ?? false,
          organizerEmail: newEvent.organizerEmail,
          organizerPhone: newEvent.organizerPhone,
          perks: newEvent.perks ?? [],
          rules: newEvent.rules ?? [],
          schedule: newEvent.schedule ?? [],
          speakers: newEvent.speakers ?? [],
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch {
      // Fallback
    }
    return storageService.createEvent(newEvent);
  }
}

export const apiService = new ApiService();
