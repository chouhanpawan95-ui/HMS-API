// routes/userauthtypemenupermissiondetailRoutes.js
const express = require('express');
const router = express.Router();
const userauthtypemenupermissiondetailController = require('../controllers/userauthtypemenupermissiondetailController');

router.post('/', userauthtypemenupermissiondetailController.createMenuPermissionDetail);           // create
router.get('/', userauthtypemenupermissiondetailController.getMenuPermissionDetails);             // list with optional q, page, limit
router.get('/next-id', userauthtypemenupermissiondetailController.getNextUPMenuDetailId);  // get next PK_UPMenuDetailId
router.get('/:id', userauthtypemenupermissiondetailController.getMenuPermissionDetailById);        // get by mongo _id or PK_UPMenuDetailId
router.put('/:id', userauthtypemenupermissiondetailController.updateMenuPermissionDetail);         // update by id or PK_UPMenuDetailId
router.delete('/:id', userauthtypemenupermissiondetailController.deleteMenuPermissionDetail);      // delete

module.exports = router;