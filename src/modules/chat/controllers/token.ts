import { ablyRest } from "@/modules/chat/services/ably";
import { requireContextUser } from "@/modules/auth/utils/context";
import { Request, Response } from "express";
import status from "http-status";

export const getAblyToken = async (req: Request, res: Response) => {
  const user = requireContextUser();

  const tokenRequest = await ablyRest.auth.createTokenRequest({
    clientId: String(user.id),
  });

  res.status(status.OK).json(tokenRequest);
};
