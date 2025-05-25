import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a name"],
    },
    name: {
      type: String,
      required: [true, "Please provide a name"],
      maxlength: [60, "Name cannot be more than 60 characters"],
    },
    userName: {
      type: String,
      required: [true, "Please provide an username"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
    },
    phone: {
      type: String,
      required: [true, "Please provide a phone number"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [6, "Password cannot be less than 6 characters"],
    },
    status: {
      type: String,
      enum: ["active", "inactive", "banned"],
      default: "active",
    },
    role: {
      type: String,
      enum: ["sudo", "admin", "user", "doctor"],
      default: "user",
    },
    address: {
      type: String,
      default: "Not provided",
    },
  },
  { timestamps: true }
);

type type = mongoose.InferSchemaType<typeof UserSchema>;

// Check if model exists before compiling
const userModel = mongoose.models.User || mongoose.model("User", UserSchema);

export const userDb = {
  async create(data) {
    try {
      const dbRes: type = await userModel.create(data);
      return dbRes;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  async findById(id) {
    try {
      const dbRes: type = await userModel.findById(id);
      return dbRes;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  async find(data = {}) {
    try {
      const dbRes: type[] = await userModel.find(data);
      return dbRes;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  async updateOne(id, data) {
    try {
      const dbRes: type = await userModel.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      });
      return dbRes;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
