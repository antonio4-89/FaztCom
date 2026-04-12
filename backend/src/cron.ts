import cron from 'node-cron';
import prisma from './lib/prisma';
import { emitMesaActualizada, emitNotaCerrada } from './socket';

// Hora del cierre automatico: 23:50 (10 minutos antes de medianoche)
const CIERRE_HORA = '50 23 * * *';

export function startCronJobs(): void {
  // Cierre automatico diario a las 23:50
  cron.schedule(CIERRE_HORA, async () => {
    console.log('[CRON] Cierre automatico 23:50 — cerrando notas abiertas...');
    try {
      const openNotas = await prisma.nota.findMany({
        where: { status: 'abierta' },
        include: {
          comandas: { include: { items: true } },
          mesa: true,
        },
      });

      if (openNotas.length === 0) {
        console.log('[CRON] Sin notas abiertas. Nada que cerrar.');
        return;
      }

      for (const nota of openNotas) {
        // Calcular total sumando items de todas las comandas
        let total = 0;
        for (const comanda of nota.comandas) {
          for (const item of comanda.items) {
            total += item.price * item.qty;
          }
        }

        // Cerrar la nota
        await prisma.nota.update({
          where: { id: nota.id },
          data: {
            status: 'cerrada',
            total,
            closedAt: new Date(),
          },
        });

        // Marcar todas las comandas pendientes/en-preparacion como entregado
        await prisma.comanda.updateMany({
          where: {
            notaId: nota.id,
            status: { not: 'entregado' },
          },
          data: { status: 'entregado' },
        });

        // Liberar la mesa (a limpiar) si aplica
        if (nota.mesaId) {
          const updatedMesa = await prisma.mesa.update({
            where: { id: nota.mesaId },
            data: { status: 'limpiar' },
          });
          emitMesaActualizada(updatedMesa);
        }

        // Notificar a la pantalla del admin que esta nota fue cerrada
        emitNotaCerrada(nota.id);
      }

      console.log(`[CRON] Cierre completado: ${openNotas.length} nota(s) cerrada(s) automaticamente`);
    } catch (error) {
      console.error('[CRON] Error en cierre automatico:', error);
    }
  });

  console.log(`[CRON] Cierre automatico programado para las 23:50`);
}
