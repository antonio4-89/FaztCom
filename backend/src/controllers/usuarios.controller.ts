import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { Role } from '@prisma/client';
import prisma from '../lib/prisma';

export async function getUsuarios(_req: Request, res: Response): Promise<void> {
  try {
    const usuarios = await prisma.user.findMany({
      where: { active: true },
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
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
      res.status(400).json({ error: 'name, email y role son requeridos' });
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

    // Generate random 6-char alphanumeric code (uppercase)
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const hashedPassword = await bcrypt.hash(code, 10);

    const usuario = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        mustChangePassword: true,
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

    // Send welcome email with temporary access code
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Tu acceso a FaztCom',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #333;">Bienvenido a FaztCom, ${name}</h2>
            <p style="color: #555;">Tu cuenta ha sido creada. Usa el siguiente código temporal para ingresar:</p>
            <div style="
              background: #f4f4f4;
              border: 2px dashed #aaa;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              margin: 24px 0;
            ">
              <span style="
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 6px;
                color: #222;
                font-family: monospace;
              ">${code}</span>
            </div>
            <p style="color: #555;">Se te pedirá que cambies tu contraseña al iniciar sesión por primera vez.</p>
            <p style="color: #999; font-size: 12px;">Si no esperabas este correo, ignóralo.</p>
          </div>
        `,
      });
    } catch (mailError) {
      console.error('[createUsuario] Error al enviar email:', mailError);
      // Don't fail the request — user was created successfully
    }

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

export async function deleteUsuario(req: Request, res: Response): Promise<void> {
  try {
    const usuarioId = parseInt(req.params.id, 10);

    if (isNaN(usuarioId)) {
      res.status(400).json({ error: 'ID de usuario inválido' });
      return;
    }

    // Cannot delete yourself
    if (req.user!.id === usuarioId) {
      res.status(400).json({ error: 'No puedes eliminar tu propio usuario' });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { id: usuarioId } });

    if (!existing) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    // Hard delete the user (cascade will handle related records)
    // First check if user has notas — if so, soft-delete instead
    const notasCount = await prisma.nota.count({ where: { meseroId: usuarioId } });

    if (notasCount > 0) {
      await prisma.user.update({
        where: { id: usuarioId },
        data: { active: false },
      });
      res.status(200).json({ message: 'Usuario desactivado correctamente' });
    } else {
      // Delete notifications first, then user
      await prisma.notificacion.deleteMany({ where: { meseroId: usuarioId } });
      await prisma.user.delete({ where: { id: usuarioId } });
      res.status(200).json({ message: 'Usuario eliminado correctamente' });
    }
  } catch (error) {
    console.error('[deleteUsuario]', error);
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
}
