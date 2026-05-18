import httpContext from "express-http-context";
import { JwtUserPayload } from "@/modules/auth/utils/jwt";

const USER_KEY = "user";

export const setContextUser = (user: JwtUserPayload) =>
  httpContext.set(USER_KEY, user);

export const getContextUser = (): JwtUserPayload | undefined =>
  httpContext.get(USER_KEY);

export const requireContextUser = (): JwtUserPayload => {
  const user = getContextUser();
  if (user === undefined) {
    throw new Error("Missing authenticated user in request context");
  }
  return user;
};
