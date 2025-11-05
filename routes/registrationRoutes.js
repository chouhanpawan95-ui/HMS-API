const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { createRegistration, getAllRegistrations } = require('../controllers/registrationController');
 const verifyToken = require('../middleware/authMiddleware'); // enable if you want this protected

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, uploadDir),
	filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

// Create new registration record (accepts multipart/form-data: fields + files)
// Use field names: 'imageupload' and 'documentupload'
router.post('/',verifyToken, upload.fields([
	{ name: 'imageupload', maxCount: 1 },
	{ name: 'documentupload', maxCount: 1 },
]), createRegistration);

// Get all registrations
router.get('/',verifyToken, getAllRegistrations);

module.exports = router;
