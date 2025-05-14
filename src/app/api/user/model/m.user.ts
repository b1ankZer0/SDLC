import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      maxlength: [60, "Name cannot be more than 60 characters"],
    },
    userName: {
      type: String,
      default: crypto.randomUUID(),
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
    },
    logo: {
      type: String,
      default: "Not provided",
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: [true, "Please provide an gender"],
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Please provide an date Of Birth"],
    },
    phone: {
      type: String,
      // required: [true, "Please provide a phone number"],
      // unique: true,
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
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [6, "Password cannot be less than 6 characters"],
    },
    address: {
      type: String,
      default: "Not provided",
    },
  },
  { timestamps: true }
);

// Check if model exists before compiling
const userModel = mongoose.models.User || mongoose.model("User", UserSchema);

export const userDb = {
  async create(userData) {
    try {
      const user = await userModel.create(userData);
      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  async findById(id) {
    try {
      const user = await userModel.findById(id);
      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  async getLoginUser(getBy) {
    try {
      const user = await userModel.findOne(getBy);
      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  async getAllUsers() {
    try {
      const users = await userModel.find({});
      return users;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  async updateUser(id, userData) {
    try {
      const user = await userModel.findByIdAndUpdate(id, userData, {
        new: true,
        runValidators: true,
      });
      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
