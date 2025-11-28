// routes/districtRoutes.js
const express = require('express');
const router = express.Router();
const districtController = require('../controllers/districtController');

router.post('/', districtController.createDistrict);           // create
router.get('/', districtController.getDistricts);             // list with optional q, page, limit
router.get('/next-id', districtController.getNextDistrictId); // get next districtId
router.get('/:id', districtController.getDistrictById);       // get by mongo _id or districtId
router.put('/:id', districtController.updateDistrict);        // update by id or districtId
router.delete('/:id', districtController.deleteDistrict);     // delete

module.exports = router;
