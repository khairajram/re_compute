import  { Request, Response, NextFunction } from "express";
import { getGoogleAccessToken } from "./providers/google.provider.js";
import { googleLoginService } from "./auth.service.js";
import bcrypt from "bcrypt";
import {prisma} from "@repo/db";

export const googleAuth = (req: Request, res: Response) => {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=profile email`;

  res.redirect(url);
};

export const simpleSignup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
    const body = req.body;

    const {name , email , password } = body;

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("DB URL:", process.env.DATABASE_URL);

    try{
      const existingUser = await prisma.user.findUnique({
        where: {
          email
        }
      });

      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await prisma.user.create({ 
        data: {
          name,
          email,
          password: hashedPassword
        } });

      if(!user){
        return res.status(500).json({ message: "Failed to create user" });
      }else{
        return res.status(201).json({ message: "User created successfully" });
      }

    }catch(err){
      console.error(err);
      next(err);
    }
};

export const simpleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = req.body;
    const { email, password } = body;

    const existingUser = await prisma.user.findUnique({
        where: {
          email
        }
      });
    

    if (existingUser &&existingUser.provider !== "local") {
      throw new Error("Use Google login");
    }

    // res.json(result);
  } catch (err) {
    next(err);
  }
};

export const googleCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const code = req.query.code as string;

    // 1. Get access token
    const accessToken = await getGoogleAccessToken(code);

    // 2. Login user
    const result = await googleLoginService(accessToken);

    res.json(result);
  } catch (err) {
    next(err);
  }
};