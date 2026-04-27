import { prisma } from './src/index.js';

async function main() {
  const adminUser = await prisma.user.findFirst();
  if (!adminUser) {
    console.log("No user found, please sign up in the frontend first to create an owner.");
    return;
  }

  const machine = await prisma.hostMachine.create({
    data: {
      name: "Test Host Node",
      cpu: 8,
      gpu: 1,
      ram: 32,
      storage: 1000,
      pricePerHour: 1.50,
      ownerId: adminUser.id,
      isOnline: false,
    }
  });

  console.log("MACHINE_ID=" + machine.id);
}

main().catch(console.error).finally(() => prisma.$disconnect());
