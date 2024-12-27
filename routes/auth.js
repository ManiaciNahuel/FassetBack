const express = require('express');
const router = express.Router();

// Credenciales fijas
const USERNAME = 'admin';
const PASSWORD = 'clave123';

router.post('/login', (req, res) => {
    console.log('Cuerpo de la solicitud:', req.body); // Log para verificar el cuerpo recibido
    const { username, password } = req.body;

    if (!username || !password) {
        console.error('Error: Faltan credenciales');
        return res.status(400).json({ error: 'Faltan credenciales' });
    }

    if (username === 'admin' && password === 'clave123') {
        console.log('Login exitoso:', { username });
        return res.status(200).json({ message: 'Login exitoso' }); // Respuesta de éxito
    } else {
        console.error('Credenciales inválidas:', { username, password });
        return res.status(401).json({ error: 'Credenciales inválidas' });
    }
});

module.exports = router;
