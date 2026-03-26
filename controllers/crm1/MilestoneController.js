// const Milestone = require('../../models/crm/Milestone');

// const milestoneController = {
//   // Get all milestones
//   getMilestones: async (req, res) => {
//     try {
//       const { companyId, financialYear } = req.query;
//       const milestones = await Milestone.find({ companyId, financialYear })
//         .populate('projectId', 'projectName')
//         .sort({ createdAt: -1 });
//       res.json(milestones);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },

//   // Create new milestone
//   createMilestone: async (req, res) => {
//     try {
//       const milestone = new Milestone(req.body);
//       await milestone.save();
//       await milestone.populate('projectId', 'projectName');
//       res.status(201).json(milestone);
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   },

//   // Get milestone by ID
//   getMilestoneById: async (req, res) => {
//     try {
//       const milestone = await Milestone.findById(req.params.id).populate('projectId', 'projectName');
//       if (!milestone) {
//         return res.status(404).json({ error: 'Milestone not found' });
//       }
//       res.json(milestone);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },

//   // Update milestone
//   updateMilestone: async (req, res) => {
//     try {
//       const milestone = await Milestone.findByIdAndUpdate(
//         req.params.id,
//         req.body,
//         { new: true, runValidators: true }
//       ).populate('projectId', 'projectName');
//       if (!milestone) {
//         return res.status(404).json({ error: 'Milestone not found' });
//       }
//       res.json(milestone);
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   },

//   // Delete milestone
//   deleteMilestone: async (req, res) => {
//     try {
//       const milestone = await Milestone.findByIdAndDelete(req.params.id);
//       if (!milestone) {
//         return res.status(404).json({ error: 'Milestone not found' });
//       }
//       res.json({ message: 'Milestone deleted successfully' });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   }
// };

// module.exports = milestoneController;






const Milestone = require('../../models/crm/Milestone');

const milestoneController = {

  // ✅ GET ALL (FIXED)
getMilestones: async (req, res) => {
  try {
    const { companyId, financialYear } = req.query;

    const query = {};

    if (companyId) query.companyId = companyId;

    if (financialYear) query.financialYear = financialYear;

    console.log("🔥 FINAL QUERY:", query);

    const milestones = await Milestone.find(query)
      .populate('projectId', 'projectName')
      .sort({ createdAt: -1 });

    res.json(milestones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
},

  // ✅ CREATE (FIXED)
  createMilestone: async (req, res) => {
    try {
      console.log("🔥 BODY:", req.body);

      const milestone = new Milestone(req.body);
      await milestone.save();

      const populated = await Milestone.findById(milestone._id)
        .populate('projectId', 'projectName');

      res.status(201).json(populated);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  },

  // ✅ GET BY ID
  getMilestoneById: async (req, res) => {
    try {
      const milestone = await Milestone.findById(req.params.id)
        .populate('projectId', 'projectName');

      if (!milestone) {
        return res.status(404).json({ error: 'Milestone not found' });
      }

      res.json(milestone);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // ✅ UPDATE (FIXED)
  updateMilestone: async (req, res) => {
    try {
      console.log("🔥 UPDATE BODY:", req.body);

      const milestone = await Milestone.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate('projectId', 'projectName');

      if (!milestone) {
        return res.status(404).json({ error: 'Milestone not found' });
      }

      res.json(milestone);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  },

  // ✅ DELETE
  deleteMilestone: async (req, res) => {
    try {
      const milestone = await Milestone.findByIdAndDelete(req.params.id);

      if (!milestone) {
        return res.status(404).json({ error: 'Milestone not found' });
      }

      res.json({ message: 'Milestone deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = milestoneController;