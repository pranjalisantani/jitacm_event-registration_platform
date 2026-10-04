import { z } from 'zod';

export const eventCategoryEnum = z.enum([
  'Hackathon',
  'Workshop',
  'Tech Talk',
  'Competition',
  'Ideathon',
  'Cultural Tech',
]);

export const eventModeEnum = z.enum(['in-person', 'virtual', 'hybrid']);

export const eventQuerySchema = z.object({
  category: z.string().optional(),
  mode: z.string().optional(),
  feeType: z.enum(['all', 'free', 'paid']).optional().default('all'),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  offset: z.coerce.number().min(0).optional().default(0),
});

export const scheduleItemSchema = z.object({
  time: z.string(),
  title: z.string(),
  description: z.string().optional(),
  speaker: z.string().optional(),
});

export const speakerSchema = z.object({
  name: z.string(),
  role: z.string(),
  company: z.string(),
  avatarUrl: z.string().optional(),
});

export const createEventSchema = z.object({
  title: z.string().min(3).max(200),
  tagline: z.string().max(300).optional().default(''),
  description: z.string().min(10),
  category: eventCategoryEnum,
  mode: eventModeEnum.default('in-person'),
  venue: z.string().min(2),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  eventTime: z.string().min(2),
  registrationDeadline: z.string().datetime(),
  bannerUrl: z.string().url(),
  feePaise: z.number().int().min(0).default(0),
  capacity: z.number().int().min(1),
  tags: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  organizerEmail: z.string().email(),
  organizerPhone: z.string().min(10),
  perks: z.array(z.string()).default([]),
  rules: z.array(z.string()).default([]),
  schedule: z.array(scheduleItemSchema).default([]),
  speakers: z.array(speakerSchema).default([]),
});

export const updateEventSchema = createEventSchema.partial();
