// routes/districtRoutes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/districtController");

router.get("/", controller.getDistricts);
router.get("/:id", controller.getDistrictById);
router.post("/", controller.createDistrict);
router.put("/:id", controller.updateDistrict);
router.delete("/:id", controller.deleteDistrict);

module.exports = router;
