require('dotenv').config();
const express = require('express');
const cors = express ? require('cors') : null;
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(cors());
app.use(express.json());

// Inicialización directa pasando la llave del archivo .env
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/generar', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: 'Falta el prompt en la petición' });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        res.json({ texto: response.text });
    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).json({ error: error.message || 'Error interno del servidor' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor intermediario corriendo en http://localhost:${PORT}`);
});