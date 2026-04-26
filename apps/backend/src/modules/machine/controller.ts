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


export const getAllMachines = async (
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
        isOnline : true,
        inUse : false,
      },
    });

    if (machine.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No machines found",
        machine: [],
      });
    }


    if(!machine){
      return res.status(500).json({ success: false, message: "Failed to retrieve machines" });
    }else{
      return res.status(200).json({ success: true, message: "Machines retrieved successfully", machine });
    }
  } catch (err) {
    next(err);
  }
};


export const startSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const {id} = req.params;
  if(!id){
    return res.status(400).json({ success: false, message: "Machine ID is required" });
  }
  try {
    const checkMachine = await prisma?.hostMachine.findUnique({
      where: {
        id
      },
    });
    if(!checkMachine){
      return res.status(404).json({ success: false, message: "Machine not found" });
    }
    if(!req.user?.id){
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if(checkMachine.inUse){
      return res.status(400).json({ success: false, message: "Machine is already in use" });
    }

    const machine = await prisma?.hostMachine.update({
      where: {
        id
      },
      data: {
        inUse: true,
      }
    });

    const session = await prisma?.session.create({
      data: {
        userId: req.user?.id,
        machineId: id,
        pricePerHour: machine.pricePerHour,
        startTime: new Date(),
        status:"ACTIVE",
      }
    });


    if(!session){
      return res.status(500).json({ success: false, message: "Failed to assign machine" });
    }else{
      return res.status(200).json({ success: true, message: "Machine assigned successfully", session });
    }
  } catch (err) {
    next(err);
  }
};

export const getSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {

    if(!req.user?.id){
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const session = await prisma?.session.findMany({
      where: {
        userId: req.user?.id,
        status:"ACTIVE",
      },
      include: {
        machine: true,
      },
    });


    if(!session){
      return res.status(500).json({ success: false, message: "Failed to retrieve session" });
    }else{
      return res.status(200).json({ success: true, message: "Session retrieved successfully", session });
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
        id: req.params.id,
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