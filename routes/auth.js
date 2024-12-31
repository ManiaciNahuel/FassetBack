require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

// Credenciales fijas
const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    try {
        // Buscar usuario por email
        const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = result.rows[0];

        // Verificar la contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        res.status(200).json({ message: 'Login exitoso', userId: user.id });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});


router.post('/register', async (req, res) => {
    const { email, password, nombre, telefono } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await db.query(
            'INSERT INTO usuarios (email, password, nombre, telefono) VALUES ($1, $2, $3, $4) RETURNING id',
            [email, hashedPassword, nombre, telefono]
        );

        res.status(201).json({ message: 'Usuario registrado correctamente', userId: result.rows[0].id });
    } catch (error) {
        console.error('Error al registrar usuario:', error.message, error.stack);
        res.status(500).json({ error: `Error al registrar usuario: ${error.message}` });
    }
});


module.exports = router;
