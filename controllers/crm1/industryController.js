// const Industry = require('../../models/crm/Industry');

// const industryController = {
//   // Get all industries
//   getIndustries: async (req, res) => {
//     try {
//       const { companyId, financialYear } = req.query;
//       const industries = await Industry.find({ companyId, financialYear }).sort({ createdAt: -1 });
//       res.json(industries);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },

//   // Create new industry
//   createIndustry: async (req, res) => {
//     try {
//       const industry = new Industry(req.body);
//       await industry.save();
//       res.status(201).json(industry);
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   },

//   // Get industry by ID
//   getIndustryById: async (req, res) => {
//     try {
//       const industry = await Industry.findById(req.params.id);
//       if (!industry) {
//         return res.status(404).json({ error: 'Industry not found' });
//       }
//       res.json(industry);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },

//   // Update industry
//   updateIndustry: async (req, res) => {
//     try {
//       const industry = await Industry.findByIdAndUpdate(
//         req.params.id,
//         req.body,
//         { new: true, runValidators: true }
//       );
//       if (!industry) {
//         return res.status(404).json({ error: 'Industry not found' });
//       }
//       res.json(industry);
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   },

//   // Delete industry
//   deleteIndustry: async (req, res) => {
//     try {
//       const industry = await Industry.findByIdAndDelete(req.params.id);
//       if (!industry) {
//         return res.status(404).json({ error: 'Industry not found' });
//       }
//       res.json({ message: 'Industry deleted successfully' });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   }
// };

// module.exports = industryController;













const Industry = require('../../models/crm/Industry');

const industryController = {

  // ✅ GET ALL (SAFE)
  getIndustries: async (req, res) => {
    try {
      let { companyId, financialYear } = req.query;

      const query = {};

      if (companyId && companyId !== "null" && companyId !== "undefined") {
        query.companyId = companyId;
      }

      if (
        financialYear &&
        financialYear !== "null" &&
        financialYear !== "undefined" &&
        financialYear !== ""
      ) {
        query.financialYear = financialYear.trim();
      }

      console.log("🔥 QUERY:", query);

      const industries = await Industry.find(query).sort({ createdAt: -1 });

      res.status(200).json(industries);

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // ✅ CREATE (FIXED)
  createIndustry: async (req, res) => {
    try {
      let { industryName, category, description, companyId, financialYear } = req.body;

      console.log("📥 BODY:", req.body);

      if (!companyId) {
        return res.status(400).json({ error: "CompanyId required" });
      }

      if (!industryName || !category) {
        return res.status(400).json({ error: "Name & Category required" });
      }

      const industry = new Industry({
        industryName: industryName.trim(),
        category,
        description: description || "",
        companyId,
        financialYear: financialYear || null   // ✅ FIX
      });

      await industry.save();

      res.status(201).json(industry);

    } catch (error) {
      console.error("❌ CREATE ERROR:", error.message);
      res.status(400).json({ error: error.message });
    }
  },

  // ✅ GET BY ID
  getIndustryById: async (req, res) => {
    try {
      const industry = await Industry.findById(req.params.id);
      if (!industry) return res.status(404).json({ error: 'Not found' });

      res.json(industry);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // ✅ UPDATE (FIXED)
  updateIndustry: async (req, res) => {
    try {
      const updateData = { ...req.body };

      if (
        updateData.financialYear === "" ||
        updateData.financialYear === "null" ||
        updateData.financialYear === undefined
      ) {
        updateData.financialYear = null;
      }

      const industry = await Industry.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!industry) {
        return res.status(404).json({ error: 'Not found' });
      }

      res.json(industry);

    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // ✅ DELETE
  deleteIndustry: async (req, res) => {
    try {
      const industry = await Industry.findByIdAndDelete(req.params.id);

      if (!industry) {
        return res.status(404).json({ error: 'Not found' });
      }

      res.json({ message: 'Deleted successfully' });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = industryController;