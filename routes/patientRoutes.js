// routes/patientRoutes.js
const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
//const verifyToken = require('../middleware/authMiddleware'); // enable if you want this protected
// CRUD
router.post('/', patientController.createPatient);        // create
router.get('/', patientController.getPatients);          // list with optional q, page, limit
router.get('/next-id', patientController.getNextPatientId); // get next patientId
router.get('/:id', patientController.getPatientById);    // get by mongo _id or patientId
router.put('/:id', patientController.updatePatient);     // update by id or patientId
router.delete('/:id', patientController.deletePatient);  // delete
//router.delete('/:id',verifyToken, patientController.deletePatient);  // delete

module.exports = router;
