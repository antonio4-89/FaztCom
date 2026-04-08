import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

// In-memory store for password reset codes (in production use Redis)
const resetCodes = new Map<string, { code: string; expires: number }>();

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email y contraseña son requeridos' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.active) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET no configurado');

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      secret,
      { expiresIn: '12h' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, mustChangePassword: user.mustChangePassword },
    });
  } catch (error) {
    console.error('[login]', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email es requerido' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (user && user.active) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = Date.now() + 15 * 60 * 1000; // 15 minutes

      resetCodes.set(email, { code, expires });

      // In production, send an actual email. For now, log to console.
      console.log(`[ForgotPassword] Reset code for ${email}: ${code}`);
    }

    // Always return success — don't reveal if email exists
    res.json({ message: 'Si el correo existe, recibirás un código de recuperación' });
  } catch (error) {
    console.error('[forgotPassword]', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      res.status(400).json({ error: 'Email, código y nueva contraseña son requeridos' });
      return;
    }

    const entry = resetCodes.get(email);

    if (!entry) {
      res.status(400).json({ error: 'Código inválido o expirado' });
      return;
    }

    if (entry.code !== code) {
      res.status(400).json({ error: 'Código inválido o expirado' });
      return;
    }

    if (Date.now() > entry.expires) {
      resetCodes.delete(email);
      res.status(400).json({ error: 'Código inválido o expirado' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    resetCodes.delete(email);

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('[resetPassword]', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
      },
    });

    res.json({ message: 'Contraseña actualizada' });
  } catch (error) {
    console.error('[changePassword]', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
