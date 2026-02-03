// routes/ipdregmasterRoutes.js
const express = require('express');
const router = express.Router();
const ipdController = require('../controllers/ipdregmasterController');

router.post('/', ipdController.createIpd);
router.get('/', ipdController.getIpds);
router.get('/next-id', ipdController.getNextIpdId);
router.get('/:id', ipdController.getIpdById);
router.put('/:id', ipdController.updateIpd);
router.delete('/:id', ipdController.deleteIpd);

module.exports = router;
