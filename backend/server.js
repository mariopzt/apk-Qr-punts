import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import crypto from "crypto";
import PendingUser from "./models/PendingUser.js";
import ScanLog from "./models/ScanLog.js";
dotenv.config();

const app = express();
import http from 'http';
import { initSocket, notifyPuntoSumado } from './socket.js';

// INICIALIZACIÓN CORRECTA DEL SERVIDOR HTTP Y SOCKET
const server = http.createServer(app);
initSocket(server);

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log("Conectado a MongoDB Atlas correctamente");
}).catch((err) => {
  console.error("Error conectando a MongoDB Atlas:", err.message);
});
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const API_BASE = process.env.MONGODB_URI; // Usamos el nombre de variable original para compatibilidad

// Registro local en MongoDB Atlas
import User from "./models/User.js";

// INICIA EL SERVIDOR HTTP (NO USAR app.listen)
server.listen(PORT, () => {
  console.log("Servidor escuchando en puerto", PORT);
});

app.post("/api/auth/register", async (req, res) => {
  console.log("[REGISTRO] ===== INICIO PROCESO DE REGISTRO =====");
  console.log("[REGISTRO] Body recibido:", req.body);
  const { username, password, email } = req.body;
  if (!username || !password || !email) {
    console.log("[REGISTRO] ERROR: Faltan campos obligatorios");
    return res.status(400).json({ message: "Todos los campos son obligatorios" });
  }
  try {
    // Verifica que no exista ni en users ni en pending (por username o email)
    console.log("[REGISTRO] Verificando si el usuario ya existe en la colección 'usuarios'...");
    
    // Verificar por nombre de usuario
    const existeUsername = await User.findOne({ username });
    if (existeUsername) {
      console.log("[REGISTRO] ERROR: El nombre de usuario ya existe en 'usuarios'");
      return res.status(409).json({ message: "El nombre de usuario ya está en uso" });
    }
    
    // Verificar por email
    const existeEmail = await User.findOne({ email });
    if (existeEmail) {
      console.log("[REGISTRO] ERROR: El email ya está registrado en 'usuarios'");
      return res.status(409).json({ message: "El correo electrónico ya está registrado" });
    }
    
    console.log("[REGISTRO] Verificando si el usuario ya existe en 'pending_users'...");
    
    // Verificar por nombre de usuario en pendientes
    const pendingUsername = await PendingUser.findOne({ username });
    if (pendingUsername) {
      console.log("[REGISTRO] ERROR: Ya hay una confirmación pendiente para este usuario");
      return res.status(409).json({ message: "Ya hay una confirmación pendiente para este nombre de usuario" });
    }
    
    // Verificar por email en pendientes
    const pendingEmail = await PendingUser.findOne({ email });
    if (pendingEmail) {
      console.log("[REGISTRO] ERROR: Ya hay una confirmación pendiente para este email");
      return res.status(409).json({ message: "Ya hay una confirmación pendiente para este correo electrónico" });
    }
    
    console.log("[REGISTRO] Usuario y email no existen, procediendo a crear registro pendiente...");
    // Encriptar contraseña
    console.log("[REGISTRO] Encriptando contraseña...");
    const hashedPassword = await bcrypt.hash(password, 10);
    // Generar token único
    console.log("[REGISTRO] Generando token de confirmación...");
    const token = crypto.randomBytes(32).toString("hex");
    // Guardar en pending
    console.log("[REGISTRO] Guardando usuario en 'pending_users'...");
    const nuevoPendiente = new PendingUser({ username, password: hashedPassword, email, token });
    await nuevoPendiente.save();
    console.log("[REGISTRO] Usuario pendiente guardado correctamente");
    // Configurar transporte nodemailer
    console.log("[REGISTRO] Configurando transporte de email...");
    
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      console.error("[REGISTRO] ERROR: Faltan variables de entorno GMAIL_USER o GMAIL_PASS");
      console.log("[REGISTRO] Eliminando usuario pendiente debido al error...");
      await PendingUser.deleteOne({ username });
      return res.status(500).json({ 
        message: "No está configurado el envío de correos. Contacta con el administrador.",
        error: "Faltan variables de entorno GMAIL_USER o GMAIL_PASS" 
      });
    }
    
    // Crear transporte con configuración segura para Gmail
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      },
      // Configuración adicional para mayor compatibilidad
      tls: {
        rejectUnauthorized: false
      }
    });
    
    const confirmUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/confirmar?token=${token}`;
    
    try {
      console.log("[REGISTRO] Intentando enviar email a:", email);
      
      // Guardar enlace en consola como respaldo
      console.log("[REGISTRO] URL de confirmación (copia de seguridad):", confirmUrl);
      
      // Enviar email con diseño mejorado
      await transporter.sendMail({
        from: `"QR Punts" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: 'Confirma tu registro en QR Punts',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <h2 style="color: #333; text-align: center;">Confirma tu registro</h2>
            <p style="color: #555; font-size: 16px;">Gracias por registrarte en QR Punts. Para activar tu cuenta, haz clic en el siguiente enlace:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmUrl}" style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold;">Confirmar mi cuenta</a>
            </div>
            <p style="color: #555;">O copia y pega este enlace en tu navegador:</p>
            <p style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all;">${confirmUrl}</p>
            <p style="color: #777; font-size: 14px; margin-top: 30px;">Si no solicitaste este registro, puedes ignorar este mensaje.</p>
          </div>
        `
      });
      
      console.log("[REGISTRO] ✅ Email de confirmación enviado correctamente a:", email);
      console.log("[REGISTRO] ===== FIN PROCESO DE REGISTRO (PENDIENTE DE CONFIRMACIÓN) =====");
      res.status(200).json({ message: "Te hemos enviado un email de confirmación. Revisa tu bandeja de entrada." });
    } catch (emailErr) {
      console.error("[REGISTRO] ❌ ERROR enviando email:", emailErr);
      console.log("[REGISTRO] Eliminando usuario pendiente debido al error de email...");
      await PendingUser.deleteOne({ username });
      
      // Mensaje de error más detallado para ayudar en la depuración
      let errorMessage = "No se pudo enviar el email de confirmación.";
      if (emailErr.code === 'EAUTH') {
        errorMessage += " Problema de autenticación con Gmail. Verifica que estés usando una 'Contraseña de aplicación' y no tu contraseña normal.";
      } else if (emailErr.code === 'ESOCKET') {
        errorMessage += " Problema de conexión con el servidor de Gmail.";
      }
      
      res.status(500).json({ 
        message: errorMessage,
        error: emailErr.message
      });
    }
  } catch (err) {
    console.log("[REGISTRO] ❌ ERROR general en el proceso:", err);
    console.log("[REGISTRO] ===== FIN PROCESO DE REGISTRO (CON ERROR) =====");
    res.status(500).json({ message: "Error al registrar usuario", error: err.message });
  }
});

// Confirmación de registro
app.get("/api/auth/confirmar", async (req, res) => {
  console.log("[CONFIRMACIÓN] ===== INICIO PROCESO DE CONFIRMACIÓN =====");
  const { token } = req.query;
  console.log("[CONFIRMACIÓN] Token recibido:", token);
  
  if (!token) {
    console.log("[CONFIRMACIÓN] ERROR: Token faltante");
    return res.status(400).json({ message: "Token faltante" });
  }
  
  try {
    console.log("[CONFIRMACIÓN] Buscando usuario pendiente con el token...");
    const pendiente = await PendingUser.findOne({ token });
    
    if (!pendiente) {
      console.log("[CONFIRMACIÓN] ERROR: Token inválido o expirado, no se encontró usuario pendiente");
      return res.status(404).json({ message: "Token inválido o expirado" });
    }
    
    console.log("[CONFIRMACIÓN] Usuario pendiente encontrado:", pendiente.username);
    
    // Crear usuario definitivo
    console.log("[CONFIRMACIÓN] Creando usuario definitivo en 'usuarios'...");
    const qrCode = `${pendiente.username}_${Date.now()}`;
    const nuevo = new User({
      username: pendiente.username,
      password: pendiente.password,
      email: pendiente.email,
      qrCode,
      totalPoints: 0
    });
    
    await nuevo.save();
    console.log("[CONFIRMACIÓN] ✅ Usuario definitivo creado correctamente");
    
    console.log("[CONFIRMACIÓN] Eliminando usuario pendiente...");
    await PendingUser.deleteOne({ token });
    
    console.log("[CONFIRMACIÓN] ===== FIN PROCESO DE CONFIRMACIÓN (EXITOSO) =====");
    res.status(201).json({ message: "Usuario confirmado y creado correctamente" });
  } catch (err) {
    console.log("[CONFIRMACIÓN] ❌ ERROR al confirmar usuario:", err);
    console.log("[CONFIRMACIÓN] ===== FIN PROCESO DE CONFIRMACIÓN (CON ERROR) =====");
    res.status(500).json({ message: "Error al confirmar usuario", error: err.message });
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
      console.log("[LOGIN] Usuario no encontrado para:", username);
      return res.status(404).json({ message: "No se encuentra ese usuario" });
    }
    const passwordOk = await bcrypt.compare(password, user.password);
    if (!passwordOk) {
      console.log("[LOGIN] Contraseña incorrecta para usuario:", username);
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }
    console.log("[LOGIN] Login correcto para usuario:", username);
    res.json({ message: "Login correcto", user });
  } catch (err) {
    console.log("[LOGIN] ERROR:", err);
    res.status(500).json({ message: "Error en login", error: err.message });
  }
});

// Endpoint principal de login (usa el login local)
app.post("/api/auth/login", async (req, res) => {
  console.log("[LOGIN] Recibida petición de login, redirigiendo a login-local");
  // Simplemente redirigimos al endpoint de login local
  const { username, password } = req.body;
  if (!username || !password) {
    console.log("[LOGIN] Faltan campos");
    return res.status(400).json({ message: "Usuario y contraseña requeridos" });
  }
  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.log("[LOGIN] Usuario no encontrado para:", username);
      return res.status(404).json({ message: "No se encuentra ese usuario" });
    }
    const passwordOk = await bcrypt.compare(password, user.password);
    if (!passwordOk) {
      console.log("[LOGIN] Contraseña incorrecta para usuario:", username);
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }
    console.log("[LOGIN] Login correcto para usuario:", username);
    res.json({ message: "Login correcto", user });
  } catch (err) {
    console.log("[LOGIN] ERROR:", err);
    res.status(500).json({ message: "Error en login", error: err.message });
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

// Obtener usuario por QR
app.get("/api/usuario/qr/:qrCode", async (req, res) => {
  try {
    const user = await User.findOne({ qrCode: req.params.qrCode });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado para ese QR" });
    }
    const { password, ...userSafe } = user.toObject();
    res.json({ ok: true, user: userSafe });
  } catch (err) {
    res.status(500).json({ message: "Error al buscar usuario por QR", error: err.message });
  }
});

// Sumar punto a usuario por QR
app.post("/api/puntos/sumar", async (req, res) => {
  console.log("[PUNTOS] ===== INICIO PROCESO DE SUMA DE PUNTOS =====");
  console.log("[PUNTOS] Body recibido:", req.body);
  
  const { qrCode, adminQrCode } = req.body;
  if (!qrCode) {
    console.log("[PUNTOS] ERROR: Falta el código QR");
    return res.status(400).json({ message: "Falta el código QR" });
  }
  
  try {
    console.log("[PUNTOS] Buscando usuario con qrCode:", qrCode);
    const user = await User.findOne({ qrCode });
    
    if (!user) {
      console.log("[PUNTOS] ERROR: Usuario no encontrado para el QR:", qrCode);
      return res.status(404).json({ message: "Usuario no encontrado para ese QR" });
    }
    
    console.log("[PUNTOS] Usuario encontrado:", user.username);
    console.log("[PUNTOS] Puntos actuales:", user.points || 0, "Puntos totales:", user.totalPoints || 0);
    
    // Incrementar puntos al usuario escaneado
    user.points = (user.points || 0) + 1;
    user.totalPoints = (user.totalPoints || 0) + 1;
    
    console.log("[PUNTOS] Nuevos puntos:", user.points, "Nuevos puntos totales:", user.totalPoints);
    
    // Guardar cambios del usuario escaneado
    await user.save();
    console.log("[PUNTOS] ✅ Usuario actualizado correctamente en la base de datos");
    
    // Verificar si quien escanea es un administrador
    const esAdmin = user.tipo === "admin" || user.tipo === "root";
    let admin = null;
    
    // Si es un administrador, sumar puntos a todos los usuarios
    if (esAdmin) {
      console.log("[PUNTOS] El usuario es administrador. Sumando puntos a todos los usuarios...");
      admin = user; // El admin es el mismo usuario escaneado
      
      // Obtener todos los usuarios excepto el admin actual
      const todosUsuarios = await User.find({ qrCode: { $ne: qrCode } });
      console.log(`[PUNTOS] Encontrados ${todosUsuarios.length} usuarios para sumar puntos`);
      
      // Sumar un punto a cada usuario
      for (const otroUsuario of todosUsuarios) {
        otroUsuario.points = (otroUsuario.points || 0) + 1;
        otroUsuario.totalPoints = (otroUsuario.totalPoints || 0) + 1;
        await otroUsuario.save();
        
        // Notificar a cada usuario por socket.io
        notifyPuntoSumado(otroUsuario.qrCode);
        
        // Guardar registro en el historial
        await new ScanLog({
          userQrCode: otroUsuario.qrCode,
          username: otroUsuario.username,
          adminQrCode: admin.qrCode,
          adminUsername: admin.username
        }).save();
      }
      
      console.log(`[PUNTOS] ✅ Sumado 1 punto a ${todosUsuarios.length} usuarios`);
    } 
    // NUEVA FUNCIONALIDAD: Si un usuario es escaneado por un admin, sumar puntos al admin también
    else if (adminQrCode) {
      // Verificar si quien escanea es un administrador
      console.log("[PUNTOS] Verificando si el escaneador es administrador, qrCode:", adminQrCode);
      admin = await User.findOne({ qrCode: adminQrCode });
      
      if (admin && (admin.tipo === "admin" || admin.tipo === "root")) {
        console.log(`[PUNTOS] El escaneador ${admin.username} es administrador. Sumando puntos al admin...`);
        
        // Incrementar puntos al administrador que escanea
        admin.points = (admin.points || 0) + 1;
        admin.totalPoints = (admin.totalPoints || 0) + 1;
        
        // Guardar cambios del administrador
        await admin.save();
        console.log(`[PUNTOS] ✅ Administrador ${admin.username} actualizado: ${admin.points} puntos`);
        
        // Notificar al administrador por socket.io
        notifyPuntoSumado(admin.qrCode);
      }
    }
    
    // Guardar registro en el historial
    await new ScanLog({
      userQrCode: user.qrCode,
      username: user.username,
      adminQrCode: admin ? admin.qrCode : null,
      adminUsername: admin ? admin.username : null
    }).save();
    
    // Notificar por socket.io al usuario original
    console.log("[PUNTOS] Notificando al usuario por socket.io, qrCode:", qrCode);
    notifyPuntoSumado(qrCode);
    
    // Enviar respuesta
    const { password, ...userSafe } = user.toObject();
    console.log("[PUNTOS] ===== FIN PROCESO DE SUMA DE PUNTOS (EXITOSO) =====");
    res.json({ ok: true, user: userSafe });
  } catch (err) {
    console.error("[PUNTOS] ❌ ERROR al sumar punto:", err);
    res.status(500).json({ message: "Error al sumar punto", error: err.message });
  }
});

// Endpoint para obtener el historial de escaneos
app.get("/api/historial", async (req, res) => {
  try {
    // Obtener todos los registros de escaneos, ordenados por fecha descendente
    const logs = await ScanLog.find()
      .sort({ timestamp: -1 })
      .limit(100); // Limitar a los últimos 100 registros para evitar sobrecarga
    
    res.json({ ok: true, logs });
  } catch (err) {
    console.error("Error al obtener historial de escaneos:", err);
    res.status(500).json({ message: "Error al obtener historial", error: err.message });
  }
});

// Endpoint para obtener el historial de un usuario específico
app.get("/api/historial/:qrCode", async (req, res) => {
  try {
    // Obtener todos los registros de escaneos del usuario, ordenados por fecha descendente
    const logs = await ScanLog.find({ userQrCode: req.params.qrCode })
      .sort({ timestamp: -1 })
      .limit(100);
    
    res.json({ ok: true, logs });
  } catch (err) {
    console.error("Error al obtener historial de usuario:", err);
    res.status(500).json({ message: "Error al obtener historial", error: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("API funcionando como proxy a la API externa");
});


