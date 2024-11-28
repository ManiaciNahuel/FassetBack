const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/api/test', (req, res) => {
    res.json({ message: '¡Conexión exitosa entre frontend y backend!' });
});

app.listen(PORT, () => console.log(`Servidor ejecutándose en el puerto ${PORT}`));
