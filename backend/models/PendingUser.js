import mongoose from "mongoose";

const pendingUserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now, expires: 86400 } // 1 día
}, { collection: "pending_users" });

export default mongoose.model("PendingUser", pendingUserSchema);
