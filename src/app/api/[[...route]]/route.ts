import { Hono } from "hono";
import { handle } from "hono/vercel";

export const runtime = "nodejs"; // "edge";

const app = new Hono().basePath("/api");

import userRoute from "../user/user";
app.route("/user", userRoute);

import problemsRoute from "../problems/problems";
app.route("/problems", problemsRoute);

import scheduleRoute from "../schedule/schedule";
app.route("/schedule", scheduleRoute);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
