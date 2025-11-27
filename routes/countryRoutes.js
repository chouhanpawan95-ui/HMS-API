// routes/countryRoutes.js

const express = require("express");
const router = express.Router();
const controller = require("../controllers/countryController");

router.get("/", controller.getCountries);
router.get("/:id", controller.getCountryById);
router.post("/", controller.createCountry);
router.put("/:id", controller.updateCountry);
router.delete("/:id", controller.deleteCountry);

module.exports = router;
