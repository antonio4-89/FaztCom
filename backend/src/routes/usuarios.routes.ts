import { Router } from 'express';
import {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
} from '../controllers/usuarios.controller';
import { requireRole } from '../middleware/role';

const router = Router();

// All routes: admin only
router.use(requireRole('admin'));

// GET /api/usuarios — all users
router.get('/', getUsuarios);

// POST /api/usuarios — create user
router.post('/', createUsuario);

// PUT /api/usuarios/:id — update user
router.put('/:id', updateUsuario);

// DELETE /api/usuarios/:id — soft delete user
router.delete('/:id', deleteUsuario);

export default router;
