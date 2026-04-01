// // const Lead = require('../../models/crm/Lead');
// // const Campaign = require('../../models/crm/Campaign');

// // const leadController = {
// //   // Get all leads
// //   getLeads: async (req, res) => {
// //     try {
// //       const { companyId, financialYear,status } = req.query;
       
// //       const query={};
// //       if(companyId){
// //         query.companyId=companyId
// //       }
// //       if(financialYear){
// //         query.financialYear=financialYear
// //       }
// //       if(status){
// //         query.leadStatus=status
// //       }
// //       const leads = await Lead.find(query)
// //         .populate('campaignId', 'campaignName')
// //         .sort({ createdAt: -1 });
      
// //       // res.json(leads);


// //       res.status(200).json(leads);
// //     } catch (error) {
// //       // res.status(500).json({ error: error.message });

// //  console.error("Error fetching leads:", error);
// //         res.status(500).json({ message: "Server error" });


// //     }
// //   },

// //   // Create new lead
// //   createLead: async (req, res) => {
// //     try {
// //       const lead = new Lead(req.body);
// //       await lead.save();
// //       await lead.populate('campaignId', 'campaignName');
      
// //       // Update campaign leads count if associated with a campaign
// //       if (lead.campaignId) {
// //         await Campaign.findByIdAndUpdate(
// //           lead.campaignId,
// //           { $inc: { leads: 1 } }
// //         );
// //       }
      
// //       res.status(201).json(lead);
// //     } catch (error) {
// //       res.status(400).json({ error: error.message });
// //     }
// //   },

// //   // Get lead by ID
// //   getLeadById: async (req, res) => {
// //     try {
// //       const lead = await Lead.findById(req.params.id).populate('campaignId', 'campaignName');
// //       if (!lead) {
// //         return res.status(404).json({ error: 'Lead not found' });
// //       }
// //       res.json(lead);
// //     } catch (error) {
// //       res.status(500).json({ error: error.message });
// //     }
// //   },

// //   // Update lead
// //   updateLead: async (req, res) => {
// //     try {
// //       const oldLead = await Lead.findById(req.params.id);
// //       const oldCampaignId = oldLead?.campaignId;
// //       const oldStatus = oldLead?.leadStatus;
      
// //       const lead = await Lead.findByIdAndUpdate(
// //         req.params.id,
// //         req.body,
// //         { new: true, runValidators: true }
// //       ).populate('campaignId', 'campaignName');
      
// //       if (!lead) {
// //         return res.status(404).json({ error: 'Lead not found' });
// //       }

// //       // Update campaign counts if campaign changed
// //       if (oldCampaignId && oldCampaignId.toString() !== req.body.campaignId) {
// //         // Decrease count from old campaign
// //         await Campaign.findByIdAndUpdate(oldCampaignId, { $inc: { leads: -1 } });
// //       }
      
// //       if (req.body.campaignId && req.body.campaignId !== oldCampaignId?.toString()) {
// //         // Increase count for new campaign
// //         await Campaign.findByIdAndUpdate(req.body.campaignId, { $inc: { leads: 1 } });
// //       }

// //       // Update conversion count if status changed to "Closed Won"
// //       if (oldStatus !== 'Closed Won' && req.body.leadStatus === 'Closed Won' && lead.campaignId) {
// //         await Campaign.findByIdAndUpdate(lead.campaignId, { $inc: { conversions: 1 } });
// //       } else if (oldStatus === 'Closed Won' && req.body.leadStatus !== 'Closed Won' && lead.campaignId) {
// //         await Campaign.findByIdAndUpdate(lead.campaignId, { $inc: { conversions: -1 } });
// //       }
      
// //       res.json(lead);
// //     } catch (error) {
// //       res.status(400).json({ error: error.message });
// //     }
// //   },

// //   // Delete lead
// //   deleteLead: async (req, res) => {
// //     try {
// //       const lead = await Lead.findByIdAndDelete(req.params.id);
// //       if (!lead) {
// //         return res.status(404).json({ error: 'Lead not found' });
// //       }

// //       // Decrease campaign leads count if associated with a campaign
// //       if (lead.campaignId) {
// //         await Campaign.findByIdAndUpdate(
// //           lead.campaignId,
// //           { $inc: { leads: -1 } }
// //         );
        
