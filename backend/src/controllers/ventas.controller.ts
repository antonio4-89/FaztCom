import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export async function getVentas(_req: Request, res: Response): Promise<void> {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    // Find all closed notas for today
    const notas = await prisma.nota.findMany({
      where: {
        status: 'cerrada',
        closedAt: { gte: startOfDay },
      },
      include: {
        mesa: true,
      },
    });

    // Split by seccion
    const ventasT = notas
      .filter((n) => n.mesa.seccion === 'T')
      .reduce((sum, n) => sum + n.total, 0);

    const ventasPM = notas
      .filter((n) => n.mesa.seccion === 'PM')
      .reduce((sum, n) => sum + n.total, 0);

    const total = ventasT + ventasPM;

    // Get gastos for today
    const gastos = await prisma.gasto.findMany({
      where: {
        date: { gte: startOfDay },
      },
    });

    const totalGastos = gastos.reduce((sum, g) => sum + g.amount, 0);

    res.json({
      ventasT,
      ventasPM,
      total,
      gastos: totalGastos,
      enCaja: total - totalGastos,
      notasCerradas: notas,
    });
  } catch (error) {
    console.error('[getVentas]', error);
    res.status(500).json({ error: 'Error al obtener las ventas' });
  }
}

export async function getHistorialVentas(req: Request, res: Response): Promise<void> {
  try {
    const { desde, hasta } = req.query;

    const where: {
      status: 'cerrada';
      closedAt?: { gte?: Date; lte?: Date };
    } = { status: 'cerrada' };

    if (desde || hasta) {
      where.closedAt = {};
      if (desde) {
        where.closedAt.gte = new Date(desde as string);
      }
      if (hasta) {
        // Include the full day for the end date
        const hastaDate = new Date(hasta as string);
        hastaDate.setHours(23, 59, 59, 999);
        where.closedAt.lte = hastaDate;
      }
    }

    const notas = await prisma.nota.findMany({
      where,
      include: {
        mesa: true,
        mesero: { select: { id: true, name: true } },
        comandas: {
          include: {
            items: { include: { producto: true } },
          },
        },
      },
      orderBy: { closedAt: 'desc' },
    });

    // Calculate summary
    const ventasT = notas
      .filter((n) => n.mesa.seccion === 'T')
      .reduce((sum, n) => sum + n.total, 0);

    const ventasPM = notas
      .filter((n) => n.mesa.seccion === 'PM')
      .reduce((sum, n) => sum + n.total, 0);

    const total = ventasT + ventasPM;

    // Get gastos for the same range
    const gastosWhere: { date?: { gte?: Date; lte?: Date } } = {};
    if (desde || hasta) {
      gastosWhere.date = {};
      if (desde) gastosWhere.date.gte = new Date(desde as string);
      if (hasta) {
        const hastaDate = new Date(hasta as string);
        hastaDate.setHours(23, 59, 59, 999);
        gastosWhere.date.lte = hastaDate;
      }
    }

    const gastos = await prisma.gasto.findMany({ where: gastosWhere });
    const totalGastos = gastos.reduce((sum, g) => sum + g.amount, 0);

    res.json({
      ventasT,
      ventasPM,
      total,
      gastos: totalGastos,
      enCaja: total - totalGastos,
      notasCerradas: notas,
      gastosDetalle: gastos,
    });
  } catch (error) {
    console.error('[getHistorialVentas]', error);
    res.status(500).json({ error: 'Error al obtener el historial de ventas' });
  }
}
