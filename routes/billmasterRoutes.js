// routes/billmasterRoutes.js
const express = require('express');
const router = express.Router();
const billController = require('../controllers/billmasterController');

// CRUD
router.post('/', billController.createBill);
router.get('/', billController.getBills);
router.get('/:id', billController.getBillById);
router.put('/:id', billController.updateBill);
router.delete('/:id', billController.deleteBill);

module.exports = router;
