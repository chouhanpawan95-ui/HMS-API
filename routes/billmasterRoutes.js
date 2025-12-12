// routes/billmasterRoutes.js
const express = require('express');
const router = express.Router();
const billController = require('../controllers/billmasterController');

router.post('/', billController.createBill);
router.get('/', billController.getBills);
router.get('/next-id', billController.getNextBillId);
router.get('/:id', billController.getBillById);
router.put('/:id', billController.updateBill);
router.delete('/:id', billController.deleteBill);

module.exports = router;
