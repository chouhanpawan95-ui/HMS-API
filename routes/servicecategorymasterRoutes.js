const express = require('express');
const router = express.Router();
const serviceCategoryMasterController = require('../controllers/servicecategorymasterController');

router.post('/', serviceCategoryMasterController.createServiceCategoryMaster);
router.get('/', serviceCategoryMasterController.getServiceCategoryMasters);
router.get('/next-id', serviceCategoryMasterController.getNextCategoryId);
router.get('/:id', serviceCategoryMasterController.getServiceCategoryMasterById);
router.put('/:id', serviceCategoryMasterController.updateServiceCategoryMaster);
router.delete('/:id', serviceCategoryMasterController.deleteServiceCategoryMaster);

module.exports = router;
