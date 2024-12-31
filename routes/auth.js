require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

const USERNAME = process.env.USERNAME; // Nombre de usuario
const PASSWORD = process.env.PASSWORD; // Contraseña en hash

router.post('/login', async (req, res) => {
    console.log('Cuerpo de la solicitud:', req.body);
    const { username, password } = req.body;

    if (!username || !password) {
        console.error('Error: Faltan credenciales');
        return res.status(400).json({ error: 'Faltan credenciales' });
    }

    // Comparar contraseña con el hash almacenado
    const isPasswordValid = await bcrypt.compare(password, PASSWORD);
    
    if (username === USERNAME && isPasswordValid) {
        console.log('Login exitoso:', { username });
        return res.status(200).json({ message: 'Login exitoso' });
    } else {
        console.error('Credenciales inválidas:', { username });
        return res.status(401).json({ error: 'Credenciales inválidas' });
    }
});

module.exports = router;
