import jwt from "jsonwebtoken";
import { env } from "@/core/config/env";
import { UserType } from "@/core/prisma/generated/enums";

export interface JwtUserPayload {
  id: number;
  username: string;
  user_type: UserType;
  name: string;
  surname: string;
  email: string;
}

export const signToken = (payload: JwtUserPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): JwtUserPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JwtUserPayload;
};
