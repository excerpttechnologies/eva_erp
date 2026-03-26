const Industry = require('../../models/crm/Industry');

const industryController = {
  // Get all industries
  // getIndustries: async (req, res) => {
  //   try {
  //     const { companyId, financialYear } = req.query;
  //     const industries = await Industry.find({ companyId, financialYear }).sort({ createdAt: -1 });
  //     res.json(industries);
  //   } catch (error) {
  //     res.status(500).json({ error: error.message });
  //   }
  // },

getIndustries: async (req, res) => {
  try {
    let { companyId, financialYear } = req.query;

    const query = {};

    if (companyId && companyId !== "null" && companyId !== "undefined") {
      query.companyId = companyId;
    }

    if (financialYear && financialYear !== "null" && financialYear !== "undefined") {
      query.financialYear = financialYear.trim();
    }

    console.log("🔥 QUERY:", query);

    const industries = await Industry.find(query).sort({ createdAt: -1 });

    res.json(industries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
},

  // Create new industry
  createIndustry: async (req, res) => {
    try {
      const industry = new Industry(req.body);
      await industry.save();
      res.status(201).json(industry);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get industry by ID
  getIndustryById: async (req, res) => {
    try {
      const industry = await Industry.findById(req.params.id);
      if (!industry) {
        return res.status(404).json({ error: 'Industry not found' });
      }
      res.json(industry);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update industry
  updateIndustry: async (req, res) => {
    try {
      const industry = await Industry.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!industry) {
        return res.status(404).json({ error: 'Industry not found' });
      }
      res.json(industry);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Delete industry
  deleteIndustry: async (req, res) => {
    try {
      const industry = await Industry.findByIdAndDelete(req.params.id);
      if (!industry) {
        return res.status(404).json({ error: 'Industry not found' });
      }
      res.json({ message: 'Industry deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = industryController;