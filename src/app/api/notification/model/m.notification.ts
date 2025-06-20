import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a name"],
    },
    status: {
      type: String,
      enum: ["unSeen", "seen", "read"],
      default: "unSeen",
      required: [true, "Please provide a status"],
    },
    title: {
      type: String,
      required: [true, "Please provide a title"],
    },
    description: {
      type: String,
      required: [true, "Please provide an description"],
    },
    goto: String,
  },
  { timestamps: true }
);

type type = mongoose.InferSchemaType<typeof notificationSchema>;

// Check if model exists before compiling
const notificationModel =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);

export const notificationDb = {
  async create(data) {
    try {
      const dbRes: type = await notificationModel.create(data);
      return dbRes;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  async findById(id) {
    try {
      const dbRes: type = await notificationModel.findById(id);
      return dbRes;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  async find(data = {}) {
    try {
      const dbRes: type[] = await notificationModel.find(data);
      return dbRes;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  async markAsSeen(userRef) {
    try {
      const dbRes: type[] = await notificationModel.updateMany(
        { userRef, status: "unSeen" },
        { $set: { status: "seen" } }
      );
      return dbRes;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  async updateOne(id, data) {
    try {
      const dbRes: type = await notificationModel.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      });
      return dbRes;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