// //         // Decrease conversions count if lead was converted
// //         if (lead.leadStatus === 'Closed Won') {
// //           await Campaign.findByIdAndUpdate(
// //             lead.campaignId,
// //             { $inc: { conversions: -1 } }
// //           );
// //         }
// //       }
      
// //       res.json({ message: 'Lead deleted successfully' });
// //     } catch (error) {
// //       res.status(500).json({ error: error.message });
// //     }
// //   },

// //   // Get leads by campaign
// //   getLeadsByCampaign: async (req, res) => {
// //     try {
// //       const { campaignId } = req.params;
// //       const { companyId, financialYear } = req.query;
      
// //       const leads = await Lead.find({ 
// //         campaignId, 
// //         companyId, 
// //         financialYear 
// //       }).populate('campaignId', 'campaignName');
      
// //       res.json(leads);
// //     } catch (error) {
// //       res.status(500).json({ error: error.message });
// //     }
// //   }
// // };

// // module.exports = leadController;










// const mongoose = require('mongoose');
// const Lead = require('../../models/crm/Lead');
// const Campaign = require('../../models/crm/Campaign');

// // Helper: sanitize request body before DB operations
// const sanitizeLeadBody = (body) => {
//   const sanitized = { ...body };

//   // If campaignId is empty string, null, or "undefined" string — remove it
//   // so Mongoose doesn't try to cast "" to ObjectId (causes 400 CastError)
//   if (
//     !sanitized.campaignId ||
//     sanitized.campaignId === '' ||
//     sanitized.campaignId === 'undefined' ||
//     sanitized.campaignId === 'null'
//   ) {
//     delete sanitized.campaignId;
//   }

//   // Sanitize numeric fields — convert empty strings to 0
//   ['annualRevenue', 'expectedDealValue', 'leadScore'].forEach((field) => {
//     if (sanitized[field] === '' || sanitized[field] === undefined) {
//       if (field === 'leadScore') sanitized[field] = 50;
//       else sanitized[field] = 0;
//     } else {
//       sanitized[field] = Number(sanitized[field]);
//     }
//   });

//   // Sanitize expectedCloseDate — remove if empty string
//   if (!sanitized.expectedCloseDate || sanitized.expectedCloseDate === '') {
//     delete sanitized.expectedCloseDate;
//   }

//   return sanitized;
// };

// const leadController = {
//   // ─── Get All Leads ────────────────────────────────────────────────────────────
//   getLeads: async (req, res) => {
//     try {
//       const { companyId, financialYear, status } = req.query;

//       const query = {};
//       if (companyId) query.companyId = companyId;
//       if (financialYear) query.financialYear = financialYear;
//       if (status) query.leadStatus = status;

//       const leads = await Lead.find(query)
//         .populate('campaignId', 'campaignName')
//         .sort({ createdAt: -1 });

//       res.status(200).json(leads);
//     } catch (error) {
//       console.error('Error fetching leads:', error);
//       res.status(500).json({ message: 'Server error', error: error.message });
//     }
//   },

//   // ─── Create New Lead ──────────────────────────────────────────────────────────
//   createLead: async (req, res) => {
//     try {
//       const body = sanitizeLeadBody(req.body);

//       const lead = new Lead(body);
//       await lead.save();
//       await lead.populate('campaignId', 'campaignName');

//       // Update campaign leads count if associated with a campaign
//       if (lead.campaignId) {
//         await Campaign.findByIdAndUpdate(lead.campaignId, { $inc: { leads: 1 } });
//       }

//       res.status(201).json(lead);
//     } catch (error) {
//       console.error('Error creating lead:', error);
//       res.status(400).json({
//         message: 'Failed to create lead',
//         error: error.message,
//         // Show per-field validation errors if any
//         details: error.errors
//           ? Object.fromEntries(
//               Object.entries(error.errors).map(([k, v]) => [k, v.message])
//             )
//           : undefined,
//       });
//     }
//   },

//   // ─── Get Lead By ID ───────────────────────────────────────────────────────────
//   getLeadById: async (req, res) => {
//     try {
//       if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//         return res.status(400).json({ error: 'Invalid lead ID format' });
//       }

//       const lead = await Lead.findById(req.params.id).populate('campaignId', 'campaignName');
//       if (!lead) {
//         return res.status(404).json({ error: 'Lead not found' });
//       }

