const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
    },

    originalName: {
      type: String,
      required: true,
    },

    fileType: String,

    fileSize: Number,

    summary: {
      type: String,
      default: "",
    },

    totalPages: {
      type: Number,
      default: null,
    },

    totalChunks: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["uploaded", "processing", "completed", "failed"],
      default: "uploaded",
    },

    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Document", documentSchema);
