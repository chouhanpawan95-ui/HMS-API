// routes/cityRoutes.js
const express = require('express');
const router = express.Router();
const cityController = require('../controllers/cityController');

router.post('/', cityController.createCity);         // create
router.get('/', cityController.getCities);           // list with optional q, page, limit
router.get('/next-id', cityController.getNextCityId); // get next cityId
router.get('/:id', cityController.getCityById);      // get by mongo _id or cityId
router.put('/:id', cityController.updateCity);       // update by id or cityId
router.delete('/:id', cityController.deleteCity);    // delete

module.exports = router;
