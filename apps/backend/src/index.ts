import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response } from "express";
const PORT = process.env.PORT || 5000;
import { prisma } from "@repo/db";


const app = express();

app.use(express.json());

app.get("/", async (req: Request, res: Response) => {
    const user = await prisma.user.findMany()
  res.json({
    msg: user
  });
});



app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});