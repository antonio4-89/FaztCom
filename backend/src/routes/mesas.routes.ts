import { Router } from 'express';
import { getMesas, getNotaByMesa } from '../controllers/mesas.controller';

const router = Router();

// GET /api/mesas — all mesas with open nota if any
router.get('/', getMesas);

// GET /api/mesas/:id/nota — open nota for that mesa with comandas and items
router.get('/:id/nota', getNotaByMesa);

export default router;
