import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export async function getGastos(_req: Request, res: Response): Promise<void> {
  try {
    const gastos = await prisma.gasto.findMany({
      orderBy: { date: 'desc' },
    });

    res.json(gastos);
  } catch (error) {
    console.error('[getGastos]', error);
    res.status(500).json({ error: 'Error al obtener los gastos' });
  }
}

export async function createGasto(req: Request, res: Response): Promise<void> {
  try {
    const { description, amount, date } = req.body;

    if (!description || amount === undefined) {
      res.status(400).json({ error: 'description y amount son requeridos' });
      return;
    }

    if (typeof amount !== 'number' || amount < 0) {
      res.status(400).json({ error: 'amount debe ser un número positivo' });
      return;
    }

    const gasto = await prisma.gasto.create({
      data: {
        description,
        amount,
        date: date ? new Date(date) : new Date(),
      },
    });

    res.status(201).json(gasto);
  } catch (error) {
    console.error('[createGasto]', error);
    res.status(500).json({ error: 'Error al crear el gasto' });
  }
}

export async function deleteGasto(req: Request, res: Response): Promise<void> {
  try {
    const gastoId = parseInt(req.params.id, 10);

    if (isNaN(gastoId)) {
      res.status(400).json({ error: 'ID de gasto inválido' });
      return;
    }

    const existing = await prisma.gasto.findUnique({ where: { id: gastoId } });

    if (!existing) {
      res.status(404).json({ error: 'Gasto no encontrado' });
      return;
    }

    await prisma.gasto.delete({ where: { id: gastoId } });

    res.json({ message: 'Gasto eliminado correctamente' });
  } catch (error) {
    console.error('[deleteGasto]', error);
    res.status(500).json({ error: 'Error al eliminar el gasto' });
  }
}
