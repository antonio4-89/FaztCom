import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export async function getNotificaciones(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;

    const notificaciones = await prisma.notificacion.findMany({
      where: { meseroId: userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(notificaciones);
  } catch (error) {
    console.error('[getNotificaciones]', error);
    res.status(500).json({ error: 'Error al obtener las notificaciones' });
  }
}

export async function markRead(req: Request, res: Response): Promise<void> {
  try {
    const notifId = parseInt(req.params.id, 10);
    const userId = req.user!.id;

    if (isNaN(notifId)) {
      res.status(400).json({ error: 'ID de notificación inválido' });
      return;
    }

    const notif = await prisma.notificacion.findUnique({ where: { id: notifId } });

    if (!notif) {
      res.status(404).json({ error: 'Notificación no encontrada' });
      return;
    }

    if (notif.meseroId !== userId) {
      res.status(403).json({ error: 'No tienes permiso para modificar esta notificación' });
      return;
    }

    const updated = await prisma.notificacion.update({
      where: { id: notifId },
      data: { read: true },
    });

    res.json(updated);
  } catch (error) {
    console.error('[markRead]', error);
    res.status(500).json({ error: 'Error al marcar la notificación como leída' });
  }
}

export async function markAllRead(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;

    const result = await prisma.notificacion.updateMany({
      where: { meseroId: userId, read: false },
      data: { read: true },
    });

    res.json({ message: 'Notificaciones marcadas como leídas', count: result.count });
  } catch (error) {
    console.error('[markAllRead]', error);
    res.status(500).json({ error: 'Error al marcar las notificaciones como leídas' });
  }
}
