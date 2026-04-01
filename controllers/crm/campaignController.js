// const Campaign = require('../../models/crm/Campaign');

// const campaignController = {
//   // Get all campaigns
//   getCampaigns: async (req, res) => {
//     try {
//       const { companyId, financialYear } = req.query;
//       const campaigns = await Campaign.find({ companyId, financialYear }).sort({ createdAt: -1 });
//       res.json(campaigns);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },

//   // Create new campaign
//   createCampaign: async (req, res) => {
//     try {
//       const campaign = new Campaign(req.body);
//       await campaign.save();
//       res.status(201).json(campaign);
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   },

//   // Get campaign by ID
//   getCampaignById: async (req, res) => {
//     try {
//       const campaign = await Campaign.findById(req.params.id);
//       if (!campaign) {
//         return res.status(404).json({ error: 'Campaign not found' });
//       }
//       res.json(campaign);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },

//   // Update campaign
//   updateCampaign: async (req, res) => {
//     try {
//       const campaign = await Campaign.findByIdAndUpdate(
//         req.params.id,
//         req.body,
//         { new: true, runValidators: true }
//       );
//       if (!campaign) {
//         return res.status(404).json({ error: 'Campaign not found' });
//       }
//       res.json(campaign);
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   },

//   // Delete campaign
//   deleteCampaign: async (req, res) => {
//     try {
//       const campaign = await Campaign.findByIdAndDelete(req.params.id);
//       if (!campaign) {
//         return res.status(404).json({ error: 'Campaign not found' });
//       }
//       res.json({ message: 'Campaign deleted successfully' });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   }
// };

// module.exports = campaignController;














// const Campaign = require('../../models/crm/Campaign');

// const campaignController = {
//   // GET /api/campaigns?companyId=&financialYear=
//   getCampaigns: async (req, res) => {
//     try {
//       const { companyId, financialYear } = req.query;

//       if (!companyId || !financialYear) {
//         return res.status(400).json({ error: 'companyId and financialYear are required query parameters' });
//       }

//       const campaigns = await Campaign.find({ companyId, financialYear }).sort({ createdAt: -1 });
//       res.json(campaigns);
//     } catch (error) {
//       console.error('getCampaigns error:', error);
//       res.status(500).json({ error: error.message });
//     }
//   },

//   // GET /api/campaigns/:id
//   getCampaignById: async (req, res) => {
//     try {
//       const campaign = await Campaign.findById(req.params.id);
//       if (!campaign) {
//         return res.status(404).json({ error: 'Campaign not found' });
//       }
//       res.json(campaign);
//     } catch (error) {
//       console.error('getCampaignById error:', error);
//       res.status(500).json({ error: error.message });
//     }
//   },

//   // POST /api/campaigns
//   createCampaign: async (req, res) => {
//     try {
//       const body = req.body;

//       // FIX: Validate required fields explicitly and return clear error messages
//       if (!body.campaignName || !body.campaignName.trim()) {
//         return res.status(400).json({ error: 'campaignName is required' });
//       }
//       if (!body.companyId) {
//         return res.status(400).json({ error: 'companyId is required' });
//       }
//       if (!body.financialYear) {
//         return res.status(400).json({ error: 'financialYear is required' });
//       }

//       // FIX: Sanitize numeric fields to avoid Mongoose CastError
//       const sanitized = sanitizeCampaignBody(body);

//       const campaign = new Campaign(sanitized);
//       await campaign.save();
//       res.status(201).json(campaign);
//     } catch (error) {
//       console.error('createCampaign error:', error);
//       // Return Mongoose validation messages clearly
//       if (error.name === 'ValidationError') {
//         const messages = Object.values(error.errors).map(e => e.message).join('; ');
//         return res.status(400).json({ error: messages });
//       }
//       res.status(400).json({ error: error.message });
//     }
//   },

//   // PUT /api/campaigns/:id
//   updateCampaign: async (req, res) => {
//     try {
//       const body = req.body;

//       // FIX: Sanitize numeric fields before update too
//       const sanitized = sanitizeCampaignBody(body);

//       const campaign = await Campaign.findByIdAndUpdate(
//         req.params.id,
//         sanitized,
//         { new: true, runValidators: true }
//       );

//       if (!campaign) {
//         return res.status(404).json({ error: 'Campaign not found' });
//       }
//       res.json(campaign);
//     } catch (error) {
//       console.error('updateCampaign error:', error);
//       if (error.name === 'ValidationError') {
//         const messages = Object.values(error.errors).map(e => e.message).join('; ');
//         return res.status(400).json({ error: messages });
//       }
//       res.status(400).json({ error: error.message });
//     }
//   },

