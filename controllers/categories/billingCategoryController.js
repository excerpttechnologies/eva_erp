// const BillingCategory = require('../../models/categories/BillingCategory');

// // @desc    Create new billing category
// const createBillingCategory = async (req, res) => {
//   try {
//     const { categoryName,  rangeStart, rangeEnd } = req.body;
//     if (!categoryName ||  rangeStart === undefined || rangeEnd === undefined) {
//       return res.status(400).json({ error: 'All fields are required' });
//     }

//     const category = new BillingCategory(req.body);
//     await category.save();
//     res.status(201).json({ message: 'Billing Category created successfully', category });
//   } catch (error) {
//     console.error('Error creating billing category:', error);
//     res.status(500).json({ error: 'Server error' });
//   }
// };

// // @desc    Get all billing categories
// const getAllBillingCategories = async (req, res) => {
//   try {
//     const categories = await BillingCategory.find();
//     res.json(categories);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch categories' });
//   }
// };

// // @desc    Update a billing category
// const updateBillingCategory = async (req, res) => {
//   try {
//     const { categoryName, prefix, rangeStart, rangeEnd } = req.body;
//     const updated = await BillingCategory.findByIdAndUpdate(
//       req.params.id,
//       { categoryName, prefix, rangeStart, rangeEnd },
//       { new: true }
//     );

//     if (!updated) return res.status(404).json({ error: 'Category not found' });

//     res.json({ message: 'Category updated successfully', category: updated });
//   } catch (err) {
//     console.error('Error updating billing category:', err);
//     res.status(500).json({ error: 'Failed to update category' });
//   }
// };

// module.exports = {
//   createBillingCategory,
//   getAllBillingCategories,
//   updateBillingCategory
// };








const BillingCategory = require('../../models/categories/BillingCategory');

// ✅ CREATE
const createBillingCategory = async (req, res) => {
  try {
    const { categoryName, prefix, rangeStart, rangeEnd, companyId, financialYear } = req.body;

    if (!categoryName || rangeStart === undefined || rangeEnd === undefined) {
      return res.status(400).json({ error: 'Category, rangeStart, rangeEnd required' });
    }

    const category = new BillingCategory({
      categoryName,
      prefix: prefix || '', // ✅ safe default
      rangeStart,
      rangeEnd,
      companyId,
      financialYear
    });

    await category.save();

    res.status(201).json({
      message: 'Billing Category created successfully',
      category
    });

  } catch (error) {
    console.error('Error creating billing category:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


// ✅ GET ALL (WITH FILTER 🔥 VERY IMPORTANT)
const getAllBillingCategories = async (req, res) => {
  try {
    const { companyId, financialYear } = req.query;

    const query = {};

    if (companyId && companyId !== "null") {
      query.companyId = companyId;
    }

    if (financialYear && financialYear !== "null") {
      query.financialYear = financialYear;
    }

    console.log("🔥 Billing Query:", query);

    const categories = await BillingCategory
      .find(query)
      .sort({ createdAt: -1 });

    res.json(categories);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};


// ✅ UPDATE
const updateBillingCategory = async (req, res) => {
  try {
    const { categoryName, prefix, rangeStart, rangeEnd, financialYear } = req.body;

    const updated = await BillingCategory.findByIdAndUpdate(
      req.params.id,
      {
        categoryName,
        prefix,
        rangeStart,
        rangeEnd,
        financialYear // ✅ added
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({
      message: 'Category updated successfully',
      category: updated
    });

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
