import mongoose from "mongoose";

const generationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    schema: {
      type: Object,
      required: true,
    },

    records: {
      type: Number,
      required: true,
    },

    method: {
      type: String,
      required: true,
      enum: ["Batch", "Streaming"],
    },

    generationTime: {
      type: Number,
      required: true,
    },

    memoryUsed: {
      type: Number,
      required: true,
    },

    data: {
      type: Array,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Generation = mongoose.model(
  "Generation",
  generationSchema
);

export default Generation;