// const TimeEntry = require('../../models/crm/TimeEntry');

// const timeEntryController = {
//   // Get all time entries
//   // getTimeEntries: async (req, res) => {
//   //   try {
//   //     const { companyId, financialYear } = req.query;
//   //     const timeEntries = await TimeEntry.find({ companyId, financialYear })
//   //       .populate('projectId', 'projectName')
//   //       .populate('taskId', 'taskName')
//   //       .sort({ date: -1, createdAt: -1 });
//   //     res.json(timeEntries);
//   //   } catch (error) {
//   //     res.status(500).json({ error: error.message });
//   //   }
//   // },

// getTimeEntries: async (req, res) => {
//   try {
//     const { companyId, financialYear } = req.query;

//     const query = {};

//     if (companyId) query.companyId = companyId;
//     if (financialYear) query.financialYear = financialYear.trim();

//     const timeEntries = await TimeEntry.find(query)
//       .populate('projectId', 'projectName')
//       .populate('taskId', 'taskName')
//       .sort({ date: -1, createdAt: -1 });

//     res.json(timeEntries);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// },




// // createTimeEntry - FIXED
// createTimeEntry: async (req, res) => {
//   try {
//     const data = req.body;

//     // BUG WAS HERE: was deleting taskId when it existed (non-empty)
//     // Should delete only when it's empty/null/undefined
//     if (!data.taskId) {
//       delete data.taskId;
//     }

//     if (!data.financialYear) {
//       delete data.financialYear;
//     }

//     const timeEntry = new TimeEntry(data);
//     await timeEntry.save();
//     await timeEntry.populate([
//       { path: 'projectId', select: 'projectName' },
//       { path: 'taskId', select: 'taskName' }
//     ]);
//     res.status(201).json(timeEntry);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// },





//   // Get time entry by ID
//   getTimeEntryById: async (req, res) => {
//     try {
//       const timeEntry = await TimeEntry.findById(req.params.id)
//         .populate('projectId', 'projectName')
//         .populate('taskId', 'taskName');
//       if (!timeEntry) {
//         return res.status(404).json({ error: 'Time entry not found' });
//       }
//       res.json(timeEntry);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },

//   // Update time entry
//   updateTimeEntry: async (req, res) => {
//     try {
//       const data = req.body;

//      if(!data.taskId ){
//       delete data.taskId;
//      }

//       const timeEntry = await TimeEntry.findByIdAndUpdate(
//         req.params.id,
//         data,
//         { new: true, runValidators: true }
//       ).populate([
//         { path: 'projectId', select: 'projectName' },
//         { path: 'taskId', select: 'taskName' }
//       ]);
//       if (!timeEntry) {
//         return res.status(404).json({ error: 'Time entry not found' });
//       }
//       res.json(timeEntry);
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   },

//   // Delete time entry
//   deleteTimeEntry: async (req, res) => {
//     try {
//       const timeEntry = await TimeEntry.findByIdAndDelete(req.params.id);
//       if (!timeEntry) {
//         return res.status(404).json({ error: 'Time entry not found' });
//       }
//       res.json({ message: 'Time entry deleted successfully' });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   }
// };

// module.exports = timeEntryController;













// const TimeEntry = require('../../models/crm/TimeEntry');

// const timeEntryController = {

//   // Get all time entries
//   getTimeEntries: async (req, res) => {
//     try {
//       const { companyId, financialYear } = req.query;

//       const query = {};
//       if (companyId) query.companyId = companyId;
//       if (financialYear) query.financialYear = financialYear.trim();

//       const timeEntries = await TimeEntry.find(query)
//         .populate('projectId', 'projectName')
//         .populate('taskId', 'taskName')
//         .sort({ date: -1, createdAt: -1 });

//       res.json(timeEntries);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },

//   // Create new time entry
//   createTimeEntry: async (req, res) => {
//     try {
//       const data = { ...req.body };

//       // Remove taskId if empty/null/undefined (it's optional)
//       if (!data.taskId || data.taskId === '') {
//         delete data.taskId;
//       }

//       // Remove financialYear if empty/null/undefined
//       if (!data.financialYear || data.financialYear === '') {
//         delete data.financialYear;
//       }

//       // Convert hours to Number (frontend sends it as string from input)
//       if (data.hours !== undefined && data.hours !== '') {
//         data.hours = parseFloat(data.hours);
//       }

//       // Ensure date is valid
//       if (data.date) {
//         data.date = new Date(data.date);
//       }

//       console.log("📥 Creating time entry:", JSON.stringify(data, null, 2));

//       const timeEntry = new TimeEntry(data);
//       await timeEntry.save();
//       await timeEntry.populate([
//         { path: 'projectId', select: 'projectName' },
//         { path: 'taskId', select: 'taskName' }
//       ]);

//       res.status(201).json(timeEntry);
//     } catch (error) {
//       console.log("❌ Create error:", error.message);
//       res.status(400).json({ error: error.message });
//     }
//   },

//   // Get time entry by ID
//   getTimeEntryById: async (req, res) => {
//     try {
//       const timeEntry = await TimeEntry.findById(req.params.id)
//         .populate('projectId', 'projectName')
//         .populate('taskId', 'taskName');

