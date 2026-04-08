import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes';
import mesasRoutes from './routes/mesas.routes';
import comandasRoutes from './routes/comandas.routes';
import notasRoutes from './routes/notas.routes';
import menuRoutes from './routes/menu.routes';
import usuariosRoutes from './routes/usuarios.routes';
import gastosRoutes from './routes/gastos.routes';
import ventasRoutes from './routes/ventas.routes';
import notificacionesRoutes from './routes/notificaciones.routes';
import { authMiddleware } from './middleware/auth';

export const app = express();

// ─── Global middleware ────────────────────────────────────────────────────────

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

// ─── Public routes ────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);

// ─── Protected routes ─────────────────────────────────────────────────────────

app.use('/api/mesas',          authMiddleware, mesasRoutes);
app.use('/api/comandas',       authMiddleware, comandasRoutes);
app.use('/api/notas',          authMiddleware, notasRoutes);
app.use('/api/menu',           authMiddleware, menuRoutes);
app.use('/api/usuarios',       authMiddleware, usuariosRoutes);
app.use('/api/gastos',         authMiddleware, gastosRoutes);
app.use('/api/ventas',         authMiddleware, ventasRoutes);
app.use('/api/notificaciones', authMiddleware, notificacionesRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 404 handler ─────────────────────────────────────────────────────────────

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// ─── Global error handler ─────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Error]', err.message);
  res.status(500).json({ error: 'Error interno del servidor', detail: err.message });
});
