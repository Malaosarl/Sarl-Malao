import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { RBACService } from '../services/rbacService';
import { AppError } from './errorHandler';


export const requirePermission = (resource: string, action: string) => {
  return async (req: AuthRequest, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError('Non authentifié', 401));
      }

      const hasPermission = await RBACService.hasPermission(
        req.user.id,
        resource,
        action
      );

      if (!hasPermission) {
        return next(
          new AppError(
            `Accès refusé. Permission requise: ${resource}:${action}`,
            403
          )
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};


export const requireAnyPermission = (
  permissions: Array<{ resource: string; action: string }>
) => {
  return async (req: AuthRequest, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError('Non authentifié', 401));
      }

      for (const perm of permissions) {
        const hasPermission = await RBACService.hasPermission(
          req.user.id,
          perm.resource,
          perm.action
        );
        if (hasPermission) {
          return next();
        }
      }

      return next(
        new AppError('Accès refusé. Permissions insuffisantes', 403)
      );
    } catch (error) {
      next(error);
    }
  };
};





