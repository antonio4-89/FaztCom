import { Request, Response } from 'express';
import prisma from '../lib/prisma';

interface MonthlySummary {
  mes: number;
  nombre: string;
  ventasT: number;
  ventasPM: number;
  ventasPL: number;
  total: number;
}

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
      .filter((n) => n.mesa?.seccion === 'T')
      .reduce((sum, n) => sum + n.total, 0);

    const ventasPM = notas
      .filter((n) => n.mesa?.seccion === 'PM')
      .reduce((sum, n) => sum + n.total, 0);

    const ventasPL = notas
      .filter((n) => n.paraLlevar || !n.mesa)
      .reduce((sum, n) => sum + n.total, 0);

    const total = ventasT + ventasPM + ventasPL;

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
      ventasPL,
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
      .filter((n) => n.mesa?.seccion === 'T')
      .reduce((sum, n) => sum + n.total, 0);

    const ventasPM = notas
      .filter((n) => n.mesa?.seccion === 'PM')
      .reduce((sum, n) => sum + n.total, 0);

    const ventasPL = notas
      .filter((n) => n.paraLlevar || !n.mesa)
      .reduce((sum, n) => sum + n.total, 0);

    const total = ventasT + ventasPM + ventasPL;

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
      ventasPL,
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

export async function getVentasDiarias(req: Request, res: Response): Promise<void> {
  try {
    const { desde, hasta } = req.query;
    if (!desde || !hasta) {
      res.status(400).json({ error: 'desde y hasta son requeridos' });
      return;
    }

    const desdeDate = new Date(desde as string);
    const hastaDate = new Date(hasta as string);
    hastaDate.setHours(23, 59, 59, 999);

    const notas = await prisma.nota.findMany({
      where: { status: 'cerrada', closedAt: { gte: desdeDate, lte: hastaDate } },
      include: { mesa: true },
      orderBy: { closedAt: 'asc' },
    });

    // Group by calendar day
    const dayMap = new Map<string, { fecha: string; ventasT: number; ventasPM: number; ventasPL: number; total: number; notas: number }>();

    for (const nota of notas) {
      const d = nota.closedAt!;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!dayMap.has(key)) {
        dayMap.set(key, { fecha: key, ventasT: 0, ventasPM: 0, ventasPL: 0, total: 0, notas: 0 });
      }
      const entry = dayMap.get(key)!;
      entry.notas++;
      if (nota.paraLlevar || !nota.mesa) {
        entry.ventasPL += nota.total;
      } else if (nota.mesa.seccion === 'T') {
        entry.ventasT += nota.total;
      } else {
        entry.ventasPM += nota.total;
      }
      entry.total += nota.total;
    }

    // Fill in all days in range (even with no sales)
    const result = [];
    const cursor = new Date(desdeDate);
    while (cursor <= hastaDate) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
      result.push(dayMap.get(key) || { fecha: key, ventasT: 0, ventasPM: 0, ventasPL: 0, total: 0, notas: 0 });
      cursor.setDate(cursor.getDate() + 1);
    }

    const totalGeneral = result.reduce((s, d) => s + d.total, 0);

    res.json({ dias: result, total: totalGeneral });
  } catch (error) {
    console.error('[getVentasDiarias]', error);
    res.status(500).json({ error: 'Error al obtener las ventas diarias' });
  }
}

export async function getVentasMensuales(req: Request, res: Response): Promise<void> {
  try {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];

    const result: MonthlySummary[] = [];

    for (let m = 0; m < 12; m++) {
      const desde = new Date(year, m, 1, 0, 0, 0, 0);
      const hasta = new Date(year, m + 1, 0, 23, 59, 59, 999);

      const notas = await prisma.nota.findMany({
        where: {
          status: 'cerrada',
          closedAt: { gte: desde, lte: hasta },
        },
        include: { mesa: true },
      });

      const ventasT = notas.filter(n => n.mesa?.seccion === 'T').reduce((s, n) => s + n.total, 0);
      const ventasPM = notas.filter(n => n.mesa?.seccion === 'PM').reduce((s, n) => s + n.total, 0);
      const ventasPL = notas.filter(n => n.paraLlevar || !n.mesa).reduce((s, n) => s + n.total, 0);

      result.push({
        mes: m + 1,
        nombre: meses[m],
        ventasT,
        ventasPM,
        ventasPL,
        total: ventasT + ventasPM + ventasPL,
      });
    }

    res.json(result);
  } catch (error) {
    console.error('[getVentasMensuales]', error);
    res.status(500).json({ error: 'Error al obtener las ventas mensuales' });
  }
}
