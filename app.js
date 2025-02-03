require('dotenv').config();
const express = require('express');
const cors = require('cors');
const productosRoutes = require('./routes/productos'); // Importa las rutas
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users'); 
const checkoutRoutes = require('./routes/checkout');


const app = express();
const PORT = process.env.PORT;


// Lista de orígenes permitidos
const allowedOrigins = ['https://fassetargentina.com', 'http://localhost:3001'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) { 
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));


// Middleware para parsear JSON
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes); // Rutas de autenticación
app.use('/api/productos', productosRoutes); // Rutas de productos
app.use('/api/checkout', checkoutRoutes);
app.use('/api/users', usersRoutes);

// Ruta de prueba
app.get('/api/test', (req, res) => {
    res.json({ message: '¡Conexión exitosa entre frontend y backend!' });
});

// Escuchar en el puerto especificado
app.listen(PORT, () => console.log(`Servidor ejecutándose en el puerto ${PORT}`));

// Otras configuraciones...
