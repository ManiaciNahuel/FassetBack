const express = require('express');
const pool = require('../db'); // Conexión a la base de datos
const router = express.Router();

// Middleware para verificar si el usuario es administrador
const verifyAdmin = async (req, res, next) => {
    const { userId } = req.body; // Se espera que el userId venga en el cuerpo de la solicitud

    try {
        const result = await pool.query('SELECT is_admin FROM usuarios WHERE id = $1', [userId]);

        if (result.rows.length === 0 || !result.rows[0].is_admin) {
            return res.status(403).json({ error: 'No tienes permisos para realizar esta acción.' });
        }

        next(); // Continúa con la siguiente función si es administrador
    } catch (error) {
        console.error('Error al verificar permisos:', error);
        res.status(500).json({ error: 'Error al verificar permisos' });
    }
};


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
                p.imagen4,
                p.imagen5,
                p.especificaciones,
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
                p.imagen4,
                p.imagen5,
                p.especificaciones,
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


// PUT /api/productos/:id/stock
router.put('/:id/stock', verifyAdmin, async (req, res) => {
    const { id } = req.params; // ID del producto
    const { stock } = req.body; // Array de talles y cantidades actualizadas

    if (!stock || !Array.isArray(stock)) {
        return res.status(400).json({ error: 'El stock debe ser un array válido' });
    }

    try {
        // Actualizar el stock en la base de datos
        const client = await pool.connect();
        await Promise.all(
            stock.map(({ talle, cantidad }) => {
                return client.query(
                    `UPDATE stock SET cantidad = $1 WHERE producto_id = $2 AND talle = $3`,
                    [cantidad, id, talle]
                );
            })
        );
        client.release();

        res.status(200).json({ message: 'Stock actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar el stock:', error);
        res.status(500).json({ error: 'Error al actualizar el stock' });
    }
});


module.exports = router;
