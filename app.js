const express = require('express');
const cors = require('cors');
const productosRoutes = require('./routes/productos'); // Importa las rutas

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: 'https://fassetargentina.com', // Si estás en local
    credentials: true,              // Permitir cookies si es necesario
}));
app.use(express.json());

// Ruta de prueba
app.get('/api/test', (req, res) => {
    res.json({ message: '¡Conexión exitosa entre frontend y backend!' });
});

// Rutas
app.use('/api/productos', productosRoutes);

app.listen(PORT, () => console.log(`Servidor ejecutándose en el puerto ${PORT}`));
