require('dotenv').config();
const express = require('express');
const router = express.Router();
const mercadopago = require('mercadopago');

// Configurar las credenciales de Mercado Pago
mercadopago.configure({
    access_token: process.env.MP_ACCESS_TOKEN, // Token de acceso de producción
});

// Crear preferencia de pago
router.post('/create_preference', async (req, res) => {
    const { items, payer } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Debe incluir al menos un producto en el pedido.' });
    }

    try {
        const preference = {
            items: items.map(item => ({
                title: item.title,
                unit_price: item.unit_price,
                quantity: item.quantity,
                currency_id: 'ARS', // Moneda en pesos argentinos
            })),
            payer: {
                email: payer.email,
                name: payer.name,
                phone: {
                    number: payer.phone,
                },
            },
            back_urls: {
                success: `${process.env.BASE_URL}/success`,
                failure: `${process.env.BASE_URL}/failure`,
                pending: `${process.env.BASE_URL}/pending`,
            },
            auto_return: 'approved', // Retornar automáticamente después de aprobar
        };

        const response = await mercadopago.preferences.create(preference);
        res.status(200).json({ init_point: response.body.init_point });
    } catch (error) {
        console.error('Error al crear la preferencia:', error);
        res.status(500).json({ error: 'Error al crear la preferencia de pago.' });
    }
});

module.exports = router;
