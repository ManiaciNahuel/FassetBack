const express = require('express');
const router = express.Router();

// Credenciales fijas
const USERNAME = 'admin';
const PASSWORD = 'clave123';

router.post('/login', (req, res) => {
    console.log('Solicitud recibida:', req.body); // Log para depurar
    const { username, password } = req.body;

    if (!username || !password) {
        console.error('Error: Faltan credenciales');
        return res.status(400).json({ error: 'Faltan credenciales' });
    }

    if (username === USERNAME && password === PASSWORD) {
        console.log('Login exitoso:', { username });
        return res.status(200).json({ message: 'Login exitoso' });
    } else {
        console.error('Credenciales inválidas:', { username, password });
        return res.status(401).json({ error: 'Credenciales inválidas' });
    }
});

module.exports = router;
