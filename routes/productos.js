const express = require('express');
const pool = require('../db'); // Conexión a la base de datos
const router = express.Router();

// Obtener todos los productos con imágenes y talles
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                p.id,
                p.nombre,
                p.descripcion,
                p.precio,
                p.imagen1,
                p.imagen2,
                p.imagen3,
                json_agg(json_build_object('talle', s.talle, 'cantidad', s.cantidad)) AS stock
            FROM productos p
            LEFT JOIN stock s ON p.id = s.producto_id
            GROUP BY p.id
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener un producto por ID con su stock
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT 
                p.id,
                p.nombre,
                p.descripcion,
                p.precio,
                p.imagen1,
                p.imagen2,
                p.imagen3,
                json_agg(json_build_object('talle', s.talle, 'cantidad', s.cantidad)) AS stock
            FROM productos p
            LEFT JOIN stock s ON p.id = s.producto_id
            WHERE p.id = $1
            GROUP BY p.id
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
