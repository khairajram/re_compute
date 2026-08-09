import { prisma } from "@repo/db/client";
import { userSockets } from "../state/user.js";
import { hostSockets } from "../state/hosts.js";
import { exec } from "child_process";

export function startDemoLifecycleManager() {
  console.log("⏰ Demo Machine Lifecycle Manager started.");
  
  setInterval(async () => {
    try {
      const activeDemoSessions = await prisma.session.findMany({
        where: {
          status: "ACTIVE",
          machine: {
            isDemo: true
          }
        },
        include: {
          machine: true
        }
      });
      
      const now = new Date();
      
      for (const session of activeDemoSessions) {
        const startTime = new Date(session.startTime);
        const lastActiveAt = new Date(session.lastActiveAt);
        
        const elapsedMinutes = (now.getTime() - startTime.getTime()) / (1000 * 60);
        const inactiveMinutes = (now.getTime() - lastActiveAt.getTime()) / (1000 * 60);
        
        let shouldTerminate = false;
        let reason = "";
        
        if (elapsedMinutes >= 20) {
          shouldTerminate = true;
          reason = "duration";
        } else if (inactiveMinutes >= 5) {
          shouldTerminate = true;
          reason = "inactivity";
        }
        
        if (shouldTerminate) {
          console.log(`⏳ Terminating demo session ${session.id} for machine ${session.machine.name} due to ${reason}.`);
          
          // 1. Update Database Status
          await prisma.session.update({
            where: { id: session.id },
            data: {
              status: "COMPLETED",
              endTime: new Date()
            }
          });
          
          await prisma.hostMachine.update({
            where: { id: session.machineId },
            data: { inUse: false }
          });
          
          // 2. Notify and Close User Sockets
          const matchingUsers = userSockets.filter((u) => u.machineId === session.machineId);
          matchingUsers.forEach((user) => {
            try {
              user.socket.send(JSON.stringify({
                type: "DEMO_TIMEOUT",
                reason: reason,
                message: reason === "duration" 
                  ? "Your 20-minute demo session has ended. Thank you for exploring!" 
                  : "Your demo session has been closed due to 5 minutes of inactivity."
              }));
              user.socket.close();
            } catch (err) {
              console.error("Failed to notify user socket on timeout:", err);
            }
          });
          
          // 3. Close Host Socket
          const hostIndex = hostSockets.findIndex((h) => h.machineId === session.machineId);
          const hostSocketObj = hostSockets[hostIndex];
          if (hostSocketObj) {
            try {
              hostSocketObj.socket.close();
              hostSockets.splice(hostIndex, 1);
            } catch (err) {
              console.error("Failed to close host socket on timeout:", err);
            }
          }
          
          // 4. Destroy the Docker Container on the EC2 host
          const containerName = `codeflow-demo-${session.machineId}`;
          console.log(`🐳 Force destroying container: ${containerName}`);
          exec(`sudo docker rm -f ${containerName}`, (err, stdout, stderr) => {
            if (err) {
              console.error(`❌ Failed to destroy container ${containerName}:`, err, stderr);
            } else {
              console.log(`✅ Container ${containerName} destroyed successfully.`);
            }
          });
        }
      }
    } catch (e) {
      console.error("Error in Demo Lifecycle Manager loop:", e);
    }
  }, 15000); // Check every 15 seconds
}
