import { Request, Response, NextFunction } from "express";
import { getGoogleAccessToken } from "./providers/google.provider";
import { googleLoginService } from "./auth.service";

export const googleAuth = (req: Request, res: Response) => {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=profile email`;

  res.redirect(url);
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