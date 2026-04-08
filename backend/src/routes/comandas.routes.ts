import { Router } from 'express';
import {
  getComandas,
  createComanda,
  updateStatus,
  removeItem,
  toggleItemListo,
  getComandasActivas,
} from '../controllers/comandas.controller';
import { requireRole } from '../middleware/role';

const router = Router();

// GET /api/comandas?destino=cocina|barra&status=pendiente|en_preparacion|listo
router.get('/', getComandas);

// GET /api/comandas/activas — admin only
router.get('/activas', requireRole('admin'), getComandasActivas);

// POST /api/comandas — create comanda
router.post('/', createComanda);

// PUT /api/comandas/:id/status — update status
router.put('/:id/status', updateStatus);

// PATCH /api/comandas/:id/items/:itemId/listo — toggle item listo
router.patch('/:id/items/:itemId/listo', toggleItemListo);

// DELETE /api/comandas/:id/items/:itemId — remove item
router.delete('/:id/items/:itemId', removeItem);

export default router;
