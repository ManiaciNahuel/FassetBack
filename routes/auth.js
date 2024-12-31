require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

// Credenciales fijas
const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;

router.post('/login', async (req, res) => {
    console.log('Cuerpo de la solicitud:', req.body); // Log para verificar el cuerpo recibido
    const { username, password } = req.body;

    if (!username || !password) {
        console.error('Error: Faltan credenciales');
        return res.status(400).json({ error: 'Faltan credenciales' });
    }

    const isPasswordValid = await bcrypt.compare(password, PASSWORD);
    if (username === USERNAME && isPasswordValid) {
        console.log('Login exitoso:', { username });
        return res.status(200).json({ message: 'Login exitoso' }); // Respuesta de éxito
    } else {
        console.error('Credenciales inválidas:', { username });
        return res.status(401).json({ error: 'Credenciales inválidas' });
    }
});

module.exports = router;
