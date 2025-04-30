import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  points: { type: Number, default: 0 },
  qrCode: { type: String, required: true, unique: true }
}, { collection: "usuarios" });

export default mongoose.model("User", userSchema);
