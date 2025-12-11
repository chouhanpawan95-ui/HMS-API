const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packagemasterController');

router.post('/', packageController.createPackageMaster);
router.get('/', packageController.getPackageMasters);
router.get('/next-id', packageController.getNextPackageId);
router.get('/:id', packageController.getPackageMasterById);
router.put('/:id', packageController.updatePackageMaster);
router.delete('/:id', packageController.deletePackageMaster);

module.exports = router;
