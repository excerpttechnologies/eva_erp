// const Milestone = require('../../models/crm/Milestone');

// const milestoneController = {
//   // Get all milestones
//   // getMilestones: async (req, res) => {
//   //   try {
//   //     const { companyId, financialYear } = req.query;
//   //     const milestones = await Milestone.find({ companyId, financialYear })
//   //       .populate('projectId', 'projectName')
//   //       .sort({ createdAt: -1 });
//   //     res.json(milestones);
//   //   } catch (error) {
//   //     res.status(500).json({ error: error.message });
//   //   }
//   // },

// getMilestones: async (req, res) => {
//   try {
//     const milestones = await Milestone.find();
//     console.log("🔥 BODY:", req.body);

//     console.log("🔥 TOTAL DATA:", milestones.length);
//     console.log("🔥 DATA:", milestones);

//     res.json(milestones);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: error.message });
//   }
// },
//   // Create new milestone
//   // createMilestone: async (req, res) => {
//   //   try {
//   //     const milestone = new Milestone(req.body);
//   //     await milestone.save();
//   //     await milestone.populate('projectId', 'projectName');
//   //     res.status(201).json(milestone);
//   //   } catch (error) {
//   //     res.status(400).json({ error: error.message });
//   //   }
//   // },

// // createMilestone: async (req, res) => {
// //   try {
// //     const data = {
// //       ...req.body,
// //       budget: Number(req.body.budget),
// //       completionPercentage: Number(req.body.completionPercentage),
// //       projectId: req.body.projectId?._id || req.body.projectId
// //     };

// //     console.log("🔥 CLEAN CREATE:", data);

// //     const milestone = new Milestone(data);
// //     await milestone.save();

// //     const populated = await Milestone.findById(milestone._id)
// //       .populate('projectId', 'projectName');

// //     res.status(201).json(populated);
// //   } catch (error) {
// //     console.error(error);
// //     res.status(400).json({ error: error.message });
// //   }
// // },


// createMilestone: async (req, res) => {
//   try {
//     const data = {
//       ...req.body,

//       // ✅ FIX types
//       budget: Number(req.body.budget),
//       completionPercentage: Number(req.body.completionPercentage),

//       // ✅ FIX projectId
//       projectId: req.body.projectId?._id || req.body.projectId,

//       // ✅ FIX date
//       dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,

//       // ✅ FIX array
//       deliverables: Array.isArray(req.body.deliverables)
//         ? req.body.deliverables
//         : []
//     };

//     console.log("🔥 CLEAN CREATE:", data);

//     const milestone = new Milestone(data);
//     await milestone.save();

//     const populated = await Milestone.findById(milestone._id)
//       .populate('projectId', 'projectName');

//     res.status(201).json(populated);

//   } catch (error) {
//     console.error("❌ CREATE ERROR:", error.message);
//     res.status(400).json({ error: error.message });
//   }
// },

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
//   // updateMilestone: async (req, res) => {
//   //   try {
//   //     const milestone = await Milestone.findByIdAndUpdate(
//   //       req.params.id,
//   //       req.body,
//   //       { new: true, runValidators: true }
//   //     ).populate('projectId', 'projectName');
//   //     if (!milestone) {
//   //       return res.status(404).json({ error: 'Milestone not found' });
//   //     }
//   //     res.json(milestone);
//   //   } catch (error) {
//   //     res.status(400).json({ error: error.message });
//   //   }
//   // },


// //   updateMilestone: async (req, res) => {
// //   try {
// //     const data = {
// //       ...req.body,
// //       budget: Number(req.body.budget),
// //       completionPercentage: Number(req.body.completionPercentage),
// //       projectId: req.body.projectId?._id || req.body.projectId
// //     };

// //     console.log("🔥 CLEAN UPDATE:", data);

// //     const milestone = await Milestone.findByIdAndUpdate(
// //       req.params.id,
// //       data,
// //       { new: true, runValidators: true }
// //     ).populate('projectId', 'projectName');

// //     res.json(milestone);
// //   } catch (error) {
// //     console.error(error);
// //     res.status(400).json({ error: error.message });
// //   }
// // },



// updateMilestone: async (req, res) => {
//   try {
//     const data = {
//       ...req.body,

