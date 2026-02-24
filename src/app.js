const express = require('express');
const { PORT } = require('./config/env');
const authRoutes = require('./routes/auth.routes');

const app = express();

app.use(express.json()); // Parsear JSON en el body

// Rutas
app.use('/auth', authRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API funcionando ✅' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});