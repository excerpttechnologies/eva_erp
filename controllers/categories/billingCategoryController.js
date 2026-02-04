const BillingCategory = require('../../models/categories/BillingCategory');

// @desc    Create new billing category
const createBillingCategory = async (req, res) => {
  try {
    const { categoryName,  rangeStart, rangeEnd } = req.body;
    if (!categoryName ||  rangeStart === undefined || rangeEnd === undefined) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const category = new BillingCategory(req.body);
    await category.save();
    res.status(201).json({ message: 'Billing Category created successfully', category });
  } catch (error) {
    console.error('Error creating billing category:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get all billing categories
const getAllBillingCategories = async (req, res) => {
  try {
    const categories = await BillingCategory.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// @desc    Update a billing category
const updateBillingCategory = async (req, res) => {
  try {
    const { categoryName, prefix, rangeStart, rangeEnd } = req.body;
    const updated = await BillingCategory.findByIdAndUpdate(
      req.params.id,
      { categoryName, prefix, rangeStart, rangeEnd },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Category not found' });

    res.json({ message: 'Category updated successfully', category: updated });
  } catch (err) {
    console.error('Error updating billing category:', err);
    res.status(500).json({ error: 'Failed to update category' });
  }
};

module.exports = {
  createBillingCategory,
  getAllBillingCategories,
  updateBillingCategory
};
