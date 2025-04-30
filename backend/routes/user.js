import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// Middleware auth
function auth(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'No autorizado' });
  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido' });
  }
}

// Datos usuario (QR y puntos)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ username: user.username, qrCode: user.qrCode, points: user.points });
  } catch {
    res.status(500).json({ message: 'Error obteniendo datos' });
  }
});

export default router;
