import {
    NextFunction,
    Request,
    Response,
  } from "express";
  
  import jwt from "jsonwebtoken";
  
  import { env } from "../config/env.js";
  
  interface JwtPayload {
    userId: string;
    systemRole: "admin" | "member";
  }
  
  declare global {
    namespace Express {
      interface Request {
        user?: JwtPayload;
      }
    }
  }
  
  export function authenticate(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const authHeader = req.headers.authorization;
  
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
  
    const token = authHeader.split(" ")[1];
  
    try {
      const decoded = jwt.verify(
        token,
        env.JWT_ACCESS_SECRET
      ) as JwtPayload;
  
      req.user = decoded;
  
      next();
    } catch {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
  }