import {
    Request,
    Response,
    NextFunction,
  } from "express";
  
  import jwt from "jsonwebtoken";
  
  // ======================================
  // EXTEND REQUEST TYPE
  // ======================================
  
  interface AuthRequest extends Request {
    user?: any;
  }
  
  // ======================================
  // AUTH MIDDLEWARE
  // ======================================
  
  const protect = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      let token;
  
      // ======================================
      // CHECK AUTH HEADER
      // ======================================
  
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith(
          "Bearer"
        )
      ) {
        token =
          req.headers.authorization.split(" ")[1];
      }
  
      // ======================================
      // NO TOKEN
      // ======================================
  
      if (!token) {
        return res.status(401).json({
          success: false,
          error: "Not authorized, no token",
        });
      }
  
      // ======================================
      // VERIFY TOKEN
      // ======================================
  
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      );
  
      // ======================================
      // SAVE USER DATA
      // ======================================
  
      req.user = decoded;
  
      next();
  
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: "Not authorized, token failed",
      });
    }
  };
  
  export default protect;