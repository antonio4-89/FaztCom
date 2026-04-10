import { Request, Response } from 'express';
import { ComandaStatus, ComandaDestino, ProductoTipo } from '@prisma/client';
import prisma from '../lib/prisma';
import {
  emitNuevaComandaCocina,
  emitNuevaComandaBarra,
  emitComandaActualizada,
  emitPedidoListoMesero,
  emitMesaActualizada,
} from '../socket';

interface CreateComandaItem {
  productoId?: number;
  customName?: string;
  customPrice?: number;
  qty: number;
  tipo: 'comida' | 'bebida';
  price: number;
}

export async function getComandas(req: Request, res: Response): Promise<void> {
  try {
    const { destino, status } = req.query;

    const where: {
      destino?: ComandaDestino;
      status?: ComandaStatus;
    } = {};

    if (destino && (destino === 'cocina' || destino === 'barra')) {
      where.destino = destino as ComandaDestino;
    }

    if (
      status &&
      ['pendiente', 'en_preparacion', 'listo', 'entregado'].includes(status as string)
    ) {
      where.status = status as ComandaStatus;
    }

    const comandas = await prisma.comanda.findMany({
      where,
      include: {
        items: {
          include: { producto: true },
        },
        nota: {
          include: {
            mesa: { select: { id: true, identifier: true, seccion: true } },
            mesero: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(comandas);
  } catch (error) {
    console.error('[getComandas]', error);
    res.status(500).json({ error: 'Error al obtener las comandas' });
  }
}

export async function createComanda(req: Request, res: Response): Promise<void> {
  try {
    const { notaId, mesaId, items } = req.body as {
      notaId?: number;
      mesaId?: number;
      items: CreateComandaItem[];
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'items son requeridos' });
      return;
    }

    const paraLlevar = req.body.paraLlevar === true;

    if (!notaId && !mesaId && !paraLlevar) {
      res.status(400).json({ error: 'notaId, mesaId o paraLlevar es requerido' });
      return;
    }

    // Validate no agotado products
    const productoIds = items.filter(i => i.productoId).map(i => i.productoId!);
    if (productoIds.length > 0) {
      const agotados = await prisma.producto.findMany({
        where: { id: { in: productoIds }, agotado: true },
        select: { id: true, name: true },
      });
      if (agotados.length > 0) {
        const names = agotados.map(p => p.name).join(', ');
        res.status(400).json({ error: `Productos agotados: ${names}` });
        return;
      }
    }

    let nota;

    if (notaId) {
      nota = await prisma.nota.findUnique({
        where: { id: notaId },
        include: { mesa: true },
      });
      if (!nota) {
        res.status(404).json({ error: 'Nota no encontrada' });
        return;
      }
    } else if (paraLlevar) {
      // Create a new nota for para llevar (no mesa)
      const meseroId = req.user!.id;
      nota = await prisma.nota.create({
        data: { meseroId, status: 'abierta', paraLlevar: true },
        include: { mesa: true },
      });
    } else {
      // Find or create open nota for this mesa
      const meseroId = req.user!.id;
      nota = await prisma.nota.findFirst({
        where: { mesaId: mesaId!, status: 'abierta' },
        include: { mesa: true },
      });
      if (!nota) {
        nota = await prisma.nota.create({
          data: { mesaId: mesaId!, meseroId, status: 'abierta' },
          include: { mesa: true },
        });
        // Update mesa status to abierta
        const updatedMesa = await prisma.mesa.update({
          where: { id: mesaId! },
          data: { status: 'abierta' },
        });
        emitMesaActualizada(updatedMesa);
      }
    }

    if (nota.status !== 'abierta') {
      res.status(400).json({ error: 'La nota está cerrada' });
      return;
    }

    const resolvedNotaId = nota.id;

    // Split items by tipo
    const cocinaItems = items.filter((i) => i.tipo === 'comida');
    const barraItems = items.filter((i) => i.tipo === 'bebida');

    const createdComandas = [];

    // Create comanda for cocina if there are comida items
    if (cocinaItems.length > 0) {
      const comanda = await prisma.comanda.create({
        data: {
          notaId: resolvedNotaId,
          destino: ComandaDestino.cocina,
          status: ComandaStatus.pendiente,
          items: {
            create: cocinaItems.map((item) => ({
              productoId: item.productoId ?? null,
              customName: item.customName ?? null,
              customPrice: item.customPrice ?? null,
              qty: item.qty,
              price: item.price,
              tipo: ProductoTipo.comida,
            })),
          },
        },
        include: {
          items: { include: { producto: true } },
          nota: { include: { mesa: { select: { id: true, identifier: true, seccion: true } }, mesero: { select: { id: true, name: true } } } },
        },
      });

      emitNuevaComandaCocina(comanda);
      createdComandas.push(comanda);
    }

    // Create comanda for barra if there are bebida items
    if (barraItems.length > 0) {
      const comanda = await prisma.comanda.create({
        data: {
          notaId: resolvedNotaId,
          destino: ComandaDestino.barra,
          status: ComandaStatus.pendiente,
          items: {
            create: barraItems.map((item) => ({
              productoId: item.productoId ?? null,
              customName: item.customName ?? null,
              customPrice: item.customPrice ?? null,
              qty: item.qty,
              price: item.price,
              tipo: ProductoTipo.bebida,
            })),
          },
        },
        include: {
          items: { include: { producto: true } },
          nota: { include: { mesa: { select: { id: true, identifier: true, seccion: true } }, mesero: { select: { id: true, name: true } } } },
        },
      });

      emitNuevaComandaBarra(comanda);
      createdComandas.push(comanda);
    }

    res.status(201).json(createdComandas);
  } catch (error) {
    console.error('[createComanda]', error);
    res.status(500).json({ error: 'Error al crear la comanda' });
  }
}

export async function updateStatus(req: Request, res: Response): Promise<void> {
  try {
    const comandaId = parseInt(req.params.id, 10);

    if (isNaN(comandaId)) {
      res.status(400).json({ error: 'ID de comanda inválido' });
      return;
    }

    const { status } = req.body as { status: ComandaStatus };

    const validStatuses: ComandaStatus[] = [
      'pendiente',
      'en_preparacion',
      'listo',
      'entregado',
    ];

    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ error: 'Status inválido' });
      return;
    }

    const comanda = await prisma.comanda.findUnique({
      where: { id: comandaId },
      include: {
        items: { include: { producto: true } },
        nota: {
          include: {
            mesa: true,
          },
        },
      },
    });

    if (!comanda) {
      res.status(404).json({ error: 'Comanda no encontrada' });
      return;
    }

    const updatedComanda = await prisma.comanda.update({
      where: { id: comandaId },
      data: { status },
      include: {
        items: { include: { producto: true } },
        nota: {
          include: {
            mesa: { select: { id: true, identifier: true, seccion: true } },
            mesero: { select: { id: true, name: true } },
          },
        },
      },
    });

    emitComandaActualizada(updatedComanda);

    // If status is 'listo', notify the mesero
    if (status === 'listo') {
      const meseroId = comanda.nota.meseroId;
      const mesaIdentifier = comanda.nota.mesa?.identifier || 'Para Llevar';

      // Create notification record
      await prisma.notificacion.create({
        data: {
          meseroId,
          message: `Comanda lista en ${comanda.destino} — ${comanda.nota.mesa ? 'Mesa ' + mesaIdentifier : 'Para Llevar'}`,
          tipo: comanda.destino,
        },
      });

      const payload = {
        comandaId,
        mesa: mesaIdentifier,
        destino: comanda.destino,
        items: comanda.items,
      };

      emitPedidoListoMesero(meseroId, payload);
    }

    res.json(updatedComanda);
  } catch (error) {
    console.error('[updateStatus]', error);
    res.status(500).json({ error: 'Error al actualizar el status de la comanda' });
  }
}

