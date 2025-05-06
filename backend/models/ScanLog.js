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
  // Fecha y hora del escaneo
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
}, { collection: "scan_logs" });

export default mongoose.model("ScanLog", scanLogSchema);
