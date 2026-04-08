import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { emitMesaActualizada } from '../socket';

export async function getMesas(_req: Request, res: Response): Promise<void> {
  try {
    const mesas = await prisma.mesa.findMany({
      include: {
        notas: {
          where: { status: 'abierta' },
          include: {
            mesero: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { identifier: 'asc' },
    });

    res.json(mesas);
  } catch (error) {
    console.error('[getMesas]', error);
    res.status(500).json({ error: 'Error al obtener las mesas' });
  }
}

export async function getNotaByMesa(req: Request, res: Response): Promise<void> {
  try {
    const mesaId = parseInt(req.params.id, 10);

    if (isNaN(mesaId)) {
      res.status(400).json({ error: 'ID de mesa inválido' });
      return;
    }

    const mesa = await prisma.mesa.findUnique({ where: { id: mesaId } });

    if (!mesa) {
      res.status(404).json({ error: 'Mesa no encontrada' });
      return;
    }

    const nota = await prisma.nota.findFirst({
      where: { mesaId, status: 'abierta' },
      include: {
        mesa: true,
        mesero: { select: { id: true, name: true, email: true, role: true } },
        comandas: {
          include: {
            items: {
              include: {
                producto: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!nota) {
      res.status(404).json({ error: 'No hay nota abierta para esta mesa' });
      return;
    }

    res.json(nota);
  } catch (error) {
    console.error('[getNotaByMesa]', error);
    res.status(500).json({ error: 'Error al obtener la nota de la mesa' });
  }
}

export async function updateMesaStatus(req: Request, res: Response): Promise<void> {
  try {
    const mesaId = parseInt(req.params.id, 10);
    if (isNaN(mesaId)) {
      res.status(400).json({ error: 'ID de mesa inválido' });
      return;
    }

    const { status } = req.body;
    if (!status || !['libre', 'limpiar'].includes(status)) {
      res.status(400).json({ error: 'Status inválido. Usa: libre o limpiar' });
      return;
    }

    const mesa = await prisma.mesa.findUnique({ where: { id: mesaId } });
    if (!mesa) {
      res.status(404).json({ error: 'Mesa no encontrada' });
      return;
    }

    const updated = await prisma.mesa.update({
      where: { id: mesaId },
      data: { status },
    });

    emitMesaActualizada(updated);
    res.json(updated);
  } catch (error) {
    console.error('[updateMesaStatus]', error);
    res.status(500).json({ error: 'Error al actualizar mesa' });
  }
}
