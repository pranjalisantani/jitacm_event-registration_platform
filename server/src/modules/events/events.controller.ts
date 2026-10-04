import type { Request, Response, NextFunction } from 'express';
import { eventsService, type EventRow } from './events.service.js';
import { createEventSchema, eventQuerySchema, updateEventSchema } from './events.schema.js';
import { AppError } from '../../middleware/errorHandler.js';

function formatEventResponse(row: EventRow) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    tagline: row.tagline,
    description: row.description,
    category: row.category,
    mode: row.mode,
    venue: row.venue,
    date: row.event_date,
    time: row.event_time,
    registrationDeadline: row.registration_deadline,
    bannerUrl: row.banner_url,
    fee: Math.round(row.fee_paise / 100),
    feePaise: row.fee_paise,
    currency: row.currency,
    capacity: row.capacity,
    registeredCount: row.registered_count,
    checkedInCount: row.checked_in_count,
    tags: row.tags || [],
    isFeatured: row.is_featured,
    isSoldOut: row.registered_count >= row.capacity,
    organizerEmail: row.organizer_email,
    organizerPhone: row.organizer_phone,
    perks: typeof row.perks === 'string' ? JSON.parse(row.perks) : row.perks || [],
    rules: typeof row.rules === 'string' ? JSON.parse(row.rules) : row.rules || [],
    schedule: typeof row.schedule === 'string' ? JSON.parse(row.schedule) : row.schedule || [],
    speakers: typeof row.speakers === 'string' ? JSON.parse(row.speakers) : row.speakers || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class EventsController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = eventQuerySchema.parse(req.query);
      const rows = await eventsService.listEvents(filters);
      res.json({
        success: true,
        data: rows.map(formatEventResponse),
        count: rows.length,
      });
    } catch (err) {
      next(err);
    }
  }

  async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const slug = String(req.params.slug);
      const row = await eventsService.getEventBySlug(slug);
      if (!row) {
        throw new AppError(404, `Event with slug '${slug}' was not found.`, 'EVENT_NOT_FOUND');
      }
      res.json({
        success: true,
        data: formatEventResponse(row),
      });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createEventSchema.parse(req.body);
      const row = await eventsService.createEvent(data);
      res.status(201).json({
        success: true,
        data: formatEventResponse(row),
        message: 'Event created successfully.',
      });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const data = updateEventSchema.parse(req.body);
      const row = await eventsService.updateEvent(id, data);
      if (!row) {
        throw new AppError(404, `Event with ID '${id}' was not found.`, 'EVENT_NOT_FOUND');
      }
      res.json({
        success: true,
        data: formatEventResponse(row),
        message: 'Event updated successfully.',
      });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const deleted = await eventsService.deleteEvent(id);
      if (!deleted) {
        throw new AppError(404, `Event with ID '${id}' was not found.`, 'EVENT_NOT_FOUND');
      }
      res.json({
        success: true,
        message: 'Event deleted successfully.',
      });
    } catch (err) {
      next(err);
    }
  }
}

export const eventsController = new EventsController();
