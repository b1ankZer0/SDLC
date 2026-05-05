import { Hono } from "hono";
import { notificationDb } from "./model/m.notification";
import {
  authMiddleware,
  res,
  fileUploadHandler,
  deleteFile,
  myError,
} from "../func";

const app = new Hono();

app.get("/all-notification", authMiddleware(true), async (c) => {
  try {
    const dbRes = await notificationDb.find();
    return res.ok(c, dbRes, "fetched successfully");
  } catch (error) {
    myError(c, error);
  }
});

app.get("/unSeen-notification", authMiddleware(true), async (c) => {
  try {
    const dbRes = await notificationDb.find({ status: "unSeen" });
    return res.ok(c, dbRes, "fetched successfully");
  } catch (error) {
    myError(c, error);
  }
});

app.get("/markAsSeen-notification", authMiddleware(true), async (c) => {
  try {
    const dbRes = await notificationDb.markAsSeen(c.get("user")._id);
    return res.ok(c, dbRes, "notification updated  successfully");
  } catch (error) {
    myError(c, error);
  }
});

app.get("/:id", authMiddleware(true), async (c) => {
  try {
    const id = c.req.param("id");
    const dbRes = await notificationDb.updateOne(id, { status: "seen" });
    if (!dbRes) {
      return res.notFound(c, "notification not found");
    }
    return res.ok(c, dbRes, "notification fetched successfully");
  } catch (error) {
    myError(c, error);
  }
});

export default app;
