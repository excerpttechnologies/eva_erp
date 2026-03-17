const express = require('express');
const router = express.Router();
const indentController = require('../../controllers/sales/Salesrequest');

router.post('/create', indentController.createIndent);
router.get('/get', indentController.getAllIndents);
router.put('/status/:id', indentController.updateIndent_Status);

module.exports = router;