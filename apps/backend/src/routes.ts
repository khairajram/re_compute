import { Router } from "express";
import { googleAuth } from "./modules/auth/auth.controller.js";
import authRoutes from "./modules/auth/auth.routes.js";

const router : Router = Router();

router.use("/",authRoutes);


export default router;