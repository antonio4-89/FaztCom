import { Router } from 'express';
import {
  getMenu,
  createProducto,
  updateProducto,
  deleteProducto,
} from '../controllers/menu.controller';
import { requireRole } from '../middleware/role';

const router = Router();

// GET /api/menu — all active products (authenticated)
router.get('/', getMenu);

// POST /api/menu — create product (admin only)
router.post('/', requireRole('admin'), createProducto);

// PUT /api/menu/:id — update product (admin only)
router.put('/:id', requireRole('admin'), updateProducto);

// DELETE /api/menu/:id — soft delete product (admin only)
router.delete('/:id', requireRole('admin'), deleteProducto);

export default router;
