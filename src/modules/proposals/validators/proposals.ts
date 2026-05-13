import { body, param } from "express-validator";
import { createValidator } from "@/core/middleware/validation";

const sanitize = (v: any) => (v == null || String(v).trim() === "" ? undefined : String(v).trim());

export const validateCreateProposal = createValidator([
  body("conversationId").trim().notEmpty().toInt().isInt({ min: 1 }),
  body("tierName").trim().notEmpty().isLength({ max: 200 }),
  body("tierPrice").trim().notEmpty().matches(/^\d+(\.\d{1,2})?$/).toFloat().isFloat({ min: 0, max: 99_999_999.99 }),
  body("tierBenefits").optional({ values: "falsy" }).trim().isLength({ max: 5000 }).customSanitizer(sanitize),
  body("eventTierId").optional({ values: "falsy" }).toInt().isInt({ min: 1 }),
  body("description").optional({ values: "falsy" }).trim().isLength({ max: 2000 }).customSanitizer(sanitize),
]);

export const validateListProposals = createValidator([
  param("conversationId").trim().notEmpty().toInt().isInt({ min: 1 }),
]);

export const validateProposalAction = createValidator([
  param("id").trim().notEmpty().toInt().isInt({ min: 1 }),
]);

export const validateCounterProposal = createValidator([
  param("id").trim().notEmpty().toInt().isInt({ min: 1 }),
  body("amountUsd").trim().notEmpty().matches(/^\d+(\.\d{1,2})?$/).toFloat().isFloat({ min: 0, max: 99_999_999.99 }),
  body("note").optional({ values: "falsy" }).trim().isLength({ max: 2000 }).customSanitizer(sanitize),
  body("tierName").optional({ values: "falsy" }).trim().isLength({ max: 200 }).customSanitizer(sanitize),
]);
