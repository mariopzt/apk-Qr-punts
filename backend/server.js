import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import mongoose from "mongoose";
dotenv.config();

const app = express();

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Conectado a MongoDB Atlas correctamente");
}).catch((err) => {
  console.error("Error conectando a MongoDB Atlas:", err.message);
});
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const API_BASE = process.env.MONGODB_URI; // Usamos el nombre de variable original para compatibilidad

// Registro local en MongoDB Atlas
import User from "./models/User.js";

app.post("/api/auth/register", async (req, res) => {
  console.log("[REGISTRO] Body recibido:", req.body);
  const { username, password, email } = req.body;
  if (!username || !password || !email) {
    return res.status(400).json({ message: "Todos los campos son obligatorios" });
  }
  try {
    const existe = await User.findOne({ username });
    if (existe) {
      return res.status(409).json({ message: "El usuario ya existe" });
    }
    const qrCode = `${username}_${Date.now()}`;
    const nuevo = new User({ username, password, email, qrCode });
    await nuevo.save();
    console.log("[REGISTRO] Usuario guardado correctamente:", username);
    res.status(201).json({ message: "Usuario agregado" });
  } catch (err) {
    console.log("[REGISTRO] ERROR local:", err);
    res.status(500).json({ message: "Error al registrar usuario", error: err.message });
  }
});

// Login local
app.post("/api/auth/login-local", async (req, res) => {
  console.log("[LOGIN] Body recibido:", req.body);
  const { username, password } = req.body;
  if (!username || !password) {
    console.log("[LOGIN] Faltan campos");
    return res.status(400).json({ message: "Usuario y contraseña requeridos" });
  }
  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.log("[LOGIN] Usuario no encontrado");
      return res.status(404).json({ message: "No se encuentra ese usuario" });
    }
    if (user.password !== password) {
      console.log("[LOGIN] Contraseña incorrecta");
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }
    console.log("[LOGIN] Login correcto para usuario:", username);
    res.json({ message: "Login correcto", user });
  } catch (err) {
    console.log("[LOGIN] ERROR:", err);
    res.status(500).json({ message: "Error en login", error: err.message });
  }
});

// Proxy login
app.post("/api/auth/login", async (req, res) => {
  try {
    const response = await axios.post(`${API_BASE}/api/auth/login`, req.body);
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { message: "Error en login" });
  }
});

// Proxy usuario
app.get("/api/user/me", async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE}/api/user/me`, {
      headers: { Authorization: req.headers["authorization"] }
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { message: "Error obteniendo datos" });
  }
});

app.get("/", (req, res) => {
  res.send("API funcionando como proxy a la API externa");
});

app.listen(PORT, () => {
  console.log(`Servidor proxy corriendo en puerto ${PORT}`);
  console.log(`Conectado a Atlas (API externa)`);
});
