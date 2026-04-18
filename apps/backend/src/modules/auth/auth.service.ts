import { getGoogleUser } from "./providers/google.provider";
// import your user model here
// import jwt

export const googleLoginService = async (accessToken: string) => {
  const googleUser = await getGoogleUser(accessToken);

  const { email, name, id } = googleUser;

  // 1. Check if user exists
  let user = await findUserByEmail(email); // implement this

  // 2. Create if not exists
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
