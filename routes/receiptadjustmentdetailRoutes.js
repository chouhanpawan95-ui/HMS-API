const express = require('express');
const router = express.Router();
const adjController = require('../controllers/receiptadjustmentdetailController');

router.post('/', adjController.createAdjustment);
router.get('/', adjController.getAdjustments);
router.get('/next-id', adjController.getNextTranId);
router.get('/receipt/:receiptId', adjController.getByReceiptId);
router.get('/:id', adjController.getAdjustmentById);
router.put('/:id', adjController.updateAdjustment);
router.delete('/:id', adjController.deleteAdjustment);

module.exports = router;
