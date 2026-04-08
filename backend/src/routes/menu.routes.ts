import { Router } from 'express';
import {
  getMenu,
  getCategorias,
  createProducto,
  updateProducto,
  deleteProducto,
  toggleAgotado,
} from '../controllers/menu.controller';
import { requireRole } from '../middleware/role';

const router = Router();

// GET /api/menu — all active products (authenticated)
router.get('/', getMenu);

// GET /api/menu/categorias — distinct categories by tipo
router.get('/categorias', getCategorias);

// POST /api/menu — create product (admin only)
router.post('/', requireRole('admin'), createProducto);

// PUT /api/menu/:id — update product (admin only)
router.put('/:id', requireRole('admin'), updateProducto);

// DELETE /api/menu/:id — soft delete product (admin only)
router.delete('/:id', requireRole('admin'), deleteProducto);

// PATCH /api/menu/:id/stock — toggle agotado (admin, cocinero for comida, bartender for bebida)
router.patch('/:id/stock', requireRole('admin', 'cocinero', 'bartender'), toggleAgotado);

export default router;
