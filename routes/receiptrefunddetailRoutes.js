const express = require('express');
const router = express.Router();
const refundController = require('../controllers/receiptrefunddetailController');

router.post('/', refundController.createRefund);
router.get('/', refundController.getRefunds);
router.get('/next-id', refundController.getNextRefundId);
router.get('/receipt/:receiptId', refundController.getByReceiptId);
router.get('/:id', refundController.getRefundById);
router.put('/:id', refundController.updateRefund);
router.delete('/:id', refundController.deleteRefund);

module.exports = router;
