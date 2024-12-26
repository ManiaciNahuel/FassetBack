const express = require('express');
const router = express.Router();

// Usuario y contraseña fijos (puedes cambiar esto según tu preferencia)
const USERNAME = 'admin';
const PASSWORD = 'clave123'; // Cambia esto por tu clave deseada

// Endpoint para validar credenciales
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username === USERNAME && password === PASSWORD) {
        res.status(200).json({ message: 'Login exitoso' });
    } else {
        res.status(401).json({ error: 'Credenciales inválidas' });
    }
});

module.exports = router;
