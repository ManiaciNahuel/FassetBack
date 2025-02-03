require('dotenv').config();
const express = require('express');
const cors = require('cors');
const productosRoutes = require('./routes/productos'); // Importa las rutas
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users'); 


const app = express();
const PORT = process.env.PORT;
const checkoutRoutes = require('./routes/checkout');
app.use('/api/users', usersRoutes);


// Lista de orígenes permitidos
const allowedOrigins = ['https://fassetargentina.com', 'http://localhost:3001'];

// Habilitar CORS
app.use(cors({
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) { // Permitir Postman y otros orígenes sin cabecera
            callback(null, true); // Permitir el origen
        } else {
            callback(new Error('No permitido por CORS')); // Bloquear el origen no permitido
        }
    },
    credentials: true, // Si necesitas enviar cookies o encabezados personalizados
}));

// Middleware para parsear JSON
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes); // Rutas de autenticación
app.use('/api/productos', productosRoutes); // Rutas de productos
app.use('/api/checkout', checkoutRoutes);

// Ruta de prueba
app.get('/api/test', (req, res) => {
    res.json({ message: '¡Conexión exitosa entre frontend y backend!' });
});

// Escuchar en el puerto especificado
app.listen(PORT, () => console.log(`Servidor ejecutándose en el puerto ${PORT}`));

// Otras configuraciones...
