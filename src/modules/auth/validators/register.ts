import { body } from "validate-express-req-body";

export const validateRegister = body([
  {
    key: "username",
    type: "string",
    required: true,
    min: 3,
    max: 30,
  },
  {
    key: "email",
    type: "email",
    required: true,
    regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  {
    key: "password",
    type: "string",
    required: true,
    min: 6,
  },
  {
    key: "confirmPassword",
    type: "string",
    required: true,
  },
  {
    key: "name",
    type: "string",
    required: true,
    min: 1,
    max: 50,
  },
  {
    key: "surname",
    type: "string",
    required: true,
    min: 1,
    max: 50,
  },
]);
