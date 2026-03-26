// // const LostReason = require('../../models/crm/LostReason');

// // const lostReasonController = {
// //   // Get all lost reasons
// //   getLostReasons: async (req, res) => {
// //     try {
// //       const { companyId, financialYear } = req.query;
// //       const lostReasons = await LostReason.find({ companyId, financialYear }).sort({ createdAt: -1 });
// //       res.json(lostReasons);
// //     } catch (error) {
// //       res.status(500).json({ error: error.message });
// //     }
// //   },

// //   // Create new lost reason
// //   createLostReason: async (req, res) => {
// //     try {
// //       const lostReason = new LostReason(req.body);
// //       await lostReason.save();
// //       res.status(201).json(lostReason);
// //     } catch (error) {
// //       res.status(400).json({ error: error.message });
// //     }
// //   },

// //   // Get lost reason by ID
// //   getLostReasonById: async (req, res) => {
// //     try {
// //       const lostReason = await LostReason.findById(req.params.id);
// //       if (!lostReason) {
// //         return res.status(404).json({ error: 'Lost reason not found' });
// //       }
// //       res.json(lostReason);
// //     } catch (error) {
// //       res.status(500).json({ error: error.message });
// //     }
// //   },

// //   // Update lost reason
// //   updateLostReason: async (req, res) => {
// //     try {
// //       const lostReason = await LostReason.findByIdAndUpdate(
// //         req.params.id,
// //         req.body,
// //         { new: true, runValidators: true }
// //       );
// //       if (!lostReason) {
// //         return res.status(404).json({ error: 'Lost reason not found' });
// //       }
// //       res.json(lostReason);
// //     } catch (error) {
// //       res.status(400).json({ error: error.message });
// //     }
// //   },

// //   // Delete lost reason
// //   deleteLostReason: async (req, res) => {
// //     try {
// //       const lostReason = await LostReason.findByIdAndDelete(req.params.id);
// //       if (!lostReason) {
// //         return res.status(404).json({ error: 'Lost reason not found' });
// //       }
// //       res.json({ message: 'Lost reason deleted successfully' });
// //     } catch (error) {
// //       res.status(500).json({ error: error.message });
// //     }
// //   }
// // };

// // module.exports = lostReasonController;










// const LostReason = require('../../models/crm/LostReason');

// const lostReasonController = {

//   // ✅ GET (FIXED)
//   getLostReasons: async (req, res) => {
//     try {
//       let { companyId, financialYear } = req.query;

//       const query = {};

//       // ✅ Safe companyId
//       if (companyId && companyId !== "null" && companyId !== "undefined") {
//         query.companyId = companyId;
//       }

//       // ✅ Safe financialYear
//       if (financialYear && financialYear !== "null" && financialYear !== "undefined") {
//         query.financialYear = financialYear.trim();
//       }

//       console.log("🔥 FINAL QUERY:", query);

//       const lostReasons = await LostReason.find(query).sort({ createdAt: -1 });

//       res.status(200).json(lostReasons);

//     } catch (error) {
//       console.error("❌ ERROR:", error);
//       res.status(500).json({ error: error.message });
//     }
//   },

//   // ✅ CREATE
//   // createLostReason: async (req, res) => {
//   //   try {
//   //     const lostReason = new LostReason(req.body);
//   //     await lostReason.save();
//   //     res.status(201).json(lostReason);
//   //   } catch (error) {
//   //     res.status(400).json({ error: error.message });
//   //   }
//   // },







// //   createLostReason: async (req, res) => {
// //   try {
// //     console.log("📥 BODY:", req.body);

// //     const lostReason = new LostReason(req.body);
// //     await lostReason.save();

// //     res.status(201).json(lostReason);

// //   } catch (error) {
// //     console.error("❌ CREATE ERROR:", error.message);
// //     res.status(400).json({ error: error.message });
// //   }
// // },


// createLostReason: async (req, res) => {
//   try {
//     const { reason, category, companyId, financialYear } = req.body;

//     console.log("📥 BODY:", req.body);

//     // ✅ Required validation
//     if (!companyId || !financialYear) {
//       return res.status(400).json({
//         error: "CompanyId and FinancialYear are required"
//       });
//     }

//     if (!reason || !category) {
//       return res.status(400).json({
//         error: "Reason and Category are required"
//       });
//     }

//     const lostReason = new LostReason({
//       reason,
//       category,
//       description: req.body.description || "",
//       companyId,
//       financialYear
//     });

//     await lostReason.save();

//     res.status(201).json(lostReason);

//   } catch (error) {
//     console.error("❌ CREATE ERROR:", error.message);
//     res.status(400).json({ error: error.message });
//   }
// },

//   // ✅ GET BY ID
//   getLostReasonById: async (req, res) => {
//     try {
//       const lostReason = await LostReason.findById(req.params.id);
//       if (!lostReason) return res.status(404).json({ error: 'Not found' });
//       res.json(lostReason);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },

//   // ✅ UPDATE
//  updateLostReason: async (req, res) => {
//   try {
//     console.log("📥 UPDATE BODY:", req.body);

//     const lostReason = await LostReason.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true, runValidators: true }
//     );

//     if (!lostReason) {
//       return res.status(404).json({ error: 'Not found' });
//     }

//     res.json(lostReason);

//   } catch (error) {
//     console.error("❌ UPDATE ERROR:", error.message);
//     res.status(400).json({ error: error.message });
//   }
// },

//   // ✅ DELETE
//   deleteLostReason: async (req, res) => {
//     try {
//       const lostReason = await LostReason.findByIdAndDelete(req.params.id);

//       if (!lostReason) return res.status(404).json({ error: 'Not found' });

//       res.json({ message: 'Deleted successfully' });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   }
// };

// module.exports = lostReasonController;









const LostReason = require('../../models/crm/LostReason');

const lostReasonController = {

  // ✅ GET ALL
  getLostReasons: async (req, res) => {
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

      const data = await LostReason.find(query).sort({ createdAt: -1 });

      res.status(200).json(data);

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // ✅ CREATE
  createLostReason: async (req, res) => {
    try {
      const { reason, category, description, companyId, financialYear } = req.body;

      console.log("📥 BODY:", req.body);

      // ✅ VALIDATION
      if (!companyId ) {
        return res.status(400).json({
          error: "CompanyId  is required"
        });
      }

      if (!reason || !category) {
        return res.status(400).json({
          error: "Reason and Category are required"
        });
      }

      const lostReason = new LostReason({
        reason: reason.trim(),
        category,
        description: description || "",
        companyId,
        financialYear : financialYear || null
      });

      await lostReason.save();

      res.status(201).json(lostReason);

    } catch (error) {
      console.error("❌ CREATE ERROR:", error.message);
      res.status(400).json({ error: error.message });
    }
  },

  // ✅ GET BY ID
  getLostReasonById: async (req, res) => {
    try {
      const data = await LostReason.findById(req.params.id);
      if (!data) return res.status(404).json({ error: "Not found" });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // ✅ UPDATE
  updateLostReason: async (req, res) => {
    try {
      const data = await LostReason.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!data) return res.status(404).json({ error: "Not found" });

      res.json(data);

    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // ✅ DELETE
  deleteLostReason: async (req, res) => {
    try {
      const data = await LostReason.findByIdAndDelete(req.params.id);

      if (!data) return res.status(404).json({ error: "Not found" });

      res.json({ message: "Deleted successfully" });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = lostReasonController;