import { z } from "zod";



export const createMachineSchema = z.object({
  name: z.string().min(2).max(100),
  cpu : z.number().positive(),
  gpu : z.number().positive(),
  ram : z.number().positive(),
  storage : z.number().positive(),
  pricePerHour : z.number().positive()
});