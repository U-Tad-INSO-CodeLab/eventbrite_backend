import { body } from "validate-express-req-body";

export const validateInitializeConversation = body([
  { key: "event_id", type: "number", required: true },
]);
