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

const roleReqSchema = new mongoose.Schema(
  {
    ref: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    role: {
      type: String,
      enum: ["doctor"],
      default: "user",
    },
    givenDoc: [
      {
        type: String,
      },
    ],
    message: {
      type: String,
      default: "Not provided",
    },
    reason: {
      type: String,
      default: "Not provided",
    },
  },
  { timestamps: true }
);

// Check if model exists before compiling
const roleReqModel =
  mongoose.models.roleReq || mongoose.model("roleReq", roleReqSchema);

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

export const roleReqDb = {
  async create(roleReqData: {}) {
    try {
      const roleReq = await roleReqModel.create(roleReqData);
      return roleReq;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  async findById(id) {
    try {
      const roleReq = await roleReqModel.findById(id);
      return roleReq;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  async getAllRoleReq() {
    try {
      const roleReq = await roleReqModel.find({}).populate("ref");
      return roleReq;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  async updateRoleReq(id, roleReqData) {
    try {
      const roleReq = await roleReqModel.findByIdAndUpdate(id, roleReqData, {
        new: true,
        runValidators: true,
      });
      return roleReq;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
