import { Hono } from "hono";
import { handle } from "hono/vercel";

export const runtime = "nodejs"; // "edge";

const app = new Hono().basePath("/api");

import userRoute from "../user/user";
app.route("/user", userRoute);

import problemsRoute from "../problems/problems";
app.route("/problems", problemsRoute);

import appointmentRoute from "../appointment/appointment";
app.route("/appointment", appointmentRoute);

import scheduleRoute from "../schedule/schedule";
app.route("/schedule", scheduleRoute);

import medicinesRoute from "../medicines/medicines";
app.route("/medicine", medicinesRoute);

import notificationsRoute from "../notification/notification";
app.route("/notification", notificationsRoute);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
