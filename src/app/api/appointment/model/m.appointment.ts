import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    scheduleRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DoctorSchedule",
      required: true,
    },
    problemRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },
    problemAccessToDoctor: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["request", "accept", "reSchedule", "reject", "cancel"],
      default: "request",
    },
    scheduleReqBy: [
      {
        reqBy: {
          type: String,
          enum: ["user", "doctor"],
          default: "user",
        },
        schedule: {
          type: String,
          required: [true, "Please provide a date"],
        },
        // date: {
        //   type: String,
        //   required: [true, "Please provide a date"],
        // },
        // time: {
        //   type: String,
        //   required: [true, "Please provide a time"],
        // },
        reason: {
          type: String,
          default: "Not provided",
        },
        reqDate: {
          type: Date,
          default: Date.now,
        },
        acceptedDate: Date,
      },
    ],
  },
  { timestamps: true }
);

type type = mongoose.InferSchemaType<typeof appointmentSchema>;
// Check if model exists before compiling
const appointmentModel =
  mongoose.models.Appointment ||
  mongoose.model("Appointment", appointmentSchema);

export const appointmentDb = {
  async create(data) {
    try {
      const dbRes: type = await appointmentModel.create(data);
      return dbRes;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  async findById(id) {
    try {
      const dbRes: type = await appointmentModel.findById(id);
      return dbRes;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  async find(data = {}) {
    try {
      const dbRes: type[] = await appointmentModel
        .find(data)
        .populate({ path: "doctorRef", select: "_id logo" })
        .populate("scheduleRef")
        .lean()
        .sort({ createdAt: -1 });
      return dbRes;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  async findForDoc(data = {}) {
    try {
      const dbRes: type[] = await appointmentModel
        .find({ ...data, status: { $in: ["request", "accept", "reSchedule"] } })
        .populate("scheduleRef userRef")
        .lean()
        .sort({ createdAt: 1 });
      return dbRes;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  async findCk(data) {
    try {
      const dbRes: type[] = await appointmentModel.findOne({
        userRef: data.userRef,
        scheduleRef: data.scheduleRef,
        status: { $in: ["request", "accept", "reSchedule"] },
      });

      if (dbRes) {
        // throw new Error(
        //   "You already have an appointment request to this doctor."
        // );
        return {
          error: "You already have an appointment request to this doctor.",
        };
      }

      const dbRes2: type[] = await appointmentModel.find({
        scheduleRef: data.scheduleRef,
        status: { $in: ["request", "accept", "reSchedule"] },
        ["scheduleReqBy.schedule"]: data.scheduleReqBy[0].schedule,
      });

      if (dbRes2.length > 0) {
        return { error: "There is already an appointment at this time." };
      }

      return { success: true };
    } catch (error) {
      throw new Error(error.message);
    }
  },
  async findOne(data = {}) {
    try {
      const dbRes: type[] = await appointmentModel
        .findOne(data)
        .populate({ path: "doctorRef", select: "_id logo" })
        .populate("scheduleRef")
        .lean();

      return dbRes;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  async updateOne(id, data) {
    try {
      const dbRes: type = await appointmentModel.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      });
      return dbRes;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

// const appointment_dateSchema = new mongoose.Schema(
//   {
//     ref: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Appointment",
//       required: true,
//     },
//     date: {
//       type: String,
//       required: [true, "Please provide a schedule"],
//     },
//     available_time: [String],
//     acceptedDate: Date,
//   },
//   { timestamps: true }
// );

// type typeDate = mongoose.InferSchemaType<typeof appointment_dateSchema>;
// // Check if model exists before compiling
// const appointment_dateModel =
//   mongoose.models.Appointment_date ||
//   mongoose.model("Appointment_data", appointment_dateSchema);
