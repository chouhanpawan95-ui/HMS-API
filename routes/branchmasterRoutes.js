// routes/branchmasterRoutes.js
const express = require('express');
const router = express.Router();
const branchmasterController = require('../controllers/branchmasterController');

router.post('/', branchmasterController.createBranch);           // create
router.get('/', branchmasterController.getBranches);             // list with optional q, page, limit
router.get('/next-id', branchmasterController.getNextBranchId);  // get next PK_BranchId
router.get('/active', branchmasterController.getActiveBranches);  // get active branches
router.get('/:id', branchmasterController.getBranchById);        // get by mongo _id or PK_BranchId
router.put('/:id', branchmasterController.updateBranch);         // update by id or PK_BranchId
router.delete('/:id', branchmasterController.deleteBranch);      // delete

module.exports = router;