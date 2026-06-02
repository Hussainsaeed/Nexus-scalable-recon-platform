import {
    Request,
    Response,
    NextFunction,
  } from "express";
  
  // ======================================
  // EXTEND REQUEST TYPE
  // ======================================
  
  interface AuthRequest extends Request {
    user?: any;
  }
  
  // ======================================
  // ADMIN ONLY MIDDLEWARE
  // ======================================
  
  const adminOnly = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // ======================================
      // CHECK USER ROLE
      // ======================================
  
      if (req.user?.role !== "admin") {
        return res.status(403).json({
          success: false,
          error: "Access denied. Admins only.",
        });
      }
  
      next();
  
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Authorization failed",
      });
    }
  };
  
  export default adminOnly;