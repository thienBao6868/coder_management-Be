const mongoose = require("mongoose");
// create schema
const taskSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "working", "review", "done", "archive"],
      default:"pending",
      required: true,
    },
    assignee: { type: mongoose.SchemaTypes.ObjectId, ref: "User"},
    isDeleted: { type: Boolean, default: false, required: true },
  },
  { timestamps: true }
);
const Tasks = mongoose.model("Task", taskSchema);
module.exports = Tasks;
