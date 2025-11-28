// routes/serviceRoutes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/serviceController");

router.post('/', controller.createService);           // create
router.get('/', controller.getServices);             // list with optional q, page, limit
router.get('/next-id', controller.getNextServiceId); // get next serviceId
router.get('/:id', controller.getServiceById);       // get by mongo _id or serviceId
router.put('/:id', controller.updateService);        // update by id or serviceId
router.delete('/:id', controller.deleteService);     // delete

module.exports = router;
