import { Hono } from "hono";
import { handle } from "hono/vercel";

export const runtime = "nodejs"; // "edge";

const app = new Hono().basePath("/api");

import userRoute from "../user/user";
app.route("/user", userRoute);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
