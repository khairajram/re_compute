import { NextFunction,Request,Response } from "express";
import { AuthRequest } from "../../core/middleware/auth.js";

export const createMachine = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const body = req.body;
    const { name, cpu, gpu, ram, storage, pricePerHour } = body;

    if(!name || !cpu || !gpu || !ram || !storage || !pricePerHour){
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if(!req.user?.id){
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const machine = await prisma?.hostMachine.create({
      data: {
        name,
        cpu,
        gpu,
        ram,
        storage,
        pricePerHour,
        ownerId: req.user?.id,
      },
    });

    if(!machine){
      return res.status(500).json({ success: false, message: "Failed to create machine" });     
    }else{
      return res.status(201).json({ success: true, message: "Machine created successfully", machine });
    }
  } catch (err) {
    next(err);
  }
};




export const getMachine = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {

    if(!req.user?.id){
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const machine = await prisma?.hostMachine.findMany({
      where: {
        ownerId: req.user?.id,
      },
    });


    if(!machine){
      return res.status(500).json({ success: false, message: "Failed to retrieve machines" });
    }else{
      return res.status(200).json({ success: true, message: "Machines retrieved successfully", machine });
    }
  } catch (err) {
    next(err);
  }
};


export const getMachinebyId = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {

    if(!req.user?.id){
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const machine = await prisma?.hostMachine.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });


    if(!machine){
      return res.status(500).json({ success: false, message: "Failed to retrieve machine" });
    }else{
      return res.status(200).json({ success: true, message: "Machine retrieved successfully", machine });
    }
  } catch (err) {
    next(err);
  }
};