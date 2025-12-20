const express = require('express');
const router = express.Router();
const timeDetailController = require('../controllers/doctoropdscheduletimedetailController');

router.post('/', timeDetailController.createDoctorOpdScheduleTimeDetail);
router.get('/', timeDetailController.getDoctorOpdScheduleTimeDetails);
router.get('/next-id', timeDetailController.getNextTranId);
router.get('/schedule/:scheduleId', timeDetailController.getByScheduleId);
router.get('/:id', timeDetailController.getDoctorOpdScheduleTimeDetailById);
router.put('/:id', timeDetailController.updateDoctorOpdScheduleTimeDetail);
router.delete('/:id', timeDetailController.deleteDoctorOpdScheduleTimeDetail);

module.exports = router;
