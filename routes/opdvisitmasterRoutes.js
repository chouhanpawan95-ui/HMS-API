// routes/opdvisitmasterRoutes.js
const express = require('express');
const router = express.Router();
const opdController = require('../controllers/opdvisitmasterController');
const verifyToken = require('../middleware/authMiddleware');

router.post('/', verifyToken, opdController.createOpdVisit); // create
router.get('/', verifyToken, opdController.getOpdVisits); // list
router.get('/:id', verifyToken, opdController.getOpdVisitById); // get by id or pkVisitId
router.put('/:id', verifyToken, opdController.updateOpdVisit); // update
router.delete('/:id', verifyToken, opdController.deleteOpdVisit); // delete

module.exports = router;
