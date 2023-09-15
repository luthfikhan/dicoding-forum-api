import { token } from "@hapi/jwt";
import * as crypto from "crypto";

export const generateToken = (payload: any) => {
  return {
    accessToken: token.generate({ ...payload, type: "access_token" }, process.env.ACCESS_TOKEN_KEY, {
      ttlSec: Number(process.env.ACCCESS_TOKEN_AGE),
    }),
    refreshToken: token.generate({ ...payload, type: "refresh_token" }, process.env.REFRESH_TOKEN_KEY),
  };
};

export const generateTokenId = (username: string) => {
  const hash = crypto.createHash("md5");
  hash.update(`${username}-${Date.now()}`);

  return hash.digest("hex");
};

export const verifyToken = (tkn: string, tokenType: "refresh_token" | "access_token") => {
  const keys = {
    refresh_token: process.env.REFRESH_TOKEN_KEY,
    access_token: process.env.ACCESS_TOKEN_KEY,
  };

  try {
    const artifacts = token.decode(tkn);
    token.verify(artifacts, keys[tokenType]);

    return artifacts.decoded.payload;
  } catch (error) {
    return null;
  }
};
