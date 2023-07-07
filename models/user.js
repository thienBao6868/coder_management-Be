const mongoose = require("mongoose");
// create schema User
const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ["employee", "manager"],
      default: "employee",
      required: true,
    },
  },
  { timestamps: true }
);
// Create module User
const Users = mongoose.model("User", userSchema);
// exports module
module.exports = Users;
