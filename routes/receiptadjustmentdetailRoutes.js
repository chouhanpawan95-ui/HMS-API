const express = require('express');
const router = express.Router();
const adjController = require('../controllers/receiptadjustmentdetailController');

// Debug: confirm routes load and log incoming requests
console.log('Loaded receiptadjustmentdetailRoutes');
router.use((req, res, next) => { console.log('receiptadjustmentdetail route hit:', req.method, req.originalUrl); next(); });

router.post('/', adjController.createAdjustment);
router.get('/', adjController.getAdjustments);
// router.get('/next-id', adjController.getNextTranId);
router.get('/receipt/:receiptId', adjController.getByReceiptId);
// use explicit path for lookups by adjusted bill id to avoid param name conflicts
router.get('/bill/:billid', adjController.getByAdjustedBillId);
router.get('/:id', adjController.getAdjustmentById);
router.put('/:id', adjController.updateAdjustment);
router.delete('/:id', adjController.deleteAdjustment);

module.exports = router;
