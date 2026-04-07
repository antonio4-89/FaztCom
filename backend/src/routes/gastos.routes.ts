import { Router } from 'express';
import { getGastos, createGasto, deleteGasto } from '../controllers/gastos.controller';
import { requireRole } from '../middleware/role';

const router = Router();

// All routes: admin only
router.use(requireRole('admin'));

// GET /api/gastos — all gastos
router.get('/', getGastos);

// POST /api/gastos — create gasto
router.post('/', createGasto);

// DELETE /api/gastos/:id — delete gasto
router.delete('/:id', deleteGasto);

export default router;
