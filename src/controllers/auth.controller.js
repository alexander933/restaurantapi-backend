const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { JWT_SECRET, REFRESH_SECRET } = require('../config/env');
const UserModel = require('../models/user.model');

// Almacén temporal de refresh tokens (usa Redis o DB en producción)
const refreshTokens = new Set();

// POST /auth/register
async function register(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const existing = await UserModel.findByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'El usuario ya existe' });
    }

    const user = await UserModel.create(email, password);
    res.status(201).json({ message: 'Usuario creado', userId: user.id });

  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// POST /auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar tokens
    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    refreshTokens.add(refreshToken); // Guardar en DB en producción

    res.json({ accessToken, refreshToken });

  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// POST /auth/refresh
function refresh(req, res) {
  const { refreshToken } = req.body;

  if (!refreshToken || !refreshTokens.has(refreshToken)) {
    return res.status(403).json({ error: 'Refresh token inválido o revocado' });
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ accessToken: newAccessToken });

  } catch (err) {
    res.status(403).json({ error: 'Refresh token expirado' });
  }
}

// POST /auth/logout
function logout(req, res) {
  const { refreshToken } = req.body;
  refreshTokens.delete(refreshToken); // Revocar token
  res.json({ message: 'Sesión cerrada correctamente' });
}

module.exports = { register, login, refresh, logout };