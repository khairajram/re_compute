import { prisma } from "@repo/db"; // Assuming your package is named @repo/db

async function main() {
  // You don't need to define the URL here. 
  // The 'prisma' object is already connected.
  const users = await prisma.user.findMany();
  console.log(users);
}

main()