import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const API_BASE = process.env.MONGODB_URI; // Usamos el nombre de variable original para compatibilidad

// Proxy registro
app.post("/api/auth/register", async (req, res) => {
  try {
    const response = await axios.post(`${API_BASE}/api/auth/register`, req.body);
    res.status(response.status).json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json(err.response?.data || { message: "Error en registro" });
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
