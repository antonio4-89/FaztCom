import cron from 'node-cron';
import prisma from './lib/prisma';
import { emitMesaActualizada } from './socket';

export function startCronJobs(): void {
  // Every day at midnight: close all open notas and set mesas to limpiar
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Midnight auto-close: closing open notas...');
    try {
      const openNotas = await prisma.nota.findMany({
        where: { status: 'abierta' },
        include: {
          comandas: { include: { items: true } },
          mesa: true,
        },
      });

      for (const nota of openNotas) {
        // Calculate total
        let total = 0;
        for (const comanda of nota.comandas) {
          for (const item of comanda.items) {
            total += item.price * item.qty;
          }
        }

        // Close the nota
        await prisma.nota.update({
          where: { id: nota.id },
          data: {
            status: 'cerrada',
            total,
            closedAt: new Date(),
          },
        });

        // Update all pending/in-progress comandas to entregado
        await prisma.comanda.updateMany({
          where: {
            notaId: nota.id,
            status: { not: 'entregado' },
          },
          data: { status: 'entregado' },
        });

        // Set mesa to limpiar if exists
        if (nota.mesaId) {
          const updatedMesa = await prisma.mesa.update({
            where: { id: nota.mesaId },
            data: { status: 'limpiar' },
          });
          emitMesaActualizada(updatedMesa);
        }
      }

      console.log(`[CRON] Closed ${openNotas.length} open nota(s) at midnight`);
    } catch (error) {
      console.error('[CRON] Error in midnight auto-close:', error);
    }
  });

  console.log('[CRON] Midnight auto-close scheduled');
}
