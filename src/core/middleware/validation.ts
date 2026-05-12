import { validationResult, type ValidationChain } from "express-validator";
import { NextFunction, RequestHandler } from "express";
import status from "http-status";

export const validateRequest: RequestHandler = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const message = result
      .array()
      .map((e) => (typeof e.msg === "string" ? e.msg : String(e.msg)));
    res.status(status.BAD_REQUEST).json({
      status: status.BAD_REQUEST,
      message,
    });
    return;
  }
  next();
};

export function createValidator(chains: ValidationChain[]): RequestHandler {
  const pipeline: RequestHandler[] = [...chains, validateRequest];
  return (req, res, next) => {
    let i = 0;
    const run: NextFunction = (err) => {
      if (err !== undefined) {
        next(err);
        return;
      }
      if (i >= pipeline.length) {
        next();
        return;
      }
      const mw = pipeline[i++];
      mw(req, res, run);
    };
    run();
  };
}
