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
                success: "https://fassetargentina.com/success",
                failure: "https://fassetargentina.com/failure",
                pending: "https://fassetargentina.com/pending"
            },
            notification_url: "https://fassetback-production-39c8.up.railway.app/api/checkout/webhook",
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
        console.log("📩 Webhook recibido:", req.body);

        const payment = req.body;
        if (payment.type !== "payment") {
            return res.status(400).json({ message: "No es un evento de pago" });
        }

        // Obtener detalles del pago desde Mercado Pago
        const paymentId = payment.data.id;

        const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
                "Content-Type": "application/json"
            }
        });

        const paymentData = await response.json();
        console.log("🔎 Detalles del pago:", paymentData);

        // Validamos si el pago está aprobado
        if (paymentData.status === "approved") {
            const itemsComprados = paymentData.additional_info.items;

            const pool = require("../db"); // Importamos la conexión a la BD

            // Restamos stock por cada ítem comprado
            for (const item of itemsComprados) {
                const { title, quantity } = item;

                await pool.query(
                    `UPDATE stock SET cantidad = cantidad - $1 WHERE producto_id = (
                        SELECT id FROM productos WHERE nombre = $2
                    )`,
                    [quantity, title]
                );
            }

            console.log("✅ Stock actualizado correctamente");
        } else {
            console.warn("⚠️ El pago no está aprobado, no se actualiza el stock.");
        }

        res.sendStatus(200); // Responder 200 OK para que Mercado Pago no reenvíe la notificación
    } catch (error) {
        console.error("❌ Error procesando webhook:", error);
        res.status(500).json({ error: "Error en el webhook" });
    }
});


module.exports = router;