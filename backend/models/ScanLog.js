import mongoose from "mongoose";

const scanLogSchema = new mongoose.Schema({
  // Usuario escaneado
  userQrCode: { 
    type: String, 
    required: true 
  },
  username: { 
    type: String, 
    required: true 
  },
  // Administrador que escaneó (si aplica)
  adminQrCode: { 
    type: String 
  },
  adminUsername: { 
    type: String 
  },
  // Tipo de acción: "suma" o "resta"
  action: {
    type: String,
    enum: ["suma", "resta"],
    default: "suma"
  },
  // Cantidad de puntos modificados
  points: {
    type: Number,
    default: 1
  },
  // Fecha y hora del escaneo
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
}, { collection: "scan_logs" });

export default mongoose.model("ScanLog", scanLogSchema);
