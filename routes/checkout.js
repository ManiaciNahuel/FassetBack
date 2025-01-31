const express = require('express');
require('dotenv').config();
const { MercadoPagoConfig, Preference } = require('mercadopago');
const router = express.Router();
const pool = require('../db');


// Configuración del cliente de Mercado Pago con credenciales
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN
});

router.post('/create_preference', async (req, res) => {
    try {
        const preference = new Preference(client);

        const preferenceData = {
            items: req.body.items,
            payer: req.body.payer,
            back_urls: {
                success: "https://localhost:3001/success",
                failure: "https://localhost:3001/failure",
                pending: "https://localhost:3001/pending"
            },
            notification_url: "hhttps://fassetback-production-39c8.up.railway.app/api/checkout/webhook",
            auto_return: "approved",
        };

        const response = await preference.create({ body: preferenceData });
        const id = response.id
        const init_point = response.init_point

        res.json({ id, init_point});

    } catch (error) {
        console.error("Error al crear la preferencia de pago:", error);
        res.status(500).json({ error: "Error al procesar el pago" });
    }
});


router.post('/webhook', async (req, res) => {
    try {
        console.log("🔔 Notificación recibida:", req.body);

        if (!req.body || !req.body.action || req.body.action !== "payment.updated") {
            return res.status(400).json({ error: "Notificación inválida" });
        }

        const paymentId = req.body.data.id;
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: {
                'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`
            }
        });

        const paymentData = await response.json();

        if (paymentData.status === "approved") {
            console.log("✅ Pago aprobado:", paymentData);

            const productId = paymentData.external_reference;
            const quantity = paymentData.transaction_amount; // Esto hay que mapearlo mejor

            const client = await pool.connect();
            await client.query(`
                UPDATE stock 
                SET cantidad = cantidad - $1 
                WHERE producto_id = $2
            `, [quantity, productId]);
            client.release();

            console.log("📉 Stock actualizado para el producto:", productId);
        }

        res.sendStatus(200);
    } catch (error) {
        console.error("🚨 Error en webhook:", error);
        res.status(500).json({ error: "Error en el procesamiento del webhook" });
    }
});


module.exports = router;