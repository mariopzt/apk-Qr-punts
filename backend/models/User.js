import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String },
  password: { type: String, required: true },
  points: { type: Number, default: 0 },
  totalPoints: { type: Number, default: 0 },
  qrCode: { type: String, required: true, unique: true },
  tipo: { type: String, required: true, default: "usuario" }
}, { collection: "usuarios" });

export default mongoose.model("User", userSchema);