//       res.status(200).json(lead);
//     } catch (error) {
//       console.error('Error fetching lead by ID:', error);
//       res.status(500).json({ message: 'Server error', error: error.message });
//     }
//   },

//   // ─── Update Lead ──────────────────────────────────────────────────────────────
//   updateLead: async (req, res) => {
//     try {
//       if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//         return res.status(400).json({ error: 'Invalid lead ID format' });
//       }

//       const body = sanitizeLeadBody(req.body);

//       const oldLead = await Lead.findById(req.params.id);
//       if (!oldLead) {
//         return res.status(404).json({ error: 'Lead not found' });
//       }

//       const oldCampaignId = oldLead.campaignId?.toString();
//       const oldStatus = oldLead.leadStatus;
//       const newCampaignId = body.campaignId?.toString();

//       const lead = await Lead.findByIdAndUpdate(req.params.id, body, {
//         new: true,
//         runValidators: true,
//       }).populate('campaignId', 'campaignName');

//       // ── Campaign count adjustments ──────────────────────────────────────────

//       const campaignChanged = oldCampaignId !== newCampaignId;

//       if (campaignChanged) {
//         // Remove lead count from old campaign
//         if (oldCampaignId) {
//           await Campaign.findByIdAndUpdate(oldCampaignId, { $inc: { leads: -1 } });

//           // Remove conversion if old campaign had a "Closed Won" lead
//           if (oldStatus === 'Closed Won') {
//             await Campaign.findByIdAndUpdate(oldCampaignId, { $inc: { conversions: -1 } });
//           }
//         }

//         // Add lead count to new campaign
//         if (newCampaignId) {
//           await Campaign.findByIdAndUpdate(newCampaignId, { $inc: { leads: 1 } });

//           // Add conversion if new status is "Closed Won"
//           if (body.leadStatus === 'Closed Won') {
//             await Campaign.findByIdAndUpdate(newCampaignId, { $inc: { conversions: 1 } });
//           }
//         }
//       } else if (newCampaignId) {
//         // Same campaign — only update conversions if status changed
//         const becameWon = oldStatus !== 'Closed Won' && body.leadStatus === 'Closed Won';
//         const lostWon = oldStatus === 'Closed Won' && body.leadStatus !== 'Closed Won';

//         if (becameWon) {
//           await Campaign.findByIdAndUpdate(newCampaignId, { $inc: { conversions: 1 } });
//         } else if (lostWon) {
//           await Campaign.findByIdAndUpdate(newCampaignId, { $inc: { conversions: -1 } });
//         }
//       }

//       res.status(200).json(lead);
//     } catch (error) {
//       console.error('Error updating lead:', error);
//       res.status(400).json({
//         message: 'Failed to update lead',
//         error: error.message,
//         details: error.errors
//           ? Object.fromEntries(
//               Object.entries(error.errors).map(([k, v]) => [k, v.message])
//             )
//           : undefined,
//       });
//     }
//   },

//   // ─── Delete Lead ──────────────────────────────────────────────────────────────
//   deleteLead: async (req, res) => {
//     try {
//       if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//         return res.status(400).json({ error: 'Invalid lead ID format' });
//       }

//       const lead = await Lead.findByIdAndDelete(req.params.id);
//       if (!lead) {
//         return res.status(404).json({ error: 'Lead not found' });
//       }

//       // Decrease campaign counts if lead had a campaign
//       if (lead.campaignId) {
//         await Campaign.findByIdAndUpdate(lead.campaignId, { $inc: { leads: -1 } });

//         if (lead.leadStatus === 'Closed Won') {
//           await Campaign.findByIdAndUpdate(lead.campaignId, { $inc: { conversions: -1 } });
//         }
//       }

//       res.status(200).json({ message: 'Lead deleted successfully' });
//     } catch (error) {
//       console.error('Error deleting lead:', error);
//       res.status(500).json({ message: 'Server error', error: error.message });
//     }
//   },

//   // ─── Get Leads By Campaign ────────────────────────────────────────────────────
//   getLeadsByCampaign: async (req, res) => {
//     try {
//       const { campaignId } = req.params;
//       const { companyId, financialYear } = req.query;

//       if (!mongoose.Types.ObjectId.isValid(campaignId)) {
//         return res.status(400).json({ error: 'Invalid campaign ID format' });
//       }

