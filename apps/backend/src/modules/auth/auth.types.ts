import { z } from "zod";

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
}
export interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
}


export const userSignUPSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100)
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[0-9]/, "Must contain a number")
    .regex(/[@$!%*?&]/, "Must contain a special character"),
});