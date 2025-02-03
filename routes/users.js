const express = require('express');
const pool = require('../db'); // Asegúrate de importar la conexión a PostgreSQL
const router = express.Router();

router.post('/add', async (req, res) => {
    const { email, name, phone } = req.body;

    if (!email || !name || !phone) {
        return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    try {
        // Verificar si el usuario ya existe en la base de datos
        const existingUser = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);

        if (existingUser.rows.length > 0) {
            return res.status(200).json({ message: "Usuario ya registrado." });
        }

        // Insertar el nuevo usuario en la base de datos
        const result = await pool.query(
            'INSERT INTO usuarios (email, nombre, telefono) VALUES ($1, $2, $3) RETURNING id',
            [email, name, phone]
        );

        res.status(201).json({ message: "Usuario registrado correctamente", userId: result.rows[0].id });

    } catch (error) {
        console.error("Error al guardar usuario:", error);
        res.status(500).json({ error: "Error al guardar el usuario" });
    }
});

module.exports = router;
