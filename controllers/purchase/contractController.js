const Contract = require('../../models/purchase/Contract');
const ContractCategory = require('../../models/categories/PurchaseContractCategoryModel');

// Generate Contract Number
async function generateCTNRNumber(categoryId) {
  try {
    // await Contract.collection.dropIndex("contractNumber_1")
    const category = await ContractCategory.findById(categoryId);
    if (!category) throw new Error('Contract Category not found');
    
    console.log('='.repeat(30));
    console.log('Generating number for category:', category.categoryName);
    console.log('Category range:', category.rangeFrom, 'to', category.rangeTo);
    
    // Find ALL contracts for this category
    const existingContracts = await Contract.find({ 
      contractCategoryId: categoryId
    }).select('contractNumber');
    
    console.log('Found contracts in category:', existingContracts.length);
    
    // Convert all existing contract numbers to numbers and filter by range
    const usedNumbers = existingContracts
      .map(contract => {
        // Parse the contract number - remove any non-numeric and convert to number
        const numStr = contract.contractNumber.toString().replace(/[^0-9]/g, '');
        const num = parseInt(numStr, 10);
        return { original: contract.contractNumber, parsed: num };
      })
      .filter(item => !isNaN(item.parsed) && item.parsed >= category.rangeFrom && item.parsed <= category.rangeTo)
      .map(item => item.parsed)
      .sort((a, b) => a - b);
    
    console.log('Used numbers in range:', usedNumbers);
    
    // If no numbers used yet, start from rangeFrom
    if (usedNumbers.length === 0) {
      console.log('No numbers used, starting from:', category.rangeFrom);
      return category.rangeFrom.toString();
    }
    
    // Find the first gap in the sequence
    let nextNumber = category.rangeFrom;
    
    for (let i = 0; i < usedNumbers.length; i++) {
      if (usedNumbers[i] !== nextNumber) {
        // Found a gap
        console.log(`Gap found: expected ${nextNumber}, got ${usedNumbers[i]}`);
        break;
      }
      nextNumber++;
    }
    
    console.log('Next available number:', nextNumber);
    
    // Check if we've exceeded the range
    if (nextNumber > category.rangeTo) {
      throw new Error(`Contract number range exhausted for category ${category.categoryName}. No numbers available between ${category.rangeFrom} and ${category.rangeTo}`);
    }
    
    // One final check
    const finalCheck = await Contract.findOne({ 
      contractNumber: nextNumber.toString(),
      contractCategoryId: categoryId
    });
    
    if (finalCheck) {
      console.log('Number still taken, searching sequentially...');
      
      // Sequential search from nextNumber+1
      for (let i = nextNumber + 1; i <= category.rangeTo; i++) {
        const checkExisting = await Contract.findOne({
          contractNumber: i.toString(),
          contractCategoryId: categoryId
        });
        
        if (!checkExisting) {
          console.log('Found available number:', i);
          return i.toString();
        }
      }
      
      throw new Error('No available numbers found after sequential search');
    }
    
    console.log('Generated number:', nextNumber);
    console.log('='.repeat(30));
    
    return nextNumber.toString();
    
  } catch (error) {
    console.error('Error in generateCTNRNumber:', error);
    throw error;
  }
}

// Create Contract
exports.createContract = async (req, res) => {
    try {
        const { contractGenType, externalContractNumber, ...otherData } = req.body;
        const contractCategoryId = req.body.categoryId;
        
        console.log('='.repeat(50));
        console.log('Creating contract with data:', {
            contractGenType,
            categoryId: contractCategoryId,
            externalContractNumber: externalContractNumber || 'N/A'
        });
        
        // Validate required fields
        if (!contractCategoryId) {
            return res.status(400).json({ error: 'Category ID is required' });
        }
        
        if (!otherData.companyId) {
            return res.status(400).json({ error: 'Company ID is required' });
        }
        
        let contractNumber;
   
        if (contractGenType === 'external') {
            if (!externalContractNumber || externalContractNumber.trim() === '') {
                return res.status(400).json({ error: 'External contract number is required' });
            }

            // Check if external contract number already exists for this category
            const existingContract = await Contract.findOne({
                contractNumber: externalContractNumber.trim(),
                contractCategoryId: contractCategoryId
            });

            if (existingContract) {
                return res.status(400).json({ 
                    error: 'Contract number already exists for this category',
                    details: `Contract number ${externalContractNumber.trim()} is already in use`
                });
            }

            contractNumber = externalContractNumber.trim();
        } else {
            // Internal generation
            try {
                contractNumber = await generateCTNRNumber(contractCategoryId);
                console.log('Successfully generated internal contract number:', contractNumber);
            } catch (genError) {
                console.error('Number generation error:', genError);
                return res.status(400).json({ 
                    error: 'Failed to generate contract number',
                    details: genError.message
                });
            }
        }

        // Create the contract
        const contractData = {
            contractNumber,
            contractCategoryId,
            contractGenType: contractGenType || 'internal',
            ...otherData
        };
        
        // Remove any undefined fields
        Object.keys(contractData).forEach(key => 
          contractData[key] === undefined && delete contractData[key]
        );
        
        console.log('Creating contract with number:', contractNumber);
        
        const contract = new Contract(contractData);

        await contract.save();
        
        console.log('Contract saved successfully with number:', contractNumber);
        console.log('='.repeat(50));
        
        res.status(201).json({
            message: 'Contract created successfully',
            contract,
            generationType: contractGenType
        });
        
    } catch (error) {
        console.error('Error creating contract:', error);

        if (error.code === 11000) {
            console.error('Duplicate key error details:', error.keyValue);
            
            // Return clear error message
            return res.status(400).json({ 
                error: 'Contract number already exists',
                details: `The number ${error.keyValue?.contractNumber} is already in use. Please try again.`
            });
        }

        res.status(500).json({ 
            error: 'Failed to create contract',
            details: error.message 
        });
    }
};

