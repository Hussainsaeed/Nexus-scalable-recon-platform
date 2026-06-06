import {
    Response,
    NextFunction,
  } from 'express';
  
  export const allowRoles =
    (...roles: string[]) =>
    (
      req: any,
      res: Response,
      next: NextFunction
    ) => {
  
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }
  
      if (
        !roles.includes(
          req.user.role
        )
      ) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }
  
      next();
    };