export async function removeItem(req: Request, res: Response): Promise<void> {
  try {
    const comandaId = parseInt(req.params.id, 10);
    const itemId = parseInt(req.params.itemId, 10);

    if (isNaN(comandaId) || isNaN(itemId)) {
      res.status(400).json({ error: 'ID de comanda o item inválido' });
      return;
    }

    const item = await prisma.comandaItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      res.status(404).json({ error: 'Item no encontrado' });
      return;
    }

    if (item.comandaId !== comandaId) {
      res.status(400).json({ error: 'El item no pertenece a esta comanda' });
      return;
    }

    await prisma.comandaItem.delete({ where: { id: itemId } });

    // Check if comanda still has items; if not, mark as entregado (effectively cancelled)
    const remaining = await prisma.comandaItem.count({ where: { comandaId } });

    if (remaining === 0) {
      await prisma.comanda.update({
        where: { id: comandaId },
        data: { status: 'entregado' },
      });
    }

    // Broadcast updated comanda so cocina/barra refresh in real time
    const updated = await prisma.comanda.findUnique({
      where: { id: comandaId },
      include: {
        items: { include: { producto: true } },
        nota: {
          include: {
            mesa: { select: { id: true, identifier: true, seccion: true } },
            mesero: { select: { id: true, name: true } },
          },
        },
      },
    });
    if (updated) emitComandaActualizada(updated);

    res.json({ message: 'Item eliminado correctamente' });
  } catch (error) {
    console.error('[removeItem]', error);
    res.status(500).json({ error: 'Error al eliminar el item' });
  }
}

export async function toggleItemListo(req: Request, res: Response): Promise<void> {
  try {
    const comandaId = parseInt(req.params.id, 10);
    const itemId = parseInt(req.params.itemId, 10);

    if (isNaN(comandaId) || isNaN(itemId)) {
      res.status(400).json({ error: 'ID inválido' });
      return;
    }

    const item = await prisma.comandaItem.findUnique({ where: { id: itemId } });
    if (!item || item.comandaId !== comandaId) {
      res.status(404).json({ error: 'Item no encontrado' });
      return;
    }

    const updated = await prisma.comandaItem.update({
      where: { id: itemId },
      data: { listo: !item.listo },
    });

    // Re-fetch full comanda to broadcast
    const comanda = await prisma.comanda.findUnique({
      where: { id: comandaId },
      include: {
        items: { include: { producto: true } },
        nota: {
          include: {
            mesa: { select: { id: true, identifier: true, seccion: true } },
            mesero: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (comanda) emitComandaActualizada(comanda);

    res.json(updated);
  } catch (error) {
    console.error('[toggleItemListo]', error);
    res.status(500).json({ error: 'Error al actualizar item' });
  }
}

export async function getComandasActivas(_req: Request, res: Response): Promise<void> {
  try {
    const comandas = await prisma.comanda.findMany({
      where: {
        status: { not: 'entregado' },
      },
      include: {
        items: { include: { producto: true } },
        nota: {
          include: {
            mesa: { select: { id: true, identifier: true, seccion: true } },
            mesero: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(comandas);
  } catch (error) {
    console.error('[getComandasActivas]', error);
    res.status(500).json({ error: 'Error al obtener las comandas activas' });
  }
}
