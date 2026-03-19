// routes/userauthtypemasterRoutes.js
const express = require('express');
const router = express.Router();
const userauthtypemasterController = require('../controllers/userauthtypemasterController');

router.post('/', userauthtypemasterController.createAuthType);           // create
router.get('/', userauthtypemasterController.getAuthTypes);             // list with optional q, page, limit
router.get('/next-id', userauthtypemasterController.getNextAuthTypeId);  // get next PK_AuthTypeId
router.get('/active', userauthtypemasterController.getActiveAuthTypes);  // get active auth types
router.get('/:id', userauthtypemasterController.getAuthTypeById);        // get by mongo _id or PK_AuthTypeId
router.put('/:id', userauthtypemasterController.updateAuthType);         // update by id or PK_AuthTypeId
router.delete('/:id', userauthtypemasterController.deleteAuthType);      // delete

module.exports = router;