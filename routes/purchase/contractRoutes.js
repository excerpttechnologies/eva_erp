const express = require('express');
const router = express.Router();
const contractController = require('../../controllers/purchase/contractController');

// Test route - place this BEFORE any parameterized routes
router.get('/test', contractController.testApi);

// Create contract
router.post('/create', contractController.createContract);

// Get all contracts
router.get('/get', contractController.getAllContracts);

// Get contract by ID - this should come AFTER specific routes like /test and /get
router.get('/:id', contractController.getContractById);

// Update contract
router.put('/:id', contractController.updateContractById);

module.exports = router;