// user.service.ts
import { User } from "./user.schema";

export const userService = {
  createUser: async (data: any) => {
    const existing = await User.findOne({ email: data.email });

    if (existing) {
      throw new AppError("User already exists", 400);
    }

    const user = await User.create(data);
    return user;
  },
};