//       const query = { campaignId };
//       if (companyId) query.companyId = companyId;
//       if (financialYear) query.financialYear = financialYear;

//       const leads = await Lead.find(query)
//         .populate('campaignId', 'campaignName')
//         .sort({ createdAt: -1 });

//       res.status(200).json(leads);
//     } catch (error) {
//       console.error('Error fetching leads by campaign:', error);
//       res.status(500).json({ message: 'Server error', error: error.message });
//     }
//   },
// };

// module.exports = leadController;


















const mongoose = require('mongoose');
const Lead = require('../../models/crm/Lead');
const Campaign = require('../../models/crm/Campaign');

// Valid leadStatus enum values (must match schema)
const VALID_LEAD_STATUSES = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

// Helper: sanitize request body before DB operations
const sanitizeLeadBody = (body) => {
  const sanitized = { ...body };

  // Strip campaignId if empty/null/undefined string
  if (
    !sanitized.campaignId ||
    sanitized.campaignId === '' ||
    sanitized.campaignId === 'undefined' ||
    sanitized.campaignId === 'null'
  ) {
    delete sanitized.campaignId;
  }

  // Strip financialYear if empty/null/undefined string
  if (
    !sanitized.financialYear ||
    sanitized.financialYear === 'null' ||
    sanitized.financialYear === 'undefined' ||
    sanitized.financialYear === ''
  ) {
    delete sanitized.financialYear;
  }

  // Sanitize numeric fields
  ['annualRevenue', 'expectedDealValue', 'leadScore'].forEach((field) => {
    if (sanitized[field] === '' || sanitized[field] === undefined) {
      sanitized[field] = field === 'leadScore' ? 50 : 0;
    } else {
      sanitized[field] = Number(sanitized[field]);
    }
  });

  // Strip expectedCloseDate if empty
  if (!sanitized.expectedCloseDate || sanitized.expectedCloseDate === '') {
    delete sanitized.expectedCloseDate;
  }

  // Normalize legacy leadStatus values that are no longer in the enum
  if (sanitized.leadStatus && !VALID_LEAD_STATUSES.includes(sanitized.leadStatus)) {
    const legacyMap = {
      'Proposal Submitted': 'Proposal',
      'Won':                'Closed Won',
      'Lost':               'Closed Lost',
      'In Progress':        'Negotiation',
    };
    sanitized.leadStatus = legacyMap[sanitized.leadStatus] || 'New';
  }

  return sanitized;
};

