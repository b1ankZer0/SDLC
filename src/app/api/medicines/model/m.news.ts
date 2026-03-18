import mongoose from "mongoose";

const NewsSchema = new mongoose.Schema(
  {
    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a name"],
    },
    medicinesRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      required: [true, "Please provide a medicines reference"],
    },
    status: {
      type: String,
      enum: ["true", "checking", "false"],
      default: "checking",
    },
    newsType: {
      type: String,
      enum: ["posative", "negative", "neutral"],
      default: "checking",
    },
    news: {
      type: String,
      default: "active",
    },
    references: {
      type: String,
      required: [true, "Please provide at least 1 reference"],
    },
  },
  { timestamps: true },
);

type NewsSchematype = mongoose.InferSchemaType<typeof NewsSchema>;

// Check if model exists before compiling
const newsModel = mongoose.models.News || mongoose.model("News", NewsSchema);

export const newsDb = {
  async create(data) {
    try {
      const dbRes: NewsSchematype = await newsModel.create(data);
      return dbRes;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  async findById(id) {
    try {
      const dbRes: NewsSchematype = await newsModel.findById(id);
      return dbRes;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  async find(data = {}) {
    try {
      const dbRes: NewsSchematype[] = await newsModel.find(data);
      return dbRes;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  async updateOne(id, data) {
    try {
      const dbRes: NewsSchematype = await newsModel.findByIdAndUpdate(
        id,
        data,
        {
          new: true,
          runValidators: true,
        },
      );
      return dbRes;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  async deleteOne(id, data) {
    try {
      const dbRes: NewsSchematype = await newsModel.findByIdAndDelete(id);
      return dbRes;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
