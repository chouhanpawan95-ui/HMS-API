// routes/countryRoutes.js
const express = require('express');
const router = express.Router();
const countryController = require('../controllers/countryController');

router.post('/', countryController.createCountry);           // create
router.get('/', countryController.getCountries);             // list with optional q, page, limit
router.get('/next-id', countryController.getNextCountryId);  // get next countryId
router.get('/:id', countryController.getCountryById);        // get by mongo _id or countryId
router.put('/:id', countryController.updateCountry);         // update by id or countryId
router.delete('/:id', countryController.deleteCountry);      // delete

module.exports = router;
