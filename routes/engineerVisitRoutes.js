const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createEngineerVisit, getProjectVisits, getAllVisits } = require('../controllers/engineerVisitController');
const verifyToken = require('../middleware/authMiddleware');

// Ensure uploads directory exists for site visit photos
const uploadDir = path.join(__dirname, '..', 'uploads', 'site-visits');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage });

// Create new engineer visit record (protected route)
router.post('/', 
    verifyToken,
    upload.array('photos', 5), // Allow up to 5 photos per visit
    createEngineerVisit
);

// Get all visits for a specific project (protected route)
router.get('/project/:projectId', verifyToken, getProjectVisits);

// Get all engineer visits (protected route)
router.get('/', verifyToken, getAllVisits);

module.exports = router;