//       budget: Number(req.body.budget),
//       completionPercentage: Number(req.body.completionPercentage),

//       projectId: req.body.projectId?._id || req.body.projectId,

//       dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,

//       deliverables: Array.isArray(req.body.deliverables)
//         ? req.body.deliverables
//         : []
//     };

//     console.log("🔥 CLEAN UPDATE:", data);

//     const milestone = await Milestone.findByIdAndUpdate(
//       req.params.id,
//       data,
//       { new: true, runValidators: true }
//     ).populate('projectId', 'projectName');

//     if (!milestone) {
//       return res.status(404).json({ error: 'Milestone not found' });
//     }

//     res.json(milestone);

//   } catch (error) {
//     console.error("❌ UPDATE ERROR:", error.message);
//     res.status(400).json({ error: error.message });
//   }
// },
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

  // ✅ GET ALL (OPTIONAL FILTER)
  getMilestones: async (req, res) => {
    try {
      const { companyId, financialYear } = req.query;

      const query = {};

      if (companyId) {
        query.companyId = companyId;
      }

      if (financialYear) {
        query.financialYear = financialYear;
      }

      const milestones = await Milestone.find(query)
        .populate('projectId', 'projectName')
        .sort({ createdAt: -1 });

      res.json(milestones);

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // ✅ CREATE
 // ✅ CREATE
createMilestone: async (req, res) => {
  try {
    const data = {
      milestoneName: req.body.milestoneName,
      description: req.body.description || "",

      projectId: req.body.projectId?._id || req.body.projectId,

      dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,

      status: req.body.status,
      priority: req.body.priority,

      deliverables: Array.isArray(req.body.deliverables)
        ? req.body.deliverables
        : [],

      budget: Number(req.body.budget) || 0,
      completionPercentage: Number(req.body.completionPercentage) || 0,

      companyId: req.body.companyId
    };

    // ✅ ONLY add financialYear if exists
    if (req.body.financialYear) {
      data.financialYear = req.body.financialYear;
    }

    console.log("🔥 CLEAN CREATE:", data);

    const milestone = new Milestone(data);
    await milestone.save();

    const populated = await Milestone.findById(milestone._id)
      .populate('projectId', 'projectName');

    res.status(201).json(populated);

  } catch (error) {
    console.error("❌ CREATE ERROR:", error.message);
    res.status(400).json({ error: error.message });
  }
},


// ✅ UPDATE
updateMilestone: async (req, res) => {
  try {
    const data = {
      milestoneName: req.body.milestoneName,
      description: req.body.description || "",

      projectId: req.body.projectId?._id || req.body.projectId,

      dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,

      status: req.body.status,
      priority: req.body.priority,

      deliverables: Array.isArray(req.body.deliverables)
        ? req.body.deliverables
        : [],

      budget: Number(req.body.budget) || 0,
      completionPercentage: Number(req.body.completionPercentage) || 0,

      companyId: req.body.companyId
    };

    // ✅ ONLY add if exists
    if (req.body.financialYear) {
      data.financialYear = req.body.financialYear;
    }

    console.log("🔥 CLEAN UPDATE:", data);

    const milestone = await Milestone.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true, runValidators: true }
    ).populate('projectId', 'projectName');

    if (!milestone) {
      return res.status(404).json({ error: 'Milestone not found' });
    }

    res.json(milestone);

  } catch (error) {
    console.error("❌ UPDATE ERROR:", error.message);
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

  // ✅ UPDATE
  updateMilestone: async (req, res) => {
    try {
      const data = {
        ...req.body,

        budget: Number(req.body.budget) || 0,
        completionPercentage: Number(req.body.completionPercentage) || 0,

        projectId: req.body.projectId?._id || req.body.projectId,

        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,

        deliverables: Array.isArray(req.body.deliverables)
          ? req.body.deliverables
          : [],

        financialYear: req.body.financialYear || null
      };

      const milestone = await Milestone.findByIdAndUpdate(
        req.params.id,
        data,
        { new: true, runValidators: true }
      ).populate('projectId', 'projectName');

      if (!milestone) {
        return res.status(404).json({ error: 'Milestone not found' });
      }

      res.json(milestone);

    } catch (error) {
      console.error("❌ UPDATE ERROR:", error.message);
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