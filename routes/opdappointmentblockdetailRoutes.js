const express = require('express');
const router = express.Router();
const blockDetailController = require('../controllers/opdappointmentblockdetailController');

router.post('/', blockDetailController.createBlockDetail);
router.get('/', blockDetailController.getBlockDetails);
router.get('/next-id', blockDetailController.getNextTranId);
router.get('/:id', blockDetailController.getBlockDetailById);
router.put('/:id', blockDetailController.updateBlockDetail);
router.delete('/:id', blockDetailController.deleteBlockDetail);

module.exports = router;
