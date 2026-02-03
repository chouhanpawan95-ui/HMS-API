// routes/ipdregdetailRoutes.js
const express = require('express');
const router = express.Router();
const ipdDetailController = require('../controllers/ipdregdetailController');

router.post('/', ipdDetailController.createTran);
router.get('/', ipdDetailController.getTrans);
router.get('/next-id', ipdDetailController.getNextTranId);
router.get('/:id', ipdDetailController.getTranById);
router.put('/:id', ipdDetailController.updateTran);
router.delete('/:id', ipdDetailController.deleteTran);

module.exports = router;
