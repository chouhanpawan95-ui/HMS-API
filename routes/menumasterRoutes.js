// routes/menumasterRoutes.js
const express = require('express');
const router = express.Router();
const menumasterController = require('../controllers/menumasterController');

router.post('/', menumasterController.createMenu);           // create
router.get('/', menumasterController.getMenus);             // list with optional q, page, limit
router.get('/next-id', menumasterController.getNextMenuId);  // get next PK_MenuId
router.get('/active', menumasterController.getActiveMenus);  // get active menus
router.get('/:id', menumasterController.getMenuById);        // get by mongo _id or PK_MenuId
router.put('/:id', menumasterController.updateMenu);         // update by id or PK_MenuId
router.delete('/:id', menumasterController.deleteMenu);      // delete

module.exports = router;