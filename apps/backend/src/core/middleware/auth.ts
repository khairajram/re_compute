import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

export interface AuthRequest extends Request {
  user?: { id: number };
}

export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  let token =
    req.cookies?.token ||
    (req.headers.authorization?.startsWith("Bearer")
      ? req.headers.authorization.split(" ")[1]
      : null);


  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, no token" });
  }

  

  try {
    const decoded = jwt.verify(token, config.JWT.SECRET) as { userId: number };

    if(!decoded.userId){
      return res.status(401).json({ success: false, message: "Invalid token" });
      return;
    }


    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};