import { getGoogleUser } from "./providers/google.provider";

export const googleLogin = async (accessToken: string) => {
  const googleUser = await getGoogleUser(accessToken);

  // Example:
  const { email, name, id } = googleUser;

  // 1. Check if user exists
  let user = await findUserByEmail(email);

  // 2. If not → create user
  if (!user) {
    user = await createUser({
      email,
      name,
      googleId: id,
    });
  }

  // 3. Generate JWT
  const token = generateJWT(user.id);

  return { user, token };
};