const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/opdappointmentController');

router.post('/', appointmentController.createAppointment);
router.get('/', appointmentController.getAppointments);
router.get('/next-id', appointmentController.getNextAppointmentId);
router.get('/:id', appointmentController.getAppointmentById);
router.put('/:id', appointmentController.updateAppointment);
router.delete('/:id', appointmentController.deleteAppointment);

module.exports = router;
