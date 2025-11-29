const express = require('express');
const router = express.Router();
const rateListDetailController = require('../controllers/ratelistdetailController');

router.post('/', rateListDetailController.createRateListDetail);
router.get('/', rateListDetailController.getRateListDetails);
router.get('/next-id', rateListDetailController.getNextRLDetailId);
router.get('/:id', rateListDetailController.getRateListDetailById);
router.put('/:id', rateListDetailController.updateRateListDetail);
router.delete('/:id', rateListDetailController.deleteRateListDetail);

module.exports = router;
