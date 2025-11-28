// routes/stateRoutes.js
const express = require('express');
const router = express.Router();
const stateController = require('../controllers/stateController');

router.post('/', stateController.createState);           // create
router.get('/', stateController.getStates);             // list with optional q, page, limit
router.get('/next-id', stateController.getNextStateId); // get next stateId
router.get('/:id', stateController.getStateById);       // get by mongo _id or stateId
router.put('/:id', stateController.updateState);        // update by id or stateId
router.delete('/:id', stateController.deleteState);     // delete

module.exports = router;
