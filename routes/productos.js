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
    const startTime = Date.now();
    console.log('GET /api/productos - Starting request');
    
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
            ORDER BY p.id
        `);
        
        const duration = Date.now() - startTime;
        console.log(`GET /api/productos - Success: ${result.rows.length} products, ${duration}ms`);
        
        res.json(result.rows);
    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`GET /api/productos - Error after ${duration}ms:`, {
            message: error.message,
            code: error.code,
            stack: error.stack.split('\n')[0] // Only first line of stack
        });
        
        // Send a more specific error response
        if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
            res.status(503).json({ 
                error: 'Database connection error', 
                message: 'Service temporarily unavailable' 
            });
        } else {
            res.status(500).json({ 
                error: 'Internal server error', 
                message: 'Error retrieving products' 
            });
        }
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
router.put('/:id/stock', async (req, res) => {
    const { id } = req.params;
    const { stock } = req.body;

    if (!stock || !Array.isArray(stock)) {
        return res.status(400).json({ error: 'El stock debe ser un array válido' });
    }

    try {
        // Usar pool.query directamente
        await Promise.all(
            stock.map(({ talle, cantidad }) => {
                return pool.query(
                    `UPDATE stock SET cantidad = $1 WHERE producto_id = $2 AND talle = $3`,
                    [cantidad, id, talle]
                );
            })
        );

        res.status(200).json({ message: 'Stock actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar el stock:', error);
        res.status(500).json({ error: 'Error al actualizar el stock' });
    }
});



module.exports = router;
