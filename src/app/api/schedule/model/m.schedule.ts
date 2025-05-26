import mongoose from "mongoose";

const doctorScheduleSchema = new mongoose.Schema(
  {
    ref: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Please provide a name"],
      ref: "User",
      unique: true,
    },
    knownAs: {
      type: String,
      required: [true, "Please provide a name"],
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
      maxlength: [300, "Description cannot be more than 300 characters"],
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
    address: {
      type: String,
      required: [true, "Please provide an address"],
    },
    specialist: {
      type: [String],
      enum: [
        "Allergy and Immunology",
        "Anesthesiology",
        "Cardiology",
        "Cardiothoracic Surgery",
        "Dermatology",
        "Emergency Medicine",
        "Endocrinology",
        "Family Medicine",
        "Gastroenterology",
        "General Surgery",
        "Geriatrics",
        "Hematology",
        "Infectious Disease",
        "Internal Medicine",
        "Nephrology",
        "Neurology",
        "Neurosurgery",
        "Obstetrics and Gynecology",
        "Oncology",
        "Ophthalmology",
        "Orthopedic Surgery",
        "Otolaryngology (ENT)",
        "Palliative Care",
        "Pathology",
        "Pediatrics",
        "Physical Medicine and Rehabilitation",
        "Plastic Surgery",
        "Psychiatry",
        "Pulmonology",
        "Radiology",
        "Rheumatology",
        "Sleep Medicine",
        "Sports Medicine",
        "Thoracic Surgery",
        "Urology",
        "Vascular Surgery",
      ],
      required: [true, "Please provide an username"],
    },
    from: {
      type: Number,
      enum: [0, 1, 2, 3, 4, 5, 6],
      required: [true, "Please provide a from"],
    },
    to: {
      type: Number,
      enum: [0, 1, 2, 3, 4, 5, 6],
      required: [true, "Please provide a to"],
    },
    startAt: {
      type: String,
      required: [true, "Please provide a startAt"],
    },
    duration: {
      type: Number,
      min: [1, "Duration must be at least 1 hour"],
      max: [12, "Duration cannot exceed 12 hours"],
      required: [true, "Please provide a duration"],
    },
    willSeeFor: {
      type: Number,
      enum: [5, 10, 15, 30, 45, 60],
      required: [true, "Please provide a willSeeFor"],
    },
    chargeFee: {
      type: Number,
      required: [true, "Please provide a chargeFee"],
      min: [0, "Charge fee must be at least 0"],
      default: 0,
    },
  },
  { timestamps: true }
);

// Check if model exists before compiling
const doctorScheduleModel =
  mongoose.models.DoctorSchedule ||
  mongoose.model("DoctorSchedule", doctorScheduleSchema);

export const scheduleDb = {
  async create(Data) {
    try {
      Data.chargeFee = parseFloat(Data.chargeFee || 0);
      const data = await doctorScheduleModel.create(Data);
      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  async findById(id) {
    try {
      const data = await doctorScheduleModel.findById(id).populate("ref");
      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  async getOne(getBy) {
    try {
      const data = await doctorScheduleModel.findOne(getBy).populate("ref");
      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  async doctorSearch(value) {
    try {
      const data = await doctorScheduleModel
        .find({
          $or: [
            { specialist: { $regex: value, $options: "i" } },
            { knownAs: { $regex: value, $options: "i" } },
            { email: { $regex: value, $options: "i" } },
            { phone: { $regex: value, $options: "i" } },
          ],
        })
        .populate({
          path: "ref",
          match: { status: "active", role: "doctor" },
        })
        .exec();
      const filteredData = data.filter((doc) => doc.ref !== null);
      return filteredData;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  async getAll() {
    try {
      const data = await doctorScheduleModel
        .find({})
        .populate({
          path: "ref",
          match: { status: "active", role: "doctor" },
        })
        .exec();
      const filteredData = data.filter((doc) => doc.ref !== null);
      return filteredData;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  async updateById(id, Data) {
    try {
      const data = await doctorScheduleModel.findByIdAndUpdate(id, Data, {
        new: true,
        runValidators: true,
      });
      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  async updateOne(find, Data) {
    try {
      const data = await doctorScheduleModel.findOneAndUpdate(find, Data, {
        new: true,
        runValidators: true,
      });
      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
