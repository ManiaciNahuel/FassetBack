require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const productosRoutes = require('./routes/productos'); // Importa las rutas
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT;

// Lista de orígenes permitidos
const allowedOrigins = ['https://fassetargentina.com', 'http://localhost:3001'];
app.use('/api/auth', authRoutes);

app.use(cors({
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) { // !origin permite solicitudes sin origen (como Postman)
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true, // Si necesitas cookies o autenticación
}));

app.use(express.json());

// Ruta de prueba
app.get('/api/test', (req, res) => {
    res.json({ message: '¡Conexión exitosa entre frontend y backend!' });
});

// Rutas
app.use('/api/productos', productosRoutes);

app.listen(PORT, () => console.log(`Servidor ejecutándose en el puerto ${PORT}`));
