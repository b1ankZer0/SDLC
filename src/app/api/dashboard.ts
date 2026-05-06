import { Hono } from "hono";
import { appointmentDb } from "./appointment/model/m.appointment";
import {
  authMiddleware,
  res,
  fileUploadHandler,
  deleteFile,
  myError,
} from "./func";

const app = new Hono();
const module = "dashboardInfo ";

app.get("/dashboardInfo", authMiddleware(true), async (c) => {
  try {
    const id = c.get("user")._id;
    const dbRes = await appointmentDb.dashboardInfo(id);
    return res.ok(c, dbRes, module + "fetched successfully");
  } catch (error) {
    myError(c, error);
  }
});

export default app;
