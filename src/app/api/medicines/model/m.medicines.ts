import mongoose from "mongoose";

const MedicinesSchema = new mongoose.Schema(
  {
    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a name"],
    },
    status: {
      type: String,
      enum: ["active", "warning", "inactive", "review", "banned"],
      default: "review",
    },
    genericName: {
      type: String,
      unique: true,
      required: [true, "Please provide the generic/chemical name"],
    },
    availableForms: {
      type: [String],
      enum: [
        "tablet",
        "capsule",
        "syrup",
        "injection",
        "cream",
        "ointment",
        "suppository",
        "drop",
        "inhaler",
        "patch",
        "other",
      ],
      required: [true, "Please provide the available forms"],
    },
    requiresPrescription: {
      type: Boolean,
      default: false,
    },
    description: {
      type: [
        {
          language: {
            type: String,
            enum: ["english", "bangla"],
            required: [true, "Please provide the description language"],
          },
          indications: {
            type: String,
            required: [true, "Please provide the indications"],
          },
          precautionsAndWarnings: {
            type: String,
            required: [true, "Please provide the precautions and warnings"],
          },
          useInSpecialPopulations: {
            type: [
              {
                title: String,
                description: String,
              },
            ],
            required: [true, "Please provide the use in special populations"],
          },
          dosage: {
            type: String,
            required: [true, "Please provide the dosage"],
          },
          overdoseEffects: {
            type: String,
            required: [true, "Please provide the overdose effects"],
          },
          sideEffects: {
            type: String,
            required: [true, "Please provide the side effects"],
          },
          storageConditions: {
            type: String,
            required: [true, "Please provide the storage conditions"],
          },
          chemicalStructure: {
            type: String,
            required: [true, "Please provide the chemical structure"],
          },
        },
      ],
      required: [true, "Please provide a description"],
    },
    QNA: {
      type: [
        {
          question: {
            type: String,
            required: [true, "Each entry must have a question"],
            trim: true,
          },
          answer: {
            type: String,
            required: [true, "Each entry must have an answer"],
            trim: true,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      required: false, // The array itself is not mandatory for saving a document
      default: [], // Initializes as an empty array if no data is provided
    },
  },
  { timestamps: true },
);

type MedicinesSchemaType = mongoose.InferSchemaType<typeof MedicinesSchema>;

// Check if model exists before compiling
const medicinesModel =
  mongoose.models.Medicine || mongoose.model("Medicine", MedicinesSchema);

export const medicinesDb = {
  async create(data) {
    try {
      const dbRes: MedicinesSchemaType = await medicinesModel.create(data);
      return dbRes;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  async findById(id) {
    try {
      const dbRes: MedicinesSchemaType = await medicinesModel.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(id) },
        },
        {
          $lookup: {
            from: "news", // The actual name of the collection in MongoDB
            localField: "_id", // Field from the Medicine collection
            foreignField: "medicinesRef", // Field from the News collection
            as: "news", // The name of the resulting array field
          },
        },
        {
          $addFields: {
            newsCount: { $size: "$news" },
          },
        },
      ]);

      return dbRes;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  async find(data = {}) {
    try {
      const dbRes: MedicinesSchemaType[] = await medicinesModel.find(data);
      return dbRes;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  async updateOne(id, data) {
    try {
      const dbRes: MedicinesSchemaType = await medicinesModel.findByIdAndUpdate(
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
};