//   // DELETE /api/campaigns/:id
//   deleteCampaign: async (req, res) => {
//     try {
//       const campaign = await Campaign.findByIdAndDelete(req.params.id);
//       if (!campaign) {
//         return res.status(404).json({ error: 'Campaign not found' });
//       }
//       res.json({ message: 'Campaign deleted successfully' });
//     } catch (error) {
//       console.error('deleteCampaign error:', error);
//       res.status(500).json({ error: error.message });
//     }
//   }
// };

// /**
//  * Sanitize campaign body — convert numeric string fields to Number
//  * and ensure array fields are actual arrays. This prevents Mongoose
//  * CastErrors when the frontend sends form values as strings.
//  */
// function sanitizeCampaignBody(body) {
//   const toNum = (val, fallback = 0) => {
//     const n = Number(val);
//     return isNaN(n) ? fallback : n;
//   };

//   const toArray = (val) => {
//     if (Array.isArray(val)) return val.filter(v => v && v.trim && v.trim().length > 0);
//     if (typeof val === 'string') return val.split(',').map(v => v.trim()).filter(v => v.length > 0);
//     return [];
//   };

//   return {
//     ...body,
//     budget: toNum(body.budget),
//     expectedROI: toNum(body.expectedROI),
//     actualROI: toNum(body.actualROI),
//     leads: toNum(body.leads),
//     conversions: toNum(body.conversions),
//     clickThroughRate: toNum(body.clickThroughRate),
//     openRate: toNum(body.openRate),
//     channels: toArray(body.channels),
//     objectives: Array.isArray(body.objectives)
//       ? body.objectives.filter(o => o && o.trim && o.trim().length > 0)
//       : (typeof body.objectives === 'string'
//           ? body.objectives.split('\n').map(o => o.trim()).filter(o => o.length > 0)
//           : [])
//   };
// }

// module.exports = campaignController;










const Campaign = require('../../models/crm/Campaign');

// Helper to sanitize and normalize request body
const sanitizeCampaignBody = (body) => {
  const sanitized = { ...body };

  // Convert channels from string to array if needed
  if (typeof sanitized.channels === 'string') {
    sanitized.channels = sanitized.channels
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);
  }

  // Convert objectives from string to array if needed
  if (typeof sanitized.objectives === 'string') {
    sanitized.objectives = sanitized.objectives
      .split('\n')
      .map(o => o.trim())
      .filter(Boolean);
  }

  // Convert numeric fields
  const numericFields = ['budget', 'expectedROI', 'actualROI', 'leads', 'conversions', 'clickThroughRate', 'openRate'];
  numericFields.forEach(field => {
    if (sanitized[field] !== undefined && sanitized[field] !== '') {
      sanitized[field] = Number(sanitized[field]);
    }
  });

  return sanitized;
};

const campaignController = {

  // GET ALL
  getCampaigns: async (req, res) => {
    try {
      const { companyId, financialYear } = req.query;

      if (!companyId) {
        return res.status(400).json({ error: 'companyId is required' });
      }

      const query = { companyId };

      if (financialYear && financialYear !== 'undefined' && financialYear !== 'null') {
        query.financialYear = financialYear;
      }

      const campaigns = await Campaign.find(query).sort({ createdAt: -1 });
      res.json(campaigns);
    } catch (error) {
      console.error('getCampaigns error:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // GET BY ID
  getCampaignById: async (req, res) => {
    try {
      const campaign = await Campaign.findById(req.params.id);
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // CREATE
  createCampaign: async (req, res) => {
    try {
      const body = req.body;

      if (!body.campaignName?.trim()) {
        return res.status(400).json({ error: 'campaignName is required' });
      }
      if (!body.companyId) {
        return res.status(400).json({ error: 'companyId is required' });
      }

      const campaign = new Campaign(sanitizeCampaignBody(body));
      await campaign.save();
      res.status(201).json(campaign);
    } catch (error) {
      console.error('createCampaign error:', error);
      res.status(400).json({ error: error.message });
    }
  },

  // UPDATE
  updateCampaign: async (req, res) => {
    try {
      const campaign = await Campaign.findByIdAndUpdate(
        req.params.id,
        sanitizeCampaignBody(req.body),
        { new: true, runValidators: true }
      );

      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      res.json(campaign);
    } catch (error) {
      console.error('updateCampaign error:', error);
      res.status(400).json({ error: error.message });
    }
  },

  // DELETE
  deleteCampaign: async (req, res) => {
    try {
      const campaign = await Campaign.findByIdAndDelete(req.params.id);
      if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
      }
      res.json({ message: 'Deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = campaignController; // ✅ THIS WAS MISSING