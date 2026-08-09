import app from "./app.js";
import { config } from "./core/config/config.js";
import { prisma } from "@repo/db/client";

async function seedDemoMachines() {
  try {
    const count = await prisma.hostMachine.count({
      where: { isDemo: true }
    });
    if (count === 0) {
      console.log("🌱 Seeding 4 default demo machines...");
      const demoData = [
        { name: "Demo-US-East-1", cpu: 2, gpu: 0, ram: 4, storage: 20, pricePerHour: 0.0, isOnline: true, isDemo: true },
        { name: "Demo-EU-Central-1", cpu: 2, gpu: 0, ram: 4, storage: 20, pricePerHour: 0.0, isOnline: true, isDemo: true },
        { name: "Demo-AP-South-1", cpu: 4, gpu: 0, ram: 8, storage: 40, pricePerHour: 0.0, isOnline: true, isDemo: true },
        { name: "Demo-GPU-Special", cpu: 8, gpu: 1, ram: 16, storage: 100, pricePerHour: 0.0, isOnline: true, isDemo: true }
      ];
      for (const item of demoData) {
        await prisma.hostMachine.create({ data: item });
      }
      console.log("✅ 4 demo machines seeded successfully.");
    }
  } catch (e) {
    console.error("❌ Failed to seed demo machines:", e);
  }
}

seedDemoMachines().then(() => {
  app.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`);
  });
});