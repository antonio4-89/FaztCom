import { Router } from 'express';
import {
  getNotificaciones,
  markRead,
  markAllRead,
} from '../controllers/notificaciones.controller';

const router = Router();

// GET /api/notificaciones — notifs for current user
router.get('/', getNotificaciones);

// PUT /api/notificaciones/read-all — mark all as read for current user
// Must be before /:id/read to avoid "read-all" being matched as an id
router.put('/read-all', markAllRead);

// PUT /api/notificaciones/:id/read — mark single notif as read
router.put('/:id/read', markRead);

export default router;
