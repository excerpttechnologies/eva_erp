const InvoiceCategory = require('../../models/categories/InvoiceCategory');

// @desc    Create new invoice category
// @route   POST /api/invoicecategory
// @access  Public
const createInvoiceCategory = async (req, res) => {
  try {
    const { categoryName, companyId,rangeStart, rangeEnd } = req.body;

    if (!categoryName || rangeStart === undefined || rangeEnd === undefined) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const category = new InvoiceCategory(req.body);
    await category.save();

    res.status(201).json({ message: 'Invoice Category created successfully', category });
  } catch (error) {
    console.error('Error creating invoice category:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get all invoice categories
// @route   GET /api/invoicecategory
const getAllInvoiceCategories = async (req, res) => {
  try {
    const { companyId } = req.query;

    const categories = await InvoiceCategory.find({ companyId });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// @desc    Update an invoice category
// @route   PUT /api/invoicecategory/:id
const updateInvoiceCategory = async (req, res) => {
  try {
    const { categoryName, prefix, rangeStart, rangeEnd } = req.body;

    const updated = await InvoiceCategory.findByIdAndUpdate(
      req.params.id,
      { categoryName, prefix, rangeStart, rangeEnd },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category updated successfully', category: updated });
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(500).json({ error: 'Failed to update category' });
  }
};

module.exports = {
  createInvoiceCategory,
  getAllInvoiceCategories,
  updateInvoiceCategory
};