const leadController = {
  // ─── Get All Leads ────────────────────────────────────────────────────────────
  getLeads: async (req, res) => {
    try {
      const { companyId, financialYear, status } = req.query;

      const query = {};
      if (companyId) query.companyId = companyId;
      if (financialYear && financialYear !== 'null' && financialYear !== 'undefined') {
        query.financialYear = financialYear;
      }
      if (status) query.leadStatus = status;

      const leads = await Lead.find(query)
        .populate('campaignId', 'campaignName')
        .sort({ createdAt: -1 });

      res.status(200).json(leads);
    } catch (error) {
      console.error('Error fetching leads:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // ─── Create New Lead ──────────────────────────────────────────────────────────
  createLead: async (req, res) => {
    try {
      const body = sanitizeLeadBody(req.body);

      const lead = new Lead(body);
      await lead.save();
      await lead.populate('campaignId', 'campaignName');

      if (lead.campaignId) {
        await Campaign.findByIdAndUpdate(lead.campaignId, { $inc: { leads: 1 } });
      }

      res.status(201).json(lead);
    } catch (error) {
      console.error('Error creating lead:', error);
      res.status(400).json({
        message: 'Failed to create lead',
        error: error.message,
        details: error.errors
          ? Object.fromEntries(Object.entries(error.errors).map(([k, v]) => [k, v.message]))
          : undefined,
      });
    }
  },

  // ─── Get Lead By ID ───────────────────────────────────────────────────────────
  getLeadById: async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: 'Invalid lead ID format' });
      }

      const lead = await Lead.findById(req.params.id).populate('campaignId', 'campaignName');
      if (!lead) return res.status(404).json({ error: 'Lead not found' });

      res.status(200).json(lead);
    } catch (error) {
      console.error('Error fetching lead by ID:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // ─── Update Lead ──────────────────────────────────────────────────────────────
  updateLead: async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: 'Invalid lead ID format' });
      }

      const body = sanitizeLeadBody(req.body);

      const oldLead = await Lead.findById(req.params.id);
      if (!oldLead) return res.status(404).json({ error: 'Lead not found' });

      // Preserve financialYear from DB if not supplied in request
      if (!body.financialYear) {
        body.financialYear = oldLead.financialYear;
      }

      const oldCampaignId = oldLead.campaignId?.toString();
      const oldStatus     = oldLead.leadStatus;
      const newCampaignId = body.campaignId?.toString();

      // ⚠️ runValidators: false — intentional.
      // Old documents in MongoDB may have legacy enum values (e.g. "Proposal Submitted")
      // that no longer exist in the schema. With runValidators: true, Mongoose validates
      // ALL fields on the document including ones we didn't touch, causing a 400 error.
      // We manually sanitize and validate the incoming body above, so this is safe.
      const lead = await Lead.findByIdAndUpdate(
        req.params.id,
        { $set: body },
        { new: true, runValidators: false }
      ).populate('campaignId', 'campaignName');

      // ── Campaign count adjustments ──────────────────────────────────────────
      const campaignChanged = oldCampaignId !== newCampaignId;

      if (campaignChanged) {
        if (oldCampaignId) {
          await Campaign.findByIdAndUpdate(oldCampaignId, { $inc: { leads: -1 } });
          if (oldStatus === 'Closed Won') {
            await Campaign.findByIdAndUpdate(oldCampaignId, { $inc: { conversions: -1 } });
          }
        }
        if (newCampaignId) {
          await Campaign.findByIdAndUpdate(newCampaignId, { $inc: { leads: 1 } });
          if (body.leadStatus === 'Closed Won') {
            await Campaign.findByIdAndUpdate(newCampaignId, { $inc: { conversions: 1 } });
          }
        }
      } else if (newCampaignId) {
        const becameWon = oldStatus !== 'Closed Won' && body.leadStatus === 'Closed Won';
        const lostWon   = oldStatus === 'Closed Won' && body.leadStatus !== 'Closed Won';

        if (becameWon) {
          await Campaign.findByIdAndUpdate(newCampaignId, { $inc: { conversions: 1 } });
        } else if (lostWon) {
          await Campaign.findByIdAndUpdate(newCampaignId, { $inc: { conversions: -1 } });
        }
      }

      res.status(200).json(lead);
    } catch (error) {
      console.error('Error updating lead:', error);
      res.status(400).json({
        message: 'Failed to update lead',
        error: error.message,
        details: error.errors
          ? Object.fromEntries(Object.entries(error.errors).map(([k, v]) => [k, v.message]))
          : undefined,
      });
    }
  },

  // ─── Delete Lead ──────────────────────────────────────────────────────────────
  deleteLead: async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: 'Invalid lead ID format' });
      }

      const lead = await Lead.findByIdAndDelete(req.params.id);
      if (!lead) return res.status(404).json({ error: 'Lead not found' });

      if (lead.campaignId) {
        await Campaign.findByIdAndUpdate(lead.campaignId, { $inc: { leads: -1 } });
        if (lead.leadStatus === 'Closed Won') {
          await Campaign.findByIdAndUpdate(lead.campaignId, { $inc: { conversions: -1 } });
        }
      }

      res.status(200).json({ message: 'Lead deleted successfully' });
    } catch (error) {
      console.error('Error deleting lead:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // ─── Get Leads By Campaign ────────────────────────────────────────────────────
  getLeadsByCampaign: async (req, res) => {
    try {
      const { campaignId } = req.params;
      const { companyId, financialYear } = req.query;

      if (!mongoose.Types.ObjectId.isValid(campaignId)) {
        return res.status(400).json({ error: 'Invalid campaign ID format' });
      }

      const query = { campaignId };
      if (companyId) query.companyId = companyId;
      if (financialYear && financialYear !== 'null' && financialYear !== 'undefined') {
        query.financialYear = financialYear;
      }

      const leads = await Lead.find(query)
        .populate('campaignId', 'campaignName')
        .sort({ createdAt: -1 });

      res.status(200).json(leads);
    } catch (error) {
      console.error('Error fetching leads by campaign:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
};

module.exports = leadController;