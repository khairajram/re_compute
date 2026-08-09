import { NextFunction,Request,Response } from "express";
import { AuthRequest } from "../../core/middleware/auth.js";
import { exec } from "child_process";
import { prisma } from "@repo/db/client";

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

    // Try finding online, available, non-demo machines first
    let machines = await prisma?.hostMachine.findMany({
      where: {
        isOnline: true,
        inUse: false,
        isDemo: false,
      },
    }) || [];

    // Fallback: If no real host machines are online, fetch available demo machines
    if (machines.length === 0) {
      machines = await prisma?.hostMachine.findMany({
        where: {
          isDemo: true,
          inUse: false,
        },
      }) || [];
    }

    return res.status(200).json({ 
      success: true, 
      message: "Machines retrieved successfully", 
      machine: machines 
    });
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
        id: id as string
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

    const machine = await prisma.hostMachine.update({
      where: {
        id: id as string
      },
      data: {
        inUse: true,
      }
    });

    // If it's a demo machine, spawn the docker container dynamically on the EC2 host
    if (machine.isDemo) {
      const containerName = `codeflow-demo-${machine.id}`;
      console.log(`🐳 Starting demo container: ${containerName}`);
      exec(`docker rm -f ${containerName} 2>/dev/null; docker run -d --name ${containerName} --network host -e WS_SERVER_URL=ws://localhost:8080 -e MACHINE_ID=${machine.id} host-agent`, (err, stdout, stderr) => {
        if (err) {
          console.error(`❌ Failed to start demo container ${containerName}:`, err, stderr);
        } else {
          console.log(`✅ Demo container ${containerName} started:`, stdout.trim());
        }
      });
    }

    const session = await prisma.session.create({
      data: {
        userId: req.user?.id,
        machineId: id as string,
        pricePerHour: machine?.pricePerHour || 0,
        startTime: new Date(),
        lastActiveAt: new Date(),
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
        id: req.params.id as string,
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

export const releaseSession = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const {id} = req.params;
  if(!id){
    return res.status(400).json({ success: false, message: "Machine ID is required" });
  }
  try {
    if(!req.user?.id){
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const session = await prisma?.session.findFirst({
      where: {
        machineId: id as string,
        userId: req.user.id,
        status: "ACTIVE"
      }
    });

    if(!session){
      return res.status(404).json({ success: false, message: "Active session not found" });
    }

    const updatedSession = await prisma.session.update({
      where: {
        id: session.id
      },
      data: {
        status: "COMPLETED",
        endTime: new Date(),
      }
    });

    const machine = await prisma.hostMachine.update({
      where: {
        id: id as string
      },
      data: {
        inUse: false,
      }
    });

    // If it's a demo machine, destroy the container dynamically to keep it clean
    if (machine.isDemo) {
      const containerName = `codeflow-demo-${machine.id}`;
      console.log(`🐳 Destroying demo container: ${containerName}`);
      exec(`docker rm -f ${containerName}`, (err, stdout, stderr) => {
        if (err) {
          console.error(`❌ Failed to destroy demo container ${containerName}:`, err, stderr);
        } else {
          console.log(`✅ Demo container ${containerName} destroyed successfully.`);
        }
      });
    }

    if(!machine || !updatedSession){
      return res.status(500).json({ success: false, message: "Failed to release machine" });
    }else{
      return res.status(200).json({ success: true, message: "Machine released successfully", session: updatedSession, machine });
    }
  } catch (err) {
    next(err);
  }
};