//       if (!timeEntry) {
//         return res.status(404).json({ error: 'Time entry not found' });
//       }

//       res.json(timeEntry);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },

//   // Update time entry
//   updateTimeEntry: async (req, res) => {
//     try {
//       const data = { ...req.body };

//       // Remove taskId if empty/null/undefined
//       if (!data.taskId || data.taskId === '') {
//         delete data.taskId;
//       }

//       // Remove financialYear if empty/null/undefined
//       if (!data.financialYear || data.financialYear === '') {
//         delete data.financialYear;
//       }

//       // Convert hours to Number
//       if (data.hours !== undefined && data.hours !== '') {
//         data.hours = parseFloat(data.hours);
//       }

//       // Ensure date is valid
//       if (data.date) {
//         data.date = new Date(data.date);
//       }

//       console.log("📝 Updating time entry:", JSON.stringify(data, null, 2));

//       const timeEntry = await TimeEntry.findByIdAndUpdate(
//         req.params.id,
//         data,
//         { new: true, runValidators: true }
//       ).populate([
//         { path: 'projectId', select: 'projectName' },
//         { path: 'taskId', select: 'taskName' }
//       ]);

//       if (!timeEntry) {
//         return res.status(404).json({ error: 'Time entry not found' });
//       }

//       res.json(timeEntry);
//     } catch (error) {
//       console.log("❌ Update error:", error.message);
//       res.status(400).json({ error: error.message });
//     }
//   },

//   // Delete time entry
//   deleteTimeEntry: async (req, res) => {
//     try {
//       const timeEntry = await TimeEntry.findByIdAndDelete(req.params.id);

//       if (!timeEntry) {
//         return res.status(404).json({ error: 'Time entry not found' });
//       }

//       res.json({ message: 'Time entry deleted successfully' });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   }
// };

// module.exports = timeEntryController;




const TimeEntry = require('../../models/crm/TimeEntry');

const timeEntryController = {

  // Get all time entries
  getTimeEntries: async (req, res) => {
    try {
      const { companyId, financialYear } = req.query;

      const query = {};
      if (companyId) query.companyId = companyId;
      if (financialYear) query.financialYear = financialYear.trim();

      const timeEntries = await TimeEntry.find(query)
        .populate('projectId', 'projectName')
        .populate('taskId', 'taskName')
        .sort({ date: -1, createdAt: -1 });

      res.json(timeEntries);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new time entry
  createTimeEntry: async (req, res) => {
    try {
      const data = { ...req.body };

      if (!data.taskId || data.taskId === '') delete data.taskId;
      if (!data.financialYear || data.financialYear === '') delete data.financialYear;
      if (data.hours !== undefined) data.hours = parseFloat(data.hours);
      if (data.date) data.date = new Date(data.date);

      console.log("📥 Clean data being saved:", JSON.stringify(data, null, 2));

      const timeEntry = new TimeEntry(data);

      const validationError = timeEntry.validateSync();
      if (validationError) {
        console.log("❌ Validation errors:", JSON.stringify(validationError.errors, null, 2));
        return res.status(400).json({ error: validationError.message });
      }

      await timeEntry.save();

      await timeEntry.populate([
        { path: 'projectId', select: 'projectName' },
        { path: 'taskId', select: 'taskName' }
      ]);

      res.status(201).json(timeEntry);
    } catch (error) {
      console.log("❌ Full error:", error);
      res.status(400).json({ error: error.message });
    }
  },

  // Get time entry by ID
  getTimeEntryById: async (req, res) => {
    try {
      const timeEntry = await TimeEntry.findById(req.params.id)
        .populate('projectId', 'projectName')
        .populate('taskId', 'taskName');

      if (!timeEntry) {
        return res.status(404).json({ error: 'Time entry not found' });
      }

      res.json(timeEntry);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update time entry
  updateTimeEntry: async (req, res) => {
    try {
      const data = { ...req.body };

      if (!data.taskId || data.taskId === '') delete data.taskId;
      if (!data.financialYear || data.financialYear === '') delete data.financialYear;
      if (data.hours !== undefined && data.hours !== '') data.hours = parseFloat(data.hours);
      if (data.date) data.date = new Date(data.date);

      console.log("📝 Updating time entry:", JSON.stringify(data, null, 2));

      const timeEntry = await TimeEntry.findByIdAndUpdate(
        req.params.id,
        data,
        { new: true, runValidators: true }
      ).populate([
        { path: 'projectId', select: 'projectName' },
        { path: 'taskId', select: 'taskName' }
      ]);

      if (!timeEntry) {
        return res.status(404).json({ error: 'Time entry not found' });
      }

      res.json(timeEntry);
    } catch (error) {
      console.log("❌ Update error:", error.message);
      res.status(400).json({ error: error.message });
    }
  },

  // Delete time entry
  deleteTimeEntry: async (req, res) => {
    try {
      const timeEntry = await TimeEntry.findByIdAndDelete(req.params.id);

      if (!timeEntry) {
        return res.status(404).json({ error: 'Time entry not found' });
      }

      res.json({ message: 'Time entry deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = timeEntryController;