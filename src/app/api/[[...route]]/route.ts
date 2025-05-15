import { Hono } from "hono";
import { handle } from "hono/vercel";
import { createJwt, authMiddleware } from "../func";

export const runtime = "nodejs"; // "edge";

const app = new Hono().basePath("/api");

// app.get("/hello", authMiddleware(true, ["sudo"]), (c) => {
//   createJwt(c, { username: "test" });

//   return c.json({
//     message: "Hello Next.js!",
//   });
// });

import userRoute from "../user/user";
app.route("/user", userRoute);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
