const express = require('express');
require('dotenv').config();
const { MercadoPagoConfig, Preference } = require('mercadopago');
const router = express.Router();

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

module.exports = router;