import { query } from '../../db/pool.js';
import type { z } from 'zod';
import type { createEventSchema, eventQuerySchema, updateEventSchema } from './events.schema.js';

export interface EventRow {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  mode: string;
  venue: string;
  event_date: string;
  event_time: string;
  registration_deadline: string;
  banner_url: string;
  fee_paise: number;
  currency: string;
  capacity: number;
  registered_count: number;
  checked_in_count: number;
  tags: string[];
  is_featured: boolean;
  is_published: boolean;
  organizer_email: string;
  organizer_phone: string;
  perks: unknown;
  rules: unknown;
  schedule: unknown;
  speakers: unknown;
  created_at: string;
  updated_at: string;
}

export class EventsService {
  async listEvents(filters: z.infer<typeof eventQuerySchema>): Promise<EventRow[]> {
    const conditions: string[] = ['is_published = TRUE'];
    const params: unknown[] = [];
    let idx = 1;

    if (filters.category && filters.category !== 'all') {
      conditions.push(`category = $${idx++}`);
      params.push(filters.category);
    }

    if (filters.mode && filters.mode !== 'all') {
      conditions.push(`mode = $${idx++}`);
      params.push(filters.mode);
    }

    if (filters.feeType === 'free') {
      conditions.push(`fee_paise = 0`);
    } else if (filters.feeType === 'paid') {
      conditions.push(`fee_paise > 0`);
    }

    if (filters.search) {
      conditions.push(`(title ILIKE $${idx} OR description ILIKE $${idx} OR venue ILIKE $${idx})`);
      params.push(`%${filters.search}%`);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `
      SELECT * FROM events 
      ${whereClause} 
      ORDER BY is_featured DESC, event_date ASC 
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    params.push(filters.limit, filters.offset);

    const result = await query<EventRow>(sql, params);
    return result.rows;
  }

  async getEventBySlug(slug: string): Promise<EventRow | null> {
    const result = await query<EventRow>('SELECT * FROM events WHERE slug = $1', [slug]);
    return result.rows[0] || null;
  }

  async getEventById(id: string): Promise<EventRow | null> {
    const result = await query<EventRow>('SELECT * FROM events WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async createEvent(data: z.infer<typeof createEventSchema>): Promise<EventRow> {
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const sql = `
      INSERT INTO events (
        slug, title, tagline, description, category, mode, venue,
        event_date, event_time, registration_deadline, banner_url,
        fee_paise, capacity, tags, is_featured, organizer_email,
        organizer_phone, perks, rules, schedule, speakers
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11,
        $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21
      ) RETURNING *
    `;
    const params = [
      slug, data.title, data.tagline, data.description, data.category, data.mode, data.venue,
      data.eventDate, data.eventTime, data.registrationDeadline, data.bannerUrl,
      data.feePaise, data.capacity, data.tags, data.isFeatured, data.organizerEmail,
      data.organizerPhone, JSON.stringify(data.perks), JSON.stringify(data.rules),
      JSON.stringify(data.schedule), JSON.stringify(data.speakers)
    ];
    const result = await query<EventRow>(sql, params);
    return result.rows[0];
  }

  async updateEvent(id: string, updates: z.infer<typeof updateEventSchema>): Promise<EventRow | null> {
    const fields: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        // Map camelCase to snake_case
        const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
        if (typeof value === 'object' && !Array.isArray(value)) {
          fields.push(`${snakeKey} = $${idx++}`);
          params.push(JSON.stringify(value));
        } else {
          fields.push(`${snakeKey} = $${idx++}`);
          params.push(value);
        }
      }
    }

    if (fields.length === 0) {
      return this.getEventById(id);
    }

    fields.push(`updated_at = NOW()`);
    params.push(id);
    const sql = `UPDATE events SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const result = await query<EventRow>(sql, params);
    return result.rows[0] || null;
  }

  async deleteEvent(id: string): Promise<boolean> {
    const result = await query('DELETE FROM events WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }
}

export const eventsService = new EventsService();
