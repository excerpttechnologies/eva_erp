// const Source = require('../../models/crm/Source');

// const sourceController = {
//   // Get all sources
//   getSources: async (req, res) => {
//     try {
//       const { companyId, financialYear } = req.query;
//       const sources = await Source.find({ companyId, financialYear }).sort({ createdAt: -1 });
//       res.json(sources);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },

//   // Create new source
//   createSource: async (req, res) => {
//     try {
//       const source = new Source(req.body);
//       await source.save();
//       res.status(201).json(source);
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   },

//   // Get source by ID
//   getSourceById: async (req, res) => {
//     try {
//       const source = await Source.findById(req.params.id);
//       if (!source) {
//         return res.status(404).json({ error: 'Source not found' });
//       }
//       res.json(source);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },

//   // Update source
//   updateSource: async (req, res) => {
//     try {
//       const source = await Source.findByIdAndUpdate(
//         req.params.id,
//         req.body,
//         { new: true, runValidators: true }
//       );
//       if (!source) {
//         return res.status(404).json({ error: 'Source not found' });
//       }
//       res.json(source);
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   },

//   // Delete source
//   deleteSource: async (req, res) => {
//     try {
//       const source = await Source.findByIdAndDelete(req.params.id);
//       if (!source) {
//         return res.status(404).json({ error: 'Source not found' });
//       }
//       res.json({ message: 'Source deleted successfully' });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   }
// };

// module.exports = sourceController;










// const Source = require('../../models/crm/Source');

// const sourceController = {

//   // ✅ Get all sources (FIXED)
//   getSources: async (req, res) => {
//     try {
//       let { companyId, financialYear } = req.query;

//       const query = {};

//       // ✅ Safe checks
//       if (companyId && companyId !== "null" && companyId !== "undefined") {
//         query.companyId = companyId;
//       }

//       if (financialYear && financialYear !== "null" && financialYear !== "undefined") {
//         query.financialYear = financialYear.trim();
//       }

//       console.log("✅ FINAL QUERY:", query);

//       const sources = await Source.find(query).sort({ createdAt: -1 });

//       res.status(200).json(sources);

//     } catch (error) {
//       console.error("❌ ERROR:", error);
//       res.status(500).json({ error: error.message });
//     }
//   },

//   // Create
//   createSource: async (req, res) => {
//     try {
//       const source = new Source(req.body);
//       await source.save();
//       res.status(201).json(source);
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   },

//   // Get by ID
//   getSourceById: async (req, res) => {
//     try {
//       const source = await Source.findById(req.params.id);
//       if (!source) return res.status(404).json({ error: 'Source not found' });
//       res.json(source);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },

//   // Update
//   updateSource: async (req, res) => {
//     try {
//       const source = await Source.findByIdAndUpdate(
//         req.params.id,
//         req.body,
//         { new: true, runValidators: true }
//       );
//       if (!source) return res.status(404).json({ error: 'Source not found' });
//       res.json(source);
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   },

//   // Delete
//   deleteSource: async (req, res) => {
//     try {
//       const source = await Source.findByIdAndDelete(req.params.id);
//       if (!source) return res.status(404).json({ error: 'Source not found' });
//       res.json({ message: 'Deleted successfully' });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   }
// };

// module.exports = sourceController;




const Source = require('../../models/crm/Source');

const sourceController = {

  // ✅ GET ALL (SAFE)
  getSources: async (req, res) => {
    try {
      let { companyId, financialYear } = req.query;

      const query = {};

      if (companyId && companyId !== "null" && companyId !== "undefined") {
        query.companyId = companyId;
      }

      if (financialYear && financialYear !== "null" && financialYear !== "undefined" && financialYear !== "") {
        query.financialYear = financialYear.trim();
      }

      console.log("✅ FINAL QUERY:", query);

      const sources = await Source.find(query).sort({ createdAt: -1 });

      res.status(200).json(sources);

    } catch (error) {
      console.error("❌ ERROR:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // ✅ CREATE (FIXED 🔥)
  createSource: async (req, res) => {
    try {
      let { companyId, financialYear, name, description } = req.body;

      // ✅ VALIDATION
      if (!companyId) {
        return res.status(400).json({ error: "CompanyId is required" });
      }

      // ❌ DO NOT FORCE financialYear
      const source = new Source({
        name,
        description: description || '',
        companyId,
        financialYear: financialYear || null   // ✅ SAFE
      });

      await source.save();

      res.status(201).json(source);

    } catch (error) {
      console.error("❌ CREATE ERROR:", error);
      res.status(400).json({ error: error.message });
    }
  },

  // ✅ GET BY ID
  getSourceById: async (req, res) => {
    try {
      const source = await Source.findById(req.params.id);
      if (!source) return res.status(404).json({ error: 'Source not found' });

      res.json(source);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // ✅ UPDATE (FIXED 🔥)
  updateSource: async (req, res) => {
    try {
      const updateData = { ...req.body };

      // ✅ REMOVE BAD VALUES
      if (
        updateData.financialYear === "" ||
        updateData.financialYear === "null" ||
        updateData.financialYear === undefined
      ) {
        delete updateData.financialYear;
      }

      const source = await Source.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!source) {
        return res.status(404).json({ error: 'Source not found' });
      }

      res.json(source);

    } catch (error) {
      console.error("❌ UPDATE ERROR:", error);
      res.status(400).json({ error: error.message });
    }
  },

  // ✅ DELETE
  deleteSource: async (req, res) => {
    try {
      const source = await Source.findByIdAndDelete(req.params.id);

      if (!source) {
        return res.status(404).json({ error: 'Source not found' });
      }

      res.json({ message: 'Deleted successfully' });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = sourceController;