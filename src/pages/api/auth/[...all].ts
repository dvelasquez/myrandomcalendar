import type { APIRoute } from "astro"; 
import { auth } from "../../../features/auth/lib/better-auth";

export const ALL: APIRoute = async (ctx) => {
  return auth.handler(ctx.request);
};
