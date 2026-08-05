require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

try {
  let serviceAccount;
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    throw new Error('La variable FIREBASE_SERVICE_ACCOUNT no está definida en el entorno.');
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase inicializado correctamente.');
} catch (error) {
  console.error('Error crítico al inicializar Firebase:', error.message);
  process.exit(1);
}

const db = admin.firestore();
const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/verificar-codigo', async (req, res) => {
    try {
        const { codigo, dispositivoId } = req.body;
        
        if (!codigo || !dispositivoId) {
            return res.status(400).json({ error: 'Faltan datos en la petición' });
        }

        const codigoRef = db.collection('Codigos').doc(codigo);
        const doc = await codigoRef.get();

        if (!doc.exists) {
            return res.status(404).json({ valido: false, mensaje: 'El código ingresado no existe.' });
        }

        const data = doc.data();

        if (data.dispositivo && data.dispositivo !== dispositivoId) {
            return res.status(403).json({ 
                valido: false, 
                mensaje: 'Este código ya está activo en otro dispositivo y no puede compartirse.' 
            });
        }

        if (!data.dispositivo || data.dispositivo === "") {
            await codigoRef.update({ dispositivo: dispositivoId, Usado: true });
        }

        res.json({ valido: true, mensaje: '¡Acceso autorizado con éxito!' });
    } catch (error) {
        console.error('Error al verificar el código:', error);
        res.status(500).json({ error: 'Error interno del servidor al procesar el código' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de validación corriendo en el puerto ${PORT}`);
});
