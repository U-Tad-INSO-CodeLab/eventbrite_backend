import { body } from "validate-express-req-body";

export const validateMessage = body([
  { key: "message", type: "string", required: true, min: 1 },
]);
