import axios from "axios";
import { config } from "../../../core/config/config.js"

export const getGoogleAccessToken = async (code: string) => {
  const { data } = await axios.post(
    "https://oauth2.googleapis.com/token",
    {
      code,
      client_id: config.GOOGLE_CLIENT_ID,
      client_secret: config.GOOGLE_CLIENT_SECRET,
      redirect_uri: "http://localhost:4000/api/auth/google/callback",
      grant_type: "authorization_code",
    }
  );

  return data.access_token;
};

export const getGoogleUser = async (accessToken: string) => {
  const { data } = await axios.get(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return data;
};