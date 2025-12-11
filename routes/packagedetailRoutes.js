const express = require('express');
const router = express.Router();
const packageDetailController = require('../controllers/packagedetailController');

router.post('/', packageDetailController.createPackageDetail);
router.get('/', packageDetailController.getPackageDetails);
router.get('/next-id', packageDetailController.getNextPkgDetailId);
router.get('/package/:packageId', packageDetailController.getByPackageId);
router.get('/:id', packageDetailController.getPackageDetailById);
router.put('/:id', packageDetailController.updatePackageDetail);
router.delete('/:id', packageDetailController.deletePackageDetail);

module.exports = router;
