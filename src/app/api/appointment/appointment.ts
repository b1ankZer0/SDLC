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
import { error } from "console";

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
    const users = await appointmentDb.findForDoc({ doctorRef: user._id });
    return res.ok(c, users, "fetched successfully");
  } catch (error) {
    myError(c, error);
  }
});

app.patch("doctor-res/:id", authMiddleware(true, ["doctor"]), async (c) => {
  try {
    const id = c.req.param("id");
    const user = c.get("user");
    const status = c.req.query("status");

    if (!["accept", "reject", "reSchedule"].includes(status)) {
      return res.badRequest(c, "Invalid status provided");
    }

    // Handle rejection
    const appointment = await appointmentDb.updateOne(
      {
        _id: id,
        doctorRef: user._id,
        status: "request",
      },
      { status }
    );
    if (!appointment) {
      return res.notFound(c, "Appointment not found or access denied");
    }
    return res.ok(c, appointment, "Appointment updated successfully");
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
    if (body.userRef == body.doctorRef) {
      return res.badRequest(c, "You cannot book an appointment with yourself");
    }
    const ck = await isValidTime(
      body.doctorRef,
      body.scheduleReqBy[0].schedule
    );
    if (!ck.success) {
      return res.badRequest(c, ck.error || "Invalid appointment time");
    }
    const dbCk = await appointmentDb.findCk(body);
    if (dbCk.error) {
      return res.badRequest(c, dbCk.error);
    }

    const appointment = await appointmentDb.create(body);

    return res.ok(c, appointment, "appointment created successfully");
  } catch (error) {
    myError(c, error);
  }
});

app.patch("/cancel-appointment/:id", authMiddleware(true), async (c) => {
  try {
    const id = c.req.param("id");
    const user = c.get("user");

    // Ensure the appointment belongs to the user
    const appointment = await appointmentDb.updateOne(
      {
        _id: id,
        userRef: user._id,
      },
      { status: "cancel" }
    );
    if (!appointment) {
      return res.notFound(c, "Appointment not found or access denied");
    }

    return res.ok(c, appointment, "Appointment updated successfully");
  } catch (error) {
    myError(c, error);
  }
});

export default app;

const isValidTime = async (doctorRef: string, time: string) => {
  const schedule = await scheduleDb.getOne({ ref: doctorRef });
  if (!schedule) {
    throw new Error("Doctor's schedule not found");
  }

  const date = new Date(time); // ✅ Assume ISO/local time
  const day = date.getDay();
  const hour = date.getHours();
  const minute = date.getMinutes();

  // 1. Day check
  if (day < schedule.from || day > schedule.to) {
    return { error: "Doctor is not available on this day" };
  }

  // 2. Time range check
  const [startHour, startMinute] = schedule.startAt.split(":").map(Number);
  const endHour = startHour + schedule.duration;

  const appointmentTimeInMinutes = hour * 60 + minute;
  const scheduleStartInMinutes = startHour * 60 + startMinute;
  const scheduleEndInMinutes = endHour * 60;

  if (
    appointmentTimeInMinutes < scheduleStartInMinutes ||
    appointmentTimeInMinutes >= scheduleEndInMinutes
  ) {
    return {
      error: "Appointment time is outside of the doctor's working hours",
    };
  }

  // 3. Interval check
  const offset = appointmentTimeInMinutes - scheduleStartInMinutes;
  if (offset % schedule.willSeeFor !== 0) {
    return {
      error:
        "Appointment time does not align with the doctor's schedule interval",
    };
  }

  return { success: true };
};