// Debug route to check numbers in a category
exports.checkCategoryNumbers = async (req, res) => {
    try {
        const { categoryId } = req.params;
        
        const contracts = await Contract.find({ contractCategoryId: categoryId })
            .select('contractNumber contractGenType createdAt')
            .sort({ contractNumber: 1 });
        
        const category = await ContractCategory.findById(categoryId);
        
        const numbers = contracts.map(c => ({
            number: c.contractNumber,
            type: c.contractGenType,
            date: c.createdAt
        }));
        
        // Find gaps
        const usedNumbers = contracts
            .map(c => parseInt(c.contractNumber.toString().replace(/[^0-9]/g, ''), 10))
            .filter(n => !isNaN(n))
            .sort((a, b) => a - b);
        
        const gaps = [];
        if (usedNumbers.length > 0 && category) {
            let expected = category.rangeFrom;
            for (let num of usedNumbers) {
                if (num < category.rangeFrom) continue;
                if (num > category.rangeTo) break;
                if (num > expected) {
                    gaps.push({ from: expected, to: num - 1 });
                }
                expected = num + 1;
            }
            if (expected <= category.rangeTo) {
                gaps.push({ from: expected, to: category.rangeTo });
            }
        }
        
        res.json({
            category: category?.categoryName || 'Unknown',
            range: category ? `${category.rangeFrom} - ${category.rangeTo}` : 'N/A',
            totalContracts: contracts.length,
            contracts: numbers,
            nextAvailable: gaps.length > 0 ? gaps[0].from : 'Range full',
            gaps: gaps
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Test route
exports.testApi = async (req, res) => {
  try {
    const totalContracts = await Contract.countDocuments();
    const categories = await ContractCategory.find();
    
    res.json({ 
      message: 'API is working', 
      timestamp: new Date().toISOString(),
      status: 'ok',
      stats: {
        totalContracts,
        totalCategories: categories.length
      }
    });
  } catch (error) {
    res.json({ 
      message: 'API is working', 
      timestamp: new Date().toISOString(),
      status: 'ok'
    });
  }
};

// Get All Contracts
exports.getAllContracts = async (req, res) => {
    try {
        const { companyId, financialYear } = req.query;

        const filter = {};
        if (companyId) filter.companyId = companyId;
        if (financialYear) filter.financialYear = financialYear;

        const contracts = await Contract.find(filter).populate('contractCategoryId', 'categoryName');
        res.json(contracts);
    } catch (error) {
        console.error('Error fetching contracts:', error);
        res.status(500).json({ error: 'Failed to fetch contracts' });
    }
};

// Get Contract by ID
exports.getContractById = async (req, res) => {
    try {
        const contract = await Contract.findById(req.params.id).populate('contractCategoryId', 'categoryName');
        if (!contract) return res.status(404).json({ message: 'Contract not found' });
        res.json(contract);
    } catch (error) {
        console.error('Error fetching contract:', error);
        res.status(500).json({ message: 'Failed to fetch contract' });
    }
};

// Update Contract
exports.updateContractById = async (req, res) => {
    try {
        const updatedContract = await Contract.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedContract) {
            return res.status(404).json({ message: 'Contract not found' });
        }

        res.json(updatedContract);
    } catch (error) {
        console.error('Error updating contract:', error);
        res.status(500).json({ message: 'Server error' });
    }
};