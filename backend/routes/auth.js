import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// Registro
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ message: 'Usuario ya existe' });
    const hashed = await bcrypt.hash(password, 10);
    // QR único: puede ser el _id o un string generado
    const qrCode = `qr_${username}_${Date.now()}`;
    const user = new User({ username, password: hashed, qrCode });
    await user.save();
    res.status(201).json({ message: 'Usuario creado' });
  } catch (err) {
    res.status(500).json({ message: 'Error en registro' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Usuario o contraseña incorrectos' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Usuario o contraseña incorrectos' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Error en login' });
  }
});

export default router;
