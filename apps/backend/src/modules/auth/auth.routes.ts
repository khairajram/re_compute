import { googleAuth, googleCallback, simpleLogin, simpleSignup } from "./auth.controller.js";
import { Router } from "express";

const router : Router = Router();


router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);
router.get("/login", simpleLogin);
router.post("/login", simpleLogin);

router.get("/hello", (req, res) => {
  res.json({ message: "Hello World" });
});
router.post("/signup", simpleSignup);

export default router;