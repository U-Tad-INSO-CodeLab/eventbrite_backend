import { body } from "validate-express-req-body";

export const validateLogin = body([
  {
    key: "username",
    type: "string",
    required: true,
  },
  {
    key: "password",
    type: "string",
    required: true,
  },
]);
