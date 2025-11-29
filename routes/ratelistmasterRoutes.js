const express = require('express');
const router = express.Router();
const rateListMasterController = require('../controllers/ratelistmasterController');

router.post('/', rateListMasterController.createRateListMaster);
router.get('/', rateListMasterController.getRateListMasters);
router.get('/next-id', rateListMasterController.getNextRateListId);
router.get('/:id', rateListMasterController.getRateListMasterById);
router.put('/:id', rateListMasterController.updateRateListMaster);
router.delete('/:id', rateListMasterController.deleteRateListMaster);

module.exports = router;
