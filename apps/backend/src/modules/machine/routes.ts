import { Router } from "express";
import { createMachine, getMachine } from "./controller.js";
import { protect } from "../../core/middleware/auth.js";

const router : Router = Router();




router.post("/create",protect, createMachine);

router.get("/get",protect, getMachine);


// router.post("/signup", simpleSignup);

// router.get("/auth/me",authme);

export default router;