const express = require('express');
const router = express.Router();
const servicedepartmentController = require('../controllers/servicedepartmentmasterController');

router.post('/', servicedepartmentController.createServiceDepartmentMaster);
router.get('/', servicedepartmentController.getServiceDepartmentMasters);
router.get('/next-id', servicedepartmentController.getNextDepartmentId);
router.get('/:id', servicedepartmentController.getServiceDepartmentMasterById);
router.put('/:id', servicedepartmentController.updateServiceDepartmentMaster);
router.delete('/:id', servicedepartmentController.deleteServiceDepartmentMaster);

module.exports = router;
