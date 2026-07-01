
const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    completed: {
      type: Boolean,
      default: false,
    },

    // Due Date
    dueDate: {
      type: Date,
      default: null,
    },

    // Priority
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    // Category
    category: {
      type: String,
      enum: ["Study", "Work", "Personal"],
      default: "Personal",
    },

    // Kis user ka task hai
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Task", TaskSchema);



