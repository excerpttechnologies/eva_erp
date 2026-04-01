const express = require('express');
const router = express.Router();
const taxController = require('../../controllers/masterdata/Tax');

router.post('/', taxController.createTax);
router.get('/', taxController.getTaxes);
router.put('/:id', taxController.updateTax);
router.delete('/:id', taxController.deleteTax);

module.exports = router;
