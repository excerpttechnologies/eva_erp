// const Tax = require('../../models/masterdata/Tax');

// // Create new tax entry
// // exports.createTax = async (req, res) => {
// //   try {
// //     const { taxCode, taxName, cgst, sgst, igst, companyId, financialYear } = req.body;
// //     console.log("Creating tax entry:", req.body);
// //     if (!taxCode || !taxName || !cgst || !sgst  || !companyId || !financialYear) {
// //       return res.status(400).json({ error: 'All fields are required' });
// //     }
      
// //     const tax = new Tax(req.body);

    
// //     await tax.save();
// //     res.status(201).json({ message: 'Tax added successfully', tax });
// //   } catch (err) {
// //     console.error('Create Tax Error:', err);
// //     res.status(500).json({ error: 'Server error' });
// //   }
// // };

// // exports.createTax = async (req, res) => {
// //   try {
// //     const { taxName, percentage, companyId, financialYear } = req.body;

// //     if (!taxName || !percentage || !companyId) {
// //       return res.status(400).json({ message: "All required fields missing" });
// //     }

// //     const tax = new Tax({
// //       taxName,
// //       percentage,
// //       companyId,
// //       financialYear
// //     });

// //     await tax.save();

// //     res.status(201).json(tax);
// //   } catch (error) {
// //     res.status(400).json({ message: error.message });
// //   }
// // };


// exports.createTax = async (req, res) => {
//   try {
//     console.log("Incoming Tax Data:", req.body); // 👈 ADD THIS

//     const { taxName, taxRate, companyId, financialYear } = req.body;

//     if (!taxName || !taxRate || !companyId) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     const tax = new Tax({
//       taxName,
//       taxRate,
//       companyId,
//       financialYear
//     });

//     await tax.save();

//     res.status(201).json(tax);
//   } catch (error) {
//     console.error("Tax Error:", error);
//     res.status(400).json({ message: error.message });
//   }
// };

// // Get all tax entries
// exports.getTaxes = async (req, res) => {
//   try {
//     const { companyId, financialYear } = req.query;

//     const taxes = await Tax.find({ companyId, financialYear }).sort({ createdAt: -1 });
//     res.json(taxes);
//   } catch (err) { 
//     console.error('Get Taxes Error:', err);
//     res.status(500).json({ error: 'Failed to fetch taxes' });
//   }
// };

// // Update tax by ID
// exports.updateTax = async (req, res) => {
//   try {
//     const { taxCode, taxName, cgst, sgst, igst } = req.body;

//     const tax = await Tax.findByIdAndUpdate(
//       req.params.id,
//       { taxCode, taxName, cgst, sgst, igst },
//       { new: true }
//     );

//     if (!tax) return res.status(404).json({ error: 'Tax not found' });

//     res.json({ message: 'Tax updated successfully', tax });
//   } catch (err) {
//     console.error('Error updating tax:', err);
//     res.status(500).json({ error: 'Failed to update' });
//   }
// };







const Tax = require('../../models/masterdata/Tax');

// ─── CREATE ───────────────────────────────────────────────────────────────────
exports.createTax = async (req, res) => {
  try {
    console.log("Incoming Tax Data:", req.body);

    const { taxCode, taxName, cgst, sgst, igst, companyId, financialYear } = req.body;

    if (!taxCode || !taxName || !companyId) {
      return res.status(400).json({ message: "taxCode, taxName and companyId are required" });
    }

    // Must have either CGST+SGST or IGST
    if (!igst && (!cgst || !sgst)) {
      return res.status(400).json({ message: "Provide either CGST+SGST or IGST" });
    }

    const tax = new Tax({
      taxCode: taxCode.trim(),
      taxName: taxName.trim(),
      cgst: cgst || '0',
      sgst: sgst || '0',
      igst: igst || '',
      companyId,
      financialYear: financialYear || null,
    });

    await tax.save();
    res.status(201).json({ message: 'Tax added successfully', tax });
  } catch (err) {
    console.error('Create Tax Error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// ─── READ ALL ─────────────────────────────────────────────────────────────────
// FIX 3: Match by companyId always; match financialYear only when both sides are non-null
exports.getTaxes = async (req, res) => {
  try {
    const { companyId, financialYear } = req.query;

    if (!companyId) {
      return res.status(400).json({ message: "companyId is required" });
    }

    // Build query: always filter by companyId.
    // For financialYear: return records where financialYear matches OR is null/undefined,
    // so legacy records without a financialYear are always visible.
    const query = {
      companyId,
      $or: [
        { financialYear: financialYear || null },
        { financialYear: null },
        { financialYear: { $exists: false } },
      ],
    };

    const taxes = await Tax.find(query).sort({ createdAt: -1 });
    res.json(taxes);
  } catch (err) {
    console.error('Get Taxes Error:', err);
    res.status(500).json({ message: 'Failed to fetch taxes' });
  }
};

// ─── UPDATE ───────────────────────────────────────────────────────────────────
exports.updateTax = async (req, res) => {
  try {
    console.log("Update Tax Data:", req.body);

    const { taxCode, taxName, cgst, sgst, igst } = req.body;

    if (!taxCode || !taxName) {
      return res.status(400).json({ message: "taxCode and taxName are required" });
    }

    const tax = await Tax.findByIdAndUpdate(
      req.params.id,
      {
        taxCode: taxCode.trim(),
        taxName: taxName.trim(),
        cgst: cgst || '0',
        sgst: sgst || '0',
        igst: igst || '',
      },
      { new: true, runValidators: true }
    );

    if (!tax) return res.status(404).json({ message: 'Tax not found' });

    res.json({ message: 'Tax updated successfully', tax });
  } catch (err) {
    console.error('Update Tax Error:', err);
    res.status(500).json({ message: err.message || 'Failed to update' });
  }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────
exports.deleteTax = async (req, res) => {
  try {
    const tax = await Tax.findByIdAndDelete(req.params.id);
    if (!tax) return res.status(404).json({ message: 'Tax not found' });
    res.json({ message: 'Tax deleted successfully' });
  } catch (err) {
    console.error('Delete Tax Error:', err);
    res.status(500).json({ message: 'Failed to delete tax' });
  }
};