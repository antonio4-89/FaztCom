import { Router } from 'express';
import {
  getMisNotas,
  getHistorial,
  getNotaById,
  closeNota,
} from '../controllers/notas.controller';

const router = Router();

// GET /api/notas — mesero's own open notas; admin sees all
router.get('/', getMisNotas);

// GET /api/notas/historial — closed notas
router.get('/historial', getHistorial);

// GET /api/notas/:id — full nota detail
router.get('/:id', getNotaById);

// PUT /api/notas/:id/close — close nota
router.put('/:id/close', closeNota);

export default router;
