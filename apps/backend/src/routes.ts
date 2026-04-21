import { Router } from "express";
import { googleAuth } from "./modules/auth/auth.controller.js";
import authRoutes from "./modules/auth/auth.routes.js";
import machineRoutes from "./modules/machine/routes.js";

const router : Router = Router();

router.use("/",authRoutes);
router.use("/machines", machineRoutes);


export default router;