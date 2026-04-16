import {prisma} from "@repo/db";

function main(){
    const res = prisma.user.findMany();
    console.log(res);   
}

main()