import { googleAuth, googleCallback,authme, simpleLogin, simpleSignup } from "./auth.controller.js";
import { Router } from "express";

const router : Router = Router();


router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);



router.post("/login", simpleLogin);


router.post("/signup", simpleSignup);

router.get("/auth/me",authme);

export default router;