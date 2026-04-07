import { Router } from 'express';
import { getVentas, getHistorialVentas } from '../controllers/ventas.controller';
import { requireRole } from '../middleware/role';

const router = Router();

// All routes: admin only
router.use(requireRole('admin'));

// GET /api/ventas — today's sales summary
router.get('/', getVentas);

// GET /api/ventas/historial — historical sales by date range
router.get('/historial', getHistorialVentas);

export default router;
