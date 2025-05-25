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
          required: [true, "Please provide a schedule"],
        },
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
        .populate("scheduleRef doctorRef");
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
