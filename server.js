const express = require('express');
const multer = require('multer');
const msgParser = require('msg-parser');
const fs = require('fs');

const app = express();
const port = 3000;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.static('public'));

app.post('/upload', upload.single('msgFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No se proporcionó un archivo.');
    }

    try {
        const parsedMsg = msgParser(req.file.buffer.toString('utf8'));  // Parse como cadena UTF-8
        res.json({ success: true, data: parsedMsg });
    } catch (error) {
        res.json({ success: false, error: `Error al analizar el contenido del archivo: ${error.message}` });
    }
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});

