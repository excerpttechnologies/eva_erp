const TimeEntry = require('../../models/crm/TimeEntry');

const timeEntryController = {
  // Get all time entries
  // getTimeEntries: async (req, res) => {
  //   try {
  //     const { companyId, financialYear } = req.query;
  //     const timeEntries = await TimeEntry.find({ companyId, financialYear })
  //       .populate('projectId', 'projectName')
  //       .populate('taskId', 'taskName')
  //       .sort({ date: -1, createdAt: -1 });
  //     res.json(timeEntries);
  //   } catch (error) {
  //     res.status(500).json({ error: error.message });
  //   }
  // },

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
      
      const data = req.body;

     if(data.taskId === undefined || data.taskId === null || data.taskId === ''){
      delete data.taskId;
     }

     
      const timeEntry = new TimeEntry(data);
      await timeEntry.save();
      await timeEntry.populate([
        { path: 'projectId', select: 'projectName' },
        { path: 'taskId', select: 'taskName' }
      ]);
      res.status(201).json(timeEntry);
    } catch (error) {
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
      const data = req.body;

     if(data.taskId === undefined || data.taskId === null || data.taskId === ''){
      delete data.taskId;
     }

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












