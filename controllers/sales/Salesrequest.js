
const SalesRequest = require('../../models/sales/Salesrequest');
const Salecategory = require('../../models/categories/SalesReuestcat');

exports.createIndent = async (req, res) => {
  try {
    const { indentIdType, externalIndentId, categoryId, items, companyId, financialYear } = req.body;

    let indentId;
    // console.log('Received categoryId:', categoryId);
    // console.log('Received items createIndent:', req.body);

    const category = await Salecategory.findById(categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    // FIX 1: Use correct field names from schema (rangeStart, rangeEnd)
    if (indentIdType === 'external') {
      if (!externalIndentId || externalIndentId.trim() === '') {
        return res.status(400).json({ error: 'External Indent ID is required' });
      }
      if (externalIndentId.length > 50) {
        return res.status(400).json({ error: 'External Indent ID cannot exceed 50 characters' });
      }
      const validIdPattern = /^[A-Za-z0-9_-]+$/;
      if (!validIdPattern.test(externalIndentId)) {
        return res.status(400).json({ error: 'External Indent ID can only contain letters, numbers, hyphens, and underscores' });
      }
      
      indentId = externalIndentId;
      const existingExternal = await SalesRequest.findOne({ indentId: externalIndentId });
      if (existingExternal) {
        return res.status(409).json({ error: 'External Indent ID already exists' });
      }
    } 
    else if (indentIdType === 'internal') {
      // FIX 2: Use rangeStart instead of rangeFrom
      if (!category.rangeStart) {
        return res.status(400).json({ error: 'Category range start not defined' });
      }

      const rangeStart = category.rangeStart;
      
      // FIX 3: Find only internal indents for this category
      const existingIndents = await SalesRequest.find({
        categoryId,
        indentIdType: 'internal'  // Only get internal ones
      }).select('indentId');

      let nextNumber = rangeStart;

      if (existingIndents.length > 0) {
        console.log('Found existing indents:', existingIndents.length);
        
        // Extract numbers and find maximum
        const usedNumbers = existingIndents
          .map(indent => parseInt(indent.indentId, 10))
          .filter(num => !isNaN(num) && num >= rangeStart);

        if (usedNumbers.length > 0) {
          const maxUsedNumber = Math.max(...usedNumbers);
          console.log('Highest used number:', maxUsedNumber);
          nextNumber = maxUsedNumber + 1;
        }
      }

      // FIX 4: Use rangeEnd instead of rangeTo
      if (category.rangeEnd && nextNumber > category.rangeEnd) {
        return res.status(400).json({ 
          error: `Indent number exceeded category range. Next: ${nextNumber}, Max: ${category.rangeEnd}` 
        });
      }

      indentId = nextNumber.toString().padStart(6, '0');

      // Double-check uniqueness
      const existingIndent = await SalesRequest.findOne({ indentId, categoryId });
      if (existingIndent) {
        return res.status(409).json({ error: `Indent ID ${indentId} already exists` });
      }
    }

    // Create the new indent with all required fields
    const newIndent = new SalesRequest({
      indentId,
      categoryId,
      categoryName: category.categoryName,
      indentIdType,
      location: req.body.location,
      salesGroup: req.body.buyerGroup || req.body.salesGroup,
      documentDate: req.body.documentDate || new Date(),
      companyId,
      financialYear,
      items: items.map(item => ({
        ...item,
        qty: Number(item.qty)
      })),
    });

    await newIndent.save();
    console.log('New indent created with ID:', newIndent.indentId);
    res.status(201).json({ message: 'Indent created successfully', indentId });
    
  } catch (err) {
    console.error('Error in createIndent:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// FIX 5: Fix getAllIndents with better error handling
exports.getAllIndents = async (req, res) => { 
  try {
    const { companyId, financialYear } = req.query;
    console.log('Fetching all indents for companyId:', companyId, 'and financialYear:', financialYear);
    
    const filter = {};
    if (companyId) filter.companyId = companyId;
    if (financialYear) filter.financialYear = financialYear;
    
    // FIX 6: Remove isDeleted/isBlocked filter to show all records
    // Don't filter out deleted/blocked records in the main list
    
    const allIndents = await SalesRequest.find(filter)
      .sort({ createdAt: -1 })
      .lean();
    
    console.log('Fetched indents count:', allIndents.length);
    
    // Log first few for debugging
    if (allIndents.length > 0) {
      console.log('Sample indent IDs:', allIndents.slice(0, 3).map(i => i.indentId));
    }
    
    res.status(200).json(allIndents);
  } catch (err) {
    console.error('Error in getAllIndents:', err);
    res.status(500).json({ message: 'Failed to fetch indents', error: err.message });
  }
};

// Update indent status
exports.updateIndent_Status = async (req, res) => { 
  try {
    const { id } = req.params;
    const updateData = req.body;
  
    const indent = await SalesRequest.findByIdAndUpdate(
      id, 
      { $set: updateData }, 
      { new: true }
    );
 
    res.status(200).json({ 
      message: `Status updated for indent ${id}`,
      indent 
    });
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ message: 'Failed to update indent status', error: err.message });
  }
};