import { prisma } from "@repo/db/client"


async function change() {
    const res = await prisma.hostMachine.update ({
        where : {
            id : "0d9f94ed-5dc9-47f5-b3bf-379d89fca889"
        },
        data: {
            isOnline : false,
        }
    })
}

change()