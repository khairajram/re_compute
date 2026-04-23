import { googleAuth, googleCallback,authme, simpleLogin, simpleSignup, logout } from "./auth.controller.js";
import { Router } from "express";
import passport from "passport";
import { Request,Response } from "express";
import { config } from "../../core/config/config.js"

const router : Router = Router();


router.get("/auth/google", googleAuth);
router.get("/auth/google/callback", googleCallback);





router.post("/login", simpleLogin);
router.get("/logout", logout);


router.post("/signup", simpleSignup);

router.get("/auth/me",authme);

export default router;