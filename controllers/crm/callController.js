// const Call = require('../../models/crm/Call');

// const callController = {
//   // Get all calls
//   getCalls: async (req, res) => {
//     try {
//       const { companyId, financialYear } = req.query;
//       const calls = await Call.find({ companyId, financialYear }).sort({ createdAt: -1 });
//       res.json(calls);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },

//   // Create new call
//   createCall: async (req, res) => {
//     try {
//       const call = new Call(req.body);
//       await call.save();
//       res.status(201).json(call);
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   },

//   // Get call by ID
//   getCallById: async (req, res) => {
//     try {
//       const call = await Call.findById(req.params.id);
//       if (!call) {
//         return res.status(404).json({ error: 'Call not found' });
//       }
//       res.json(call);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },

//   // Update call
//   updateCall: async (req, res) => {
//     try {
//       const call = await Call.findByIdAndUpdate(
//         req.params.id,
//         req.body,
//         { new: true, runValidators: true }
//       );
//       if (!call) {
//         return res.status(404).json({ error: 'Call not found' });
//       }
//       res.json(call);
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   },

//   // Delete call
//   deleteCall: async (req, res) => {
//     try {
//       const call = await Call.findByIdAndDelete(req.params.id);
//       if (!call) {
//         return res.status(404).json({ error: 'Call not found' });
//       }
//       res.json({ message: 'Call deleted successfully' });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   }
// };

// module.exports = callController;














// const Call = require('../../models/crm/Call');

// const callController = {

//   // ✅ GET ALL CALLS (FIXED FILTER)
//   getCalls: async (req, res) => {
//     try {
//       const { companyId, financialYear } = req.query;

//       const query = {};

//       if (companyId && companyId !== "null" && companyId !== "undefined") {
//         query.companyId = companyId;
//       }

//       if (financialYear && financialYear !== "null" && financialYear !== "undefined") {
//         query.financialYear = financialYear.trim();
//       }

//       console.log("🔥 GET QUERY:", query);

//       const calls = await Call.find(query).sort({ createdAt: -1 });

//       res.status(200).json(calls);

//     } catch (error) {
//       console.error("❌ GET ERROR:", error);
//       res.status(500).json({ error: error.message });
//     }
//   },

//   // ✅ CREATE CALL
//   createCall: async (req, res) => {
//     try {
//       const { callType, purpose, outcome, companyId, financialYear } = req.body;

//       console.log("📥 CREATE BODY:", req.body);

//       // ✅ VALIDATION
//       if (!callType || !purpose || !outcome) {
//         return res.status(400).json({ error: "CallType, Purpose, Outcome required" });
//       }

//       if (!companyId || !financialYear) {
//         return res.status(400).json({ error: "companyId and financialYear required" });
//       }

//       const call = new Call({
//         callType,
//         purpose,
//         outcome,
//         description: req.body.description || "",
//         companyId,
//         financialYear
//       });

//       await call.save();

//       res.status(201).json(call);

//     } catch (error) {
//       console.error("❌ CREATE ERROR:", error.message);
//       res.status(400).json({ error: error.message });
//     }
//   },

//   // ✅ GET BY ID
//   getCallById: async (req, res) => {
//     try {
//       const call = await Call.findById(req.params.id);

//       if (!call) {
//         return res.status(404).json({ error: 'Call not found' });
//       }

//       res.json(call);

//     } catch (error) {
//       console.error("❌ GET BY ID ERROR:", error);
//       res.status(500).json({ error: error.message });
//     }
//   },

//   // ✅ UPDATE CALL
//   updateCall: async (req, res) => {
//     try {
//       console.log("📥 UPDATE BODY:", req.body);

//       const { callType, purpose, outcome, companyId, financialYear } = req.body;

//       // ✅ VALIDATION
//       if (!callType || !purpose || !outcome) {
//         return res.status(400).json({ error: "CallType, Purpose, Outcome required" });
//       }

//       if (!companyId || !financialYear) {
//         return res.status(400).json({ error: "companyId and financialYear required" });
//       }

//       const call = await Call.findByIdAndUpdate(
//         req.params.id,
//         {
//           callType,
//           purpose,
//           outcome,
//           description: req.body.description || "",
//           companyId,
//           financialYear
//         },
//         { new: true, runValidators: true }
//       );

//       if (!call) {
//         return res.status(404).json({ error: 'Call not found' });
//       }

//       res.json(call);

//     } catch (error) {
//       console.error("❌ UPDATE ERROR:", error.message);
//       res.status(400).json({ error: error.message });
//     }
//   },

//   // ✅ DELETE CALL
//   deleteCall: async (req, res) => {
//     try {
//       const call = await Call.findByIdAndDelete(req.params.id);

//       if (!call) {
//         return res.status(404).json({ error: 'Call not found' });
//       }

//       res.json({ message: 'Call deleted successfully' });

//     } catch (error) {
//       console.error("❌ DELETE ERROR:", error);
//       res.status(500).json({ error: error.message });
//     }
//   }
// };

// module.exports = callController;














const Call = require('../../models/crm/Call');

const callController = {

  // GET ALL CALLS
  getCalls: async (req, res) => {
    try {
      const { companyId, financialYear } = req.query;

      if (!companyId || companyId === "null" || companyId === "undefined") {
        return res.status(400).json({ error: "companyId is required" });
      }

      const query = { companyId };

      // financialYear is OPTIONAL — only filter if provided
      if (financialYear && financialYear !== "null" && financialYear !== "undefined" && financialYear.trim() !== "") {
        query.financialYear = financialYear.trim();
      }

      console.log("GET QUERY:", query);

      const calls = await Call.find(query).sort({ createdAt: -1 });
      res.status(200).json(calls);

    } catch (error) {
      console.error("GET ERROR:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // CREATE CALL
  createCall: async (req, res) => {
    try {
      const { callType, purpose, outcome, description, companyId, financialYear } = req.body;

      console.log("CREATE BODY:", req.body);

      if (!callType || !purpose || !outcome) {
        return res.status(400).json({ error: "callType, purpose, and outcome are required" });
      }

      if (!companyId || companyId === "null" || companyId === "undefined") {
        return res.status(400).json({ error: "companyId is required" });
      }

      const call = new Call({
        callType,
        purpose,
        outcome,
        description: description || "",
        companyId,
        // financialYear is optional — only set if provided
        ...(financialYear && financialYear !== "null" ? { financialYear } : {})
      });

      await call.save();
      res.status(201).json(call);

    } catch (error) {
      console.error("CREATE ERROR:", error.message);
      res.status(400).json({ error: error.message });
    }
  },

  // GET BY ID
  getCallById: async (req, res) => {
    try {
      const call = await Call.findById(req.params.id);
      if (!call) return res.status(404).json({ error: 'Call not found' });
      res.json(call);
    } catch (error) {
      console.error("GET BY ID ERROR:", error);
      res.status(500).json({ error: error.message });
    }
  },

  // UPDATE CALL
  updateCall: async (req, res) => {
    try {
      const { callType, purpose, outcome, description, companyId, financialYear } = req.body;

      console.log("UPDATE BODY:", req.body);

      if (!callType || !purpose || !outcome) {
        return res.status(400).json({ error: "callType, purpose, and outcome are required" });
      }

      if (!companyId || companyId === "null" || companyId === "undefined") {
        return res.status(400).json({ error: "companyId is required" });
      }

      const updateData = {
        callType,
        purpose,
        outcome,
        description: description || "",
        companyId,
        // financialYear is optional — only update if provided
        ...(financialYear && financialYear !== "null" ? { financialYear } : {})
      };

      const call = await Call.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!call) return res.status(404).json({ error: 'Call not found' });

      res.json(call);

    } catch (error) {
      console.error("UPDATE ERROR:", error.message);
      res.status(400).json({ error: error.message });
    }
  },

  // DELETE CALL
  deleteCall: async (req, res) => {
    try {
      const call = await Call.findByIdAndDelete(req.params.id);
      if (!call) return res.status(404).json({ error: 'Call not found' });
      res.json({ message: 'Call deleted successfully' });
    } catch (error) {
      console.error("DELETE ERROR:", error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = callController;