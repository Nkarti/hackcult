require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const multer = require('multer'); // To handle file uploads

const app = express();
const port = 3000;

// Encryption setup
const algorithm = 'aes-256-ctr';
const saltLength = 32;
const ivLength = 16; // AES block size for IV

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up multer for file uploads (encrypted files)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Helper function to derive a key from the password
function deriveKey(password, salt) {
    const iterations = 100000;
    const keyLength = 32; // AES-256 uses a 32-byte key
    return crypto.pbkdf2Sync(password, salt, iterations, keyLength, 'sha256');
}

// Ensure the uploads folder exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Encryption route
app.post('/encrypt', (req, res) => {
    try {
        const { text, password } = req.body;
        if (!text || !password) {
            return res.status(400).json({ error: 'Text and password are required' });
        }

        // Generate a salt
        const salt = crypto.randomBytes(saltLength);
        const key = deriveKey(password, salt);
        const iv = crypto.randomBytes(ivLength);

        // Encrypt the data
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);

        // Save the encrypted data, IV, and salt locally
        const encryptedFilePath = path.join(__dirname, 'uploads', `${Date.now()}_encrypted.txt`);
        const dataToStore = JSON.stringify({
            encrypted: encrypted.toString('hex'),
            iv: iv.toString('hex'),
            salt: salt.toString('hex')
        });
        fs.writeFileSync(encryptedFilePath, dataToStore);

        res.json({
            message: 'Data encrypted successfully',
            encryptedFilePath: encryptedFilePath,
            iv: iv.toString('hex'),
            salt: salt.toString('hex')
        });
    } catch (err) {
        console.error('Encryption error:', err);
        res.status(500).json({ error: 'Internal server error during encryption' });
    }
});

// Decryption route
app.post('/decrypt', upload.single('file'), (req, res) => {
    try {
        const { password } = req.body;
        if (!req.file || !password) {
            return res.status(400).json({ error: 'Encrypted file and password are required' });
        }

        // Read the encrypted file
        const fileData = fs.readFileSync(req.file.path, 'utf8');
        const { encrypted, iv, salt } = JSON.parse(fileData);

        if (!encrypted || !iv || !salt) {
            return res.status(400).json({ error: 'File is missing encrypted data, IV, or salt' });
        }

        // Convert IV and salt back to buffers
        const ivBuffer = Buffer.from(iv, 'hex');
        const saltBuffer = Buffer.from(salt, 'hex');

        // Derive the key using the password and salt
        const key = deriveKey(password, saltBuffer);

        // Decrypt the data
        const decipher = crypto.createDecipheriv(algorithm, key, ivBuffer);
        const decrypted = Buffer.concat([decipher.update(Buffer.from(encrypted, 'hex')), decipher.final()]);

        // Clean up: Delete the uploaded file after processing
        fs.unlinkSync(req.file.path);

        res.json({ decrypted: decrypted.toString('utf8') });
    } catch (err) {
        console.error('Decryption error:', err);
        res.status(500).json({ error: 'Internal server error during decryption' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
