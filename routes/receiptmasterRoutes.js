const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/receiptmasterController');

router.post('/', receiptController.createReceipt);
router.get('/', receiptController.getReceipts);
router.get('/next-id', receiptController.getNextReceiptId);
router.get('/:id', receiptController.getReceiptById);
router.put('/:id', receiptController.updateReceipt);
router.delete('/:id', receiptController.deleteReceipt);

module.exports = router;
