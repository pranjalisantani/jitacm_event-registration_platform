import { Router } from 'express';
import { eventsController } from './events.controller.js';

export const eventsRouter = Router();

// Public routes
eventsRouter.get('/', (req, res, next) => eventsController.list(req, res, next));
eventsRouter.get('/:slug', (req, res, next) => eventsController.getBySlug(req, res, next));

// Admin management routes (Phase 1 baseline)
eventsRouter.post('/', (req, res, next) => eventsController.create(req, res, next));
eventsRouter.put('/:id', (req, res, next) => eventsController.update(req, res, next));
eventsRouter.delete('/:id', (req, res, next) => eventsController.delete(req, res, next));
