const Billing = require('../../models/accounts/Billing');
const BillingCategory = require('../../models/categories/BillingCategory');

// POST /api/Billingform
const createBilling = async (req, res) => {
  try {
    const data = req.body;

    if (!data.category) {
      return res.status(400).json({ message: "Category is required" });
    }

    const category = await BillingCategory.findOne({ categoryName: data.category });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const BillingCount = await Billing.countDocuments({ category: data.category });
    const nextNumber = category.rangeStart + BillingCount;

    if (category.rangeEnd && nextNumber > category.rangeEnd) {
      return res.status(400).json({ message: "Document number range exceeded for this category." });
    }

    const docnumber = `${nextNumber}`;

   const totalAmount = data.items?.reduce((sum, item) => {
      return sum + ((item.quantity || 0) * (item.price || 0));
    }, 0);

    const discount = parseFloat(data.discount || 0);

    // ✅ 2. Net amount after discount
    const netAmount = totalAmount - discount;

    const cgstPercent = parseFloat(data.cgst || 0);
    const sgstPercent = parseFloat(data.sgst || 0);
    const igstPercent = parseFloat(data.igst || 0);

    // ✅ 3. Calculate tax on discounted amount
    const cgstAmt = (cgstPercent / 100) * netAmount;
    const sgstAmt = (sgstPercent / 100) * netAmount;
    const igstAmt = (igstPercent / 100) * netAmount;

    // ✅ 4. Final total
    // const finalTotal = netAmount + cgstAmt + sgstAmt + igstAmt;

    const newBilling = new Billing({
      ...data,
      docnumber,
      
    })

    await newBilling.save();
    res.status(201).json({ message: "Billing created", docnumber });
  } catch (err) {
    console.error("Error creating Billing:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};


// GET /api/Billingform
const getAllBillings = async (req, res) => {
  const { companyId, financialYear } = req.query;
  try {
    const filter = {};
    if (companyId) filter.companyId = companyId;
    if (financialYear) filter.financialYear = financialYear;
    const Billings = await Billing.find(filter).sort({ createdAt: -1 }).populate("salesOrderId");
    res.json(Billings);
  } catch (err) {
    console.error("Error fetching Billings:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const updateBilling = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find the existing billing record
    const existingBilling = await Billing.findById(id);
    if (!existingBilling) {
      return res.status(404).json({ message: "Billing record not found" });
    }

    // Update the billing record
    const updatedBilling = await Billing.findByIdAndUpdate(
      id,
      {
        ...updateData,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate("salesOrderId");

    res.json({
      message: "Billing updated successfully",
      billing: updatedBilling
    });
  } catch (err) {
    console.error("Error updating billing:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

// GET /api/Billingform/:id - Get single billing record
const getBillingById = async (req, res) => {
  try {
    const { id } = req.params;
    const billing = await Billing.findById(id).populate("salesOrderId");
    
    if (!billing) {
      return res.status(404).json({ message: "Billing record not found" });
    }

    res.json(billing);
  } catch (err) {
    console.error("Error fetching billing:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};
module.exports = {
  createBilling,
  getAllBillings,
  updateBilling,
  getBillingById
};
