import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import prisma from '../lib/prisma';

export async function getUsuarios(_req: Request, res: Response): Promise<void> {
  try {
    const usuarios = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(usuarios);
  } catch (error) {
    console.error('[getUsuarios]', error);
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
}

export async function createUsuario(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      res.status(400).json({ error: 'name, email, password y role son requeridos' });
      return;
    }

    const validRoles: Role[] = ['admin', 'mesero', 'cocinero', 'bartender'];
    if (!validRoles.includes(role)) {
      res.status(400).json({ error: 'role inválido' });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'Ya existe un usuario con ese email' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const usuario = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
      },
    });

    res.status(201).json(usuario);
  } catch (error) {
    console.error('[createUsuario]', error);
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
}

export async function updateUsuario(req: Request, res: Response): Promise<void> {
  try {
    const usuarioId = parseInt(req.params.id, 10);

    if (isNaN(usuarioId)) {
      res.status(400).json({ error: 'ID de usuario inválido' });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { id: usuarioId } });

    if (!existing) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    const { name, email, role, active, password } = req.body;

    const updateData: Partial<{
      name: string;
      email: string;
      role: Role;
      active: boolean;
      password: string;
    }> = {};

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (active !== undefined) updateData.active = active;
    if (password !== undefined) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const usuario = await prisma.user.update({
      where: { id: usuarioId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
      },
    });

    res.json(usuario);
  } catch (error) {
    console.error('[updateUsuario]', error);
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
}
