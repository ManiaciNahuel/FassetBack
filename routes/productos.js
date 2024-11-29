const express = require('express');
const pool = require('../db'); // Conexión a la base de datos
const router = express.Router();

// Obtener todos los productos
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM productos');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear un nuevo producto
router.post('/', async (req, res) => {
    const { nombre, descripcion, precio, cantidad } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO productos (nombre, descripcion, precio, cantidad) VALUES ($1, $2, $3, $4) RETURNING *',
            [nombre, descripcion, precio, cantidad]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar un producto
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, cantidad } = req.body;
    try {
        const result = await pool.query(
            'UPDATE productos SET nombre = $1, descripcion = $2, precio = $3, cantidad = $4 WHERE id = $5 RETURNING *',
            [nombre, descripcion, precio, cantidad, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar un producto
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM productos WHERE id = $1', [id]);
        res.json({ message: 'Producto eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
