import { Router } from "express";
import { createMachine, getAllMachines, getMachine, getMachinebyId, getSession, startSession } from "./controller.js";
import { protect } from "../../core/middleware/auth.js";

const router : Router = Router();




router.post("/create",protect, createMachine);

router.get("/getall",protect, getAllMachines);

router.get("/get",protect, getMachine);

router.get("/get/:id",protect, getMachinebyId);
router.post("/start-session/:id",protect, startSession);
router.get("/get-session",protect, getSession);


export default router;