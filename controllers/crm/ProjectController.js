// const Project = require('../../models/crm/Project');

// const projectController = {
//   // Get all projects
//   getProjects: async (req, res) => {
//     try {
//       const { companyId, financialYear } = req.query;
//       const projects = await Project.find({ companyId, financialYear }).sort({ createdAt: -1 });
//       res.json(projects);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },

//   // Create new project
  // createProject: async (req, res) => {
  //   try {
  //     const project = new Project(req.body);
  //     await project.save();
  //     res.status(201).json(project);
  //   } catch (error) {
  //     res.status(400).json({ error: error.message });
  //   }
  // },

//   // Get project by ID
//   getProjectById: async (req, res) => {
//     try {
//       const project = await Project.findById(req.params.id);
//       if (!project) {
//         return res.status(404).json({ error: 'Project not found' });
//       }
//       res.json(project);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },

//   // Update project
//   updateProject: async (req, res) => {
//     try {
//       const project = await Project.findByIdAndUpdate(
//         req.params.id,
//         req.body,
//         { new: true, runValidators: true }
//       );
//       if (!project) {
//         return res.status(404).json({ error: 'Project not found' });
//       }
//       res.json(project);
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   },

//   // Delete project
//   deleteProject: async (req, res) => {
//     try {
//       const project = await Project.findByIdAndDelete(req.params.id);
//       if (!project) {
//         return res.status(404).json({ error: 'Project not found' });
//       }
//       res.json({ message: 'Project deleted successfully' });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   }
// };

// module.exports = projectController;















const Project = require('../../models/crm/Project');

const projectController = {
  // Get all projects
  getProjects: async (req, res) => {
    try {
      const { companyId, financialYear } = req.query;

      const projects = await Project.find({ companyId, financialYear })
        .sort({ createdAt: -1 })
        .populate("projectManager", "firstName lastName email employeeId department profilePhoto") // populate specific fields
        .populate("teamMembers", "firstName lastName email employeeId department profilePhoto"); // populate specific fields

      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // createProject: async (req, res) => {
  //   try {
  //     const project = new Project(req.body);
  //     await project.save();
  //     res.status(201).json(project);
  //   } catch (error) {
  //     res.status(400).json({ error: error.message });
  //   }
  // },

  // Get project by ID

createProject: async (req, res) => {
  try {
    const {
      projectName,
      clientName,
      projectManager,
      teamMembers,
      companyId,
      financialYear
    } = req.body;

    // ✅ Required field validation
    if (!projectName || !clientName) {
      return res.status(400).json({ error: "Project name and client name are required" });
    }

    if (!companyId || !financialYear) {
      return res.status(400).json({ error: "CompanyId and FinancialYear are required" });
    }

    if (!projectManager || projectManager.length === 0) {
      return res.status(400).json({ error: "Project Manager is required" });
    }

    if (!teamMembers || teamMembers.length === 0) {
      return res.status(400).json({ error: "At least one Team Member is required" });
    }

    const project = new Project(req.body);
    await project.save();

    res.status(201).json(project);

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
},

  getProjectById: async (req, res) => {
    try {
      const project = await Project.findById(req.params.id)
        .populate("projectManager", "firstName lastName email employeeId department profilePhoto")
        .populate("teamMembers", "firstName lastName email employeeId department profilePhoto");

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update project
  // updateProject: async (req, res) => {
  //   try {
  //     const project = await Project.findByIdAndUpdate(
  //       req.params.id,
  //       req.body,
  //       { new: true, runValidators: true }
  //     )
  //       .populate("projectManager", "firstName lastName email employeeId department profilePhoto")
  //       .populate("teamMembers", "firstName lastName email employeeId department profilePhoto");

  //     if (!project) {
  //       return res.status(404).json({ error: 'Project not found' });
  //     }
  //     res.json(project);
  //   } catch (error) {
  //     res.status(400).json({ error: error.message });
  //   }
  // },

updateProject: async (req, res) => {
  try {
    const {
      projectManager,
      teamMembers,
      companyId,
      financialYear
    } = req.body;

    if (!companyId || !financialYear) {
      return res.status(400).json({ error: "CompanyId and FinancialYear are required" });
    }

    if (!projectManager || projectManager.length === 0) {
      return res.status(400).json({ error: "Project Manager is required" });
    }

    if (!teamMembers || teamMembers.length === 0) {
      return res.status(400).json({ error: "Team Members are required" });
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(project);

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
},

  // Delete project
  deleteProject: async (req, res) => {
    try {
      const project = await Project.findByIdAndDelete(req.params.id);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json({ message: 'Project deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = projectController;










