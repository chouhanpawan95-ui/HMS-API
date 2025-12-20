const express = require('express');
const router = express.Router();
const doctorScheduleController = require('../controllers/doctoropdschedulemasterController');

router.post('/', doctorScheduleController.createDoctorOpdSchedule);
router.get('/', doctorScheduleController.getDoctorOpdSchedules);
router.get('/next-id', doctorScheduleController.getNextScheduleId);
router.get('/:id', doctorScheduleController.getDoctorOpdScheduleById);
router.put('/:id', doctorScheduleController.updateDoctorOpdSchedule);
router.delete('/:id', doctorScheduleController.deleteDoctorOpdSchedule);

module.exports = router;
