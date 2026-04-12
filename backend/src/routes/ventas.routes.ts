import { Router } from 'express';
import { getVentas, getHistorialVentas, getVentasMensuales, getVentasDiarias } from '../controllers/ventas.controller';
import { requireRole } from '../middleware/role';

const router = Router();

// All routes: admin only
router.use(requireRole('admin'));

// GET /api/ventas — today's sales summary
router.get('/', getVentas);

// GET /api/ventas/historial — historical sales by date range
router.get('/historial', getHistorialVentas);

// GET /api/ventas/mensuales — monthly breakdown for a year
router.get('/mensuales', getVentasMensuales);

// GET /api/ventas/diarias — daily breakdown for a date range
router.get('/diarias', getVentasDiarias);

export default router;
