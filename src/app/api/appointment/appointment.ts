import { Hono } from "hono";
import { appointmentDb } from "./model/m.appointment";
import {
  authMiddleware,
  res,
  fileUploadHandler,
  deleteFile,
  myError,
} from "../func";
import { scheduleDb } from "../schedule/model/m.schedule";

const app = new Hono();

app.get("/all-appointment", authMiddleware(true), async (c) => {
  try {
    const user = c.get("user");
    const users = await appointmentDb.find({ userRef: user._id });
    return res.ok(c, users, "fetched successfully");
  } catch (error) {
    myError(c, error);
  }
});
app.get("/all-reqToDoctor", authMiddleware(true, ["doctor"]), async (c) => {
  try {
    const user = c.get("user");
    const users = await appointmentDb.find({ doctorRef: user._id });
    return res.ok(c, users, "fetched successfully");
  } catch (error) {
    myError(c, error);
  }
});

app.get("/:id", authMiddleware(true), async (c) => {
  try {
    const id = c.req.param("id");
    const user = await appointmentDb.findById(id);
    if (!user || user.userRef.toString() !== c.get("user")._id.toString()) {
      return res.notFound(c, "User not found");
    }
    return res.ok(c, user, "User fetched successfully");
  } catch (error) {
    myError(c, error);
  }
});

app.post("/add-appointment", authMiddleware(false), async (c) => {
  try {
    const body = await c.req.json();
    body.userRef = c.get("user")._id; // Ensure userRef is set to the current user's ID
    const user = await appointmentDb.create(body);
    // const schedule = await scheduleDb.getOne({ ref: body.doctorRef });
    // if (schedule) {
    //   res.badRequest(c, "Doctor is not available at this time");
    // }
    return res.ok(c, user, "appointment created successfully");
  } catch (error) {
    myError(c, error);
  }
});

export default app;
