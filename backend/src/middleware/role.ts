import { Request, Response, NextFunction } from 'express';

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;

    if (!userRole || !roles.includes(userRole)) {
      res.status(403).json({
        error: 'Acceso denegado',
        detail: `Se requiere uno de los roles: ${roles.join(', ')}`,
      });
      return;
    }

    next();
  };
}
