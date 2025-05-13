// authors.ts
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { res } from "@/app/api/func";
import { userDb } from "./model/m.user";

const app = new Hono();

app.get("/", (c) => c.json("list authors"));
app.post("/", (c) => c.json("create an author", 201));
app.get("/:id", (c) => c.json(`get ${c.req.param("id")}`));

export default app;
