// script.js
document.addEventListener('DOMContentLoaded', () => {
    const dropArea = document.getElementById('drop-area');
    const statusMessage = document.getElementById('status-message');
    const headerDisplay = document.getElementById('header-display');
    const headerContent = document.getElementById('header-content');
    const msgParser = require('msg-parser');
    const pstExtractor = require('pst-extractor');

    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.style.borderColor = '#333';
    });

    dropArea.addEventListener('dragleave', () => {
        dropArea.style.borderColor = '#ccc';
    });

    dropArea.addEventListener('drop', async (e) => {
        e.preventDefault();
        dropArea.style.borderColor = '#ccc';

        const files = e.dataTransfer.files;

        if (files.length > 0) {
            statusMessage.textContent = 'Procesando archivos...';

            // Itera sobre cada archivo
            for (const file of files) {
                try {
                    const emailHeader = await parseEmailHeader(file);
                    headerContent.textContent += `\n\nArchivo: ${file.name}\n${emailHeader}`;
                    headerDisplay.style.display = 'block';
                } catch (error) {
                    console.error(`Error al analizar el contenido del archivo ${file.name}:`, error);
                    headerContent.textContent += `\n\nError al analizar el contenido del archivo ${file.name}: ${error.message}`;
                    headerDisplay.style.display = 'block';
                }
            }

            statusMessage.textContent = 'Archivos procesados correctamente.';
        } else {
            statusMessage.textContent = 'No se pudieron obtener archivos.';
        }
    });

    async function parseEmailHeader(file) {
        const reader = new FileReader();

        return new Promise((resolve, reject) => {
            reader.onload = async (event) => {
                try {
                    const emailHeader = await parseEmailContent(event.target.result, file.type);
                    resolve(emailHeader);
                } catch (error) {
                    reject(error);
                }
            };

            reader.readAsText(file);
        });
    }

    async function parseEmailContent(emailContent, fileType) {
        try {
            if (fileType === 'application/vnd.ms-outlook-msg') {
                // Procesar archivo .msg
                try {
                    const msgData = await parseMsgFile(emailContent);
                    return msgData;
                } catch (msgError) {
                    throw new Error(`Error al procesar archivo .msg: ${msgError.message}`);
                }
            } else if (fileType === 'application/vnd.ms-outlook-pst') {
                // Procesar archivo .pst
                try {
                    const pstData = await parsePstFile(emailContent);
                    return pstData;
                } catch (pstError) {
                    throw new Error(`Error al procesar archivo .pst: ${pstError.message}`);
                }
            }
            // Añadir más casos para otros tipos de archivos
            else {
                throw new Error('Formato de correo electrónico no compatible.');
            }
        } catch (error) {
            throw new Error(`Error al analizar el contenido del correo electrónico: ${error.message}`);
        }
    }

    // Parsear archivos .msg
    async function parseMsgFile(msgContent) {
        return new Promise((resolve, reject) => {
            msgParser(msgContent, (error, msgData) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(msgData);
                }
            });
        });
    }

    // Parsear archivos .pst
    async function parsePstFile(pstContent) {
        return new Promise((resolve, reject) => {
            pstExtractor.parse(pstContent, (error, pstData) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(pstData);
                }
            });
        });
    }
});