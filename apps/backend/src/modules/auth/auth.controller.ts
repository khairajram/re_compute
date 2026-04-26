import  e, { Request, Response, NextFunction } from "express";
import { getGoogleAccessToken, getGoogleUser } from "./providers/google.provider.js";
import { googleLoginService } from "./auth.service.js";
import bcrypt from "bcrypt";
import {prisma} from "@repo/db/client";
import jwt from "jsonwebtoken";
import { userSignUPSchema } from "./auth.types.js";
import { config } from "../../core/config/config.js";
import { de } from "zod/locales";

export const googleAuth = (req: Request, res: Response) => {
  // const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=profile email`;

  const url = `https://accounts.google.com/o/oauth2/v2/auth?` +
    new URLSearchParams({
      client_id: config.GOOGLE_CLIENT_ID,
      redirect_uri: "http://localhost:4000/api/auth/google/callback",
      response_type: "code",
      scope: "profile email",
      access_type: "offline",
      prompt: "consent",
    });

    console.log(url)

  res.redirect(url);
};



export const simpleSignup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
    try{
      const body = req.body;

      const parseBody = await userSignUPSchema.safeParse(body);

      if (!parseBody.success) {
        const formattedErrors = parseBody.error.flatten()

        return res.status(400).json({ success: false, message: "Invalid input data", error : formattedErrors.fieldErrors });
      }

      const {name , email , password } = parseBody.data;

      const hashedPassword = await bcrypt.hash(password, 10);

      const existingUser = await prisma.user.findUnique({
        where: {
          email
        }
      });

      if (existingUser) {
        return res.status(400).json({ success: false, message: "User already exists" });
      }

      const user = await prisma.user.create({ 
        data: {
          name,
          email,
          password: hashedPassword
        } });

      if(!user){
        return res.status(500).json({ success: false, message: "Failed to create user" });
      }else{
        return res.status(201).json({ success: true, message: "User created successfully" }).redirect(`${config.FRONTEND_URL}/login`);
      }

    }catch(err){
      next(err);
    }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.clearCookie("token");
    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
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

    if(!email || !password){
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const existingUser = await prisma.user.findUnique({
        where: {
          email
        }
      });

    if(!existingUser){
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }else{
      if(existingUser.provider !== "local"){
        return res.status(400).json({ success: false, message: "Use Google login" });
        return;
      }else{
        const isPasswordValid = await bcrypt.compare(password, existingUser.password);    

        if(!isPasswordValid){
          return res.status(400).json({ 
            success: false,
            message: "Invalid password" 
          });
        }else{
          const token = jwt.sign({ userId: existingUser.id }, config.JWT.SECRET, { expiresIn: config.JWT.EXPIRES_IN });
          res.cookie("token", token, { httpOnly: true,secure : true, sameSite: "strict" });
          res.json({ 
            success: true,
            message: "Login successful"
           });
        }

      }
    }

    res.redirect(`${config.FRONTEND_URL}/dashboard`);


    

    if (existingUser &&existingUser.provider !== "local") {
      throw new Error("Use Google login");
    }

    // res.json(result);
  } catch (err) {
    next(err);
  }
};

export const authme = async (req: Request, res: Response, next: NextFunction) => {
  try{
    console.log(req.cookies)
    const token = req.cookies.token;
    if(!token){
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, config.JWT.SECRET) as { userId: string };
    if(!decoded.userId){
      throw new Error("Invalid token");
    }
    
    res.status(200).json({ success: true, userId : decoded.userId });
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

    const accessToken = await getGoogleAccessToken(code);

    const googleUser = await getGoogleUser(accessToken);

    const { email, name, id } : {
      email : string,
      name : string,
      id : string
    } = googleUser;


    const existingUser = await prisma.user.findUnique({
      where: {
        email
      }
    });

    let user;
    if(!existingUser){
      user = await prisma.user.create({ 
        data: {
          name,
          email,
          provider : "google",
          providerId :  id
        } });

      if(!user){
        return res.status(500).json({ success: false, message: "Failed to create user" });
      }
    }

    const token = jwt.sign({ userId: user?.id }, config.JWT.SECRET, { expiresIn: config.JWT.EXPIRES_IN });
    res.cookie("token", token, { httpOnly: true,secure : true, sameSite: "none" });
    res.redirect(`${config.FRONTEND_URL}/dashboard`);


  } catch (err) {
    next(err);
  }
};