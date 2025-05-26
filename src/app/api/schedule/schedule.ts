// authors.ts
import { Hono } from "hono";
import { authMiddleware, res } from "../func";
import { scheduleDb } from "./model/m.schedule";

const app = new Hono();

app.get("/get", authMiddleware(true), async (c) => {
  return res.ok(
    c,
    await scheduleDb.getOne({ ref: c.get("user")._id }),
    "Schedule fetched successfully"
  );
});

app.get("/getSchedule/:id", authMiddleware(true), async (c) => {
  return res.ok(
    c,
    await scheduleDb.findById(c.req.param("id")),
    "Schedule fetched successfully"
  );
});

app.post("/create", authMiddleware(true, ["doctor"]), async (c) => {
  const body = await c.req.json();

  const data = {
    ref: c.get("user")._id,
    ...body,
  };
  //   console.log(import.meta.url + " : ", data);
  //   return res.badRequest(c, "Schedule already exists");
  return res.ok(
    c,
    await scheduleDb.create(data),
    "Schedule created successfully"
  );
});

app.put("/update", authMiddleware(true), async (c) => {
  const body = await c.req.json();
  const data = {
    ...body,
  };
  return res.ok(
    c,
    await scheduleDb.updateOne({ ref: c.get("user")._id }, data),
    "Schedule updated successfully"
  );
});

app.get("/search/:search", async (c) => {
  const { search } = await c.req.param();
  if (search == "all") {
    return res.ok(c, await scheduleDb.getAll(), "Doctor search successfully");
  }
  return res.ok(
    c,
    await scheduleDb.doctorSearch(search),
    "Doctor search successfully"
  );
});

export default app;
