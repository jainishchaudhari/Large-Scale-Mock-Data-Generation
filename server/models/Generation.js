import mongoose from "mongoose";

const generationSchema = new mongoose.Schema(
  {
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