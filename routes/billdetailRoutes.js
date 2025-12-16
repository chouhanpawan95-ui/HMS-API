const express = require('express');
const router = express.Router();
const billDetailController = require('../controllers/billdetailController');

router.post('/', billDetailController.createBillDetail);
router.get('/', billDetailController.getBillDetails);
router.get('/next-id', billDetailController.getNextBillDetailId);
router.get('/bill/:billId', billDetailController.getByBillId);
router.get('/:id', billDetailController.getBillDetailById);
router.get('/:billid', billDetailController.getBillDetailBillId);
router.put('/:id', billDetailController.updateBillDetail);
router.delete('/:id', billDetailController.deleteBillDetail);

module.exports = router;
