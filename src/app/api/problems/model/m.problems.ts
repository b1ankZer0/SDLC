import mongoose from "mongoose";

const problemsSchema = new mongoose.Schema(
  {
    ref: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a user"],
    },
    givenDoc: {
      type: [String],
      required: [true, "Please provide a file"],
    },
    title: {
      type: String,
      required: [true, "Please provide a title"],
      maxlength: [300, "title cannot be more than 300 characters"],
    },
    description: {
      type: String,
      required: [true, "Please provide an username"],
    },
    by: {
      type: String,
      default: "-",
    },
  },
  { timestamps: true }
);

// Check if model exists before compiling
const problemsModel =
  mongoose.models.Problems || mongoose.model("Problems", problemsSchema);

const prescriptionsSchema = new mongoose.Schema(
  {
    ref: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problems",
      required: [true, "Please provide a Problems"],
    },
    givenDoc: {
      type: [String],
      required: [true, "Please provide a file"],
    },
    title: {
      type: String,
      required: [true, "Please provide a title"],
      maxlength: [300, "title cannot be more than 300 characters"],
    },
    description: {
      type: String,
      required: [true, "Please provide an username"],
    },
    medication: {
      type: [
        {
          name: {
            type: String,
            required: [true, "Please provide a name"],
          },
          dosage: {
            type: String,
            required: [true, "Please provide a dosage"],
          },
          frequency: {
            type: String,
            required: [true, "Please provide a frequency"],
          },
        },
      ],
    },
    doctorAdded: {
      type: Boolean,
      default: false,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a user"],
    },
    by: {
      type: String,
      default: "-",
    },
  },
  { timestamps: true }
);

// Check if model exists before compiling
const prescriptionsModel =
  mongoose.models.Prescriptions ||
  mongoose.model("Prescriptions", prescriptionsSchema);

export const prescriptionsDb = {
  async create(userData) {
    try {
      const user = await prescriptionsModel.create(userData);
      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  async findById(id) {
    try {
      const user = await prescriptionsModel.findById(id);
      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  async getLoginUser(getBy) {
    try {
      const user = await prescriptionsModel.findOne(getBy);
      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  async getAll(x) {
    try {
      const users = await prescriptionsModel.find(x);
      return users;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  async update(id, Data) {
    try {
      const user = await prescriptionsModel.findByIdAndUpdate(id, Data, {
        new: true,
        runValidators: true,
      });
      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

export const problemsDb = {
  async create(userData) {
    try {
      const user = await problemsModel.create(userData);
      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  async findById(id) {
    try {
      const user = await problemsModel.findById(id);
      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  async findOne(getBy) {
    try {
      const user = await problemsModel.findOne(getBy);
      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  async getLoginUser(getBy) {
    try {
      const user = await problemsModel.findOne(getBy);
      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  async getAll() {
    try {
      const users = await problemsModel.find({});
      return users;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  async update(id, Data) {
    try {
      const user = await problemsModel.findByIdAndUpdate(id, Data, {
        new: true,
        runValidators: true,
      });
      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
