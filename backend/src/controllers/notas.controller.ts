import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { emitMesaActualizada, emitNotaCerrada } from '../socket';

export async function getMisNotas(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user!;

    const where =
      user.role === 'admin'
        ? { status: 'abierta' as const }
        : { meseroId: user.id, status: 'abierta' as const };

    const notas = await prisma.nota.findMany({
      where,
      include: {
        mesa: true,
        mesero: { select: { id: true, name: true } },
        comandas: {
          include: {
            items: {
              include: { producto: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(notas);
  } catch (error) {
    console.error('[getMisNotas]', error);
    res.status(500).json({ error: 'Error al obtener las notas' });
  }
}

export async function getHistorial(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user!;

    // Solo mostrar notas cerradas del dia actual
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    const where =
      user.role === 'admin'
        ? { status: 'cerrada' as const, closedAt: { gte: startOfDay } }
        : { meseroId: user.id, status: 'cerrada' as const, closedAt: { gte: startOfDay } };

    const notas = await prisma.nota.findMany({
      where,
      include: {
        mesa: true,
        mesero: { select: { id: true, name: true } },
        comandas: {
          include: {
            items: {
              include: { producto: true },
            },
          },
        },
      },
      orderBy: { closedAt: 'desc' },
    });

    res.json(notas);
  } catch (error) {
    console.error('[getHistorial]', error);
    res.status(500).json({ error: 'Error al obtener el historial de notas' });
  }
}

export async function getNotaById(req: Request, res: Response): Promise<void> {
  try {
    const notaId = parseInt(req.params.id, 10);

    if (isNaN(notaId)) {
      res.status(400).json({ error: 'ID de nota inválido' });
      return;
    }

    const nota = await prisma.nota.findUnique({
      where: { id: notaId },
      include: {
        mesa: true,
        mesero: { select: { id: true, name: true, email: true, role: true } },
        comandas: {
          include: {
            items: {
              include: { producto: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!nota) {
      res.status(404).json({ error: 'Nota no encontrada' });
      return;
    }

    res.json(nota);
  } catch (error) {
    console.error('[getNotaById]', error);
    res.status(500).json({ error: 'Error al obtener la nota' });
  }
}

export async function closeNota(req: Request, res: Response): Promise<void> {
  try {
    const notaId = parseInt(req.params.id, 10);

    if (isNaN(notaId)) {
      res.status(400).json({ error: 'ID de nota inválido' });
      return;
    }

    const nota = await prisma.nota.findUnique({
      where: { id: notaId },
      include: {
        comandas: {
          include: { items: true },
        },
        mesa: true,
      },
    });

    if (!nota) {
      res.status(404).json({ error: 'Nota no encontrada' });
      return;
    }

    if (nota.status !== 'abierta') {
      res.status(400).json({ error: 'La nota ya está cerrada' });
      return;
    }

    // Verificar que no haya comandas pendientes o en preparacion
    const comandasActivas = nota.comandas.filter(
      c => c.status === 'pendiente' || c.status === 'en_preparacion'
    );
    if (comandasActivas.length > 0) {
      res.status(400).json({
        error: `No se puede cerrar la cuenta. Hay ${comandasActivas.length} comanda(s) que aún no están listas.`,
      });
      return;
    }

    // Calculate total from all ComandaItems (price * qty) across all comandas
    let total = 0;
    for (const comanda of nota.comandas) {
      for (const item of comanda.items) {
        total += item.price * item.qty;
      }
    }

    // Update nota: status=cerrada, total, closedAt
    const updatedNota = await prisma.nota.update({
      where: { id: notaId },
      data: {
        status: 'cerrada',
        total,
        closedAt: new Date(),
      },
      include: {
        mesa: true,
        mesero: { select: { id: true, name: true } },
        comandas: {
          include: { items: { include: { producto: true } } },
        },
      },
    });

    // Update mesa: status=limpiar (waiter must mark as clean to free it)
    if (nota.mesaId) {
      const updatedMesa = await prisma.mesa.update({
        where: { id: nota.mesaId },
        data: { status: 'limpiar' },
      });
      emitMesaActualizada(updatedMesa);
    }

    // Notify admin that this nota was closed so they can refresh
    emitNotaCerrada(notaId);

    res.json(updatedNota);
  } catch (error) {
    console.error('[closeNota]', error);
    res.status(500).json({ error: 'Error al cerrar la nota' });
  }
}
