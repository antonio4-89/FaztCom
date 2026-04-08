import { Request, Response } from 'express';
import { Producto, ProductoTipo, ProductoCategoria } from '@prisma/client';
import prisma from '../lib/prisma';

type GroupedMenu = {
  comida: Record<string, Producto[]>;
  bebida: Record<string, Producto[]>;
};

export async function getMenu(_req: Request, res: Response): Promise<void> {
  try {
    const productos = await prisma.producto.findMany({
      where: { active: true },
      orderBy: { categoria: 'asc' },
    });

    // Group by tipo then categoria
    const grouped: GroupedMenu = { comida: {}, bebida: {} };

    for (const producto of productos) {
      const tipoKey = producto.tipo === ProductoTipo.comida ? 'comida' : 'bebida';
      const cat = producto.categoria;

      if (!grouped[tipoKey][cat]) {
        grouped[tipoKey][cat] = [];
      }
      grouped[tipoKey][cat].push(producto);
    }

    res.json(grouped);
  } catch (error) {
    console.error('[getMenu]', error);
    res.status(500).json({ error: 'Error al obtener el menú' });
  }
}

export async function createProducto(req: Request, res: Response): Promise<void> {
  try {
    const { name, categoria, price, tipo } = req.body;

    if (!name || !categoria || price === undefined || !tipo) {
      res.status(400).json({ error: 'name, categoria, price y tipo son requeridos' });
      return;
    }

    if (!['comida', 'bebida'].includes(tipo)) {
      res.status(400).json({ error: 'tipo debe ser comida o bebida' });
      return;
    }

    const producto = await prisma.producto.create({
      data: {
        name,
        categoria,
        price: parseFloat(price),
        tipo,
      },
    });

    res.status(201).json(producto);
  } catch (error) {
    console.error('[createProducto]', error);
    res.status(500).json({ error: 'Error al crear el producto' });
  }
}

export async function updateProducto(req: Request, res: Response): Promise<void> {
  try {
    const productoId = parseInt(req.params.id, 10);

    if (isNaN(productoId)) {
      res.status(400).json({ error: 'ID de producto inválido' });
      return;
    }

    const existing = await prisma.producto.findUnique({ where: { id: productoId } });

    if (!existing) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    const { name, categoria, price, tipo, active } = req.body;

    const updateData: Partial<{
      name: string;
      categoria: ProductoCategoria;
      price: number;
      tipo: ProductoTipo;
      active: boolean;
    }> = {};

    if (name !== undefined) updateData.name = name;
    if (categoria !== undefined) updateData.categoria = categoria;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (tipo !== undefined) updateData.tipo = tipo;
    if (active !== undefined) updateData.active = active;

    const producto = await prisma.producto.update({
      where: { id: productoId },
      data: updateData,
    });

    res.json(producto);
  } catch (error) {
    console.error('[updateProducto]', error);
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
}

export async function deleteProducto(req: Request, res: Response): Promise<void> {
  try {
    const productoId = parseInt(req.params.id, 10);

    if (isNaN(productoId)) {
      res.status(400).json({ error: 'ID de producto inválido' });
      return;
    }

    const existing = await prisma.producto.findUnique({ where: { id: productoId } });

    if (!existing) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    const producto = await prisma.producto.update({
      where: { id: productoId },
      data: { active: false },
    });

    res.json({ message: 'Producto desactivado correctamente', producto });
  } catch (error) {
    console.error('[deleteProducto]', error);
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
}

export async function toggleAgotado(req: Request, res: Response): Promise<void> {
  try {
    const productoId = parseInt(req.params.id, 10);
    if (isNaN(productoId)) {
      res.status(400).json({ error: 'ID de producto inválido' });
      return;
    }

    const producto = await prisma.producto.findUnique({ where: { id: productoId } });
    if (!producto) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    const userRole = req.user!.role;

    // Cocinero solo puede marcar comida, bartender solo bebida
    if (userRole === 'cocinero' && producto.tipo !== 'comida') {
      res.status(403).json({ error: 'Solo puedes marcar productos de comida' });
      return;
    }
    if (userRole === 'bartender' && producto.tipo !== 'bebida') {
      res.status(403).json({ error: 'Solo puedes marcar productos de bebida' });
      return;
    }

    const updated = await prisma.producto.update({
      where: { id: productoId },
      data: { agotado: !producto.agotado },
    });

    res.json(updated);
  } catch (error) {
    console.error('[toggleAgotado]', error);
    res.status(500).json({ error: 'Error al actualizar stock' });
  }
}
