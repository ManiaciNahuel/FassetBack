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
        // Allow requests with no origin (mobile apps, curl requests, Railway health checks)
        if (!origin) {
            return callback(null, true);
        }
        
        // Allow requests from allowed origins
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        // For development, allow localhost with any port
        if (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) {
            return callback(null, true);
        }
        
        console.log('CORS blocked origin:', origin);
        callback(new Error('No permitido por CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));


// Middleware para parsear JSON
app.use(express.json());

// Health check endpoint for Railway
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        port: PORT
    });
});

// Rutas
app.use('/api/auth', authRoutes); // Rutas de autenticación
app.use('/api/productos', productosRoutes); // Rutas de productos
app.use('/api/checkout', checkoutRoutes);
app.use('/api/users', usersRoutes);

// Ruta de prueba
app.get('/api/test', (req, res) => {
    res.json({ message: '¡Conexión exitosa entre frontend y backend!' });
});

// Global error handling middleware
app.use((error, req, res, next) => {
    console.error('Global error handler:', {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    if (error.message === 'No permitido por CORS') {
        return res.status(403).json({ error: 'CORS policy violation' });
    }

    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// 404 handler
app.use('*', (req, res) => {
    console.log('404 Not Found:', req.method, req.originalUrl);
    res.status(404).json({ error: 'Endpoint not found' });
});

// Escuchar en el puerto especificado
const server = app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
    console.log(`📊 Health check disponible en http://localhost:${PORT}/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
