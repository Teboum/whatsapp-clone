import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    name: { type: String, require: true },
    phone: { type: String, require: true, unique: true },
    picture: { type: String, require: true, default: "picture" },
    status: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("user", userSchema);
