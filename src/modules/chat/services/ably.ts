import { Rest } from "ably";
import { env } from "@/core/config/env";

export const ablyRest = new Rest(env.ABLY_API_KEY);
