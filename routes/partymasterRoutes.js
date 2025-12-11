const express = require('express');
const router = express.Router();
const partyController = require('../controllers/partymasterController');

router.post('/', partyController.createParty);
router.get('/', partyController.getParties);
router.get('/next-id', partyController.getNextPartyId);
router.get('/:id', partyController.getPartyById);
router.put('/:id', partyController.updateParty);
router.delete('/:id', partyController.deleteParty);

module.exports = router;
