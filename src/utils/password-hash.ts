import * as crypto from "crypto";

const passwordSalt = process.env.PASSWORD_SALT;

export const hashPassword = (password: string) => {
  const hash = crypto.createHmac("sha256", passwordSalt);
  hash.update(password);

  return hash.digest("hex");
};

export const isCorrectPassword = (hashed: string, plain: string) => {
  return hashed === hashPassword(plain);
};
