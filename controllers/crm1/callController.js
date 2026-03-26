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












const Call = require('../../models/crm/Call');

const callController = {

  // ✅ GET ALL (SAFE)
  getCalls: async (req, res) => {
    try {
      let { companyId, financialYear } = req.query;

      const query = {};

      if (companyId && companyId !== "null" && companyId !== "undefined") {
        query.companyId = companyId;
      }

      if (
        financialYear &&
        financialYear !== "null" &&
        financialYear !== "undefined" &&
        financialYear !== ""
      ) {
        query.financialYear = financialYear.trim();
      }

      console.log("🔥 QUERY:", query);

      const calls = await Call.find(query).sort({ createdAt: -1 });

      res.status(200).json(calls);

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // ✅ CREATE (FIXED)
  createCall: async (req, res) => {
    try {
      let { callType, purpose, outcome, description, companyId, financialYear } = req.body;

      console.log("📥 BODY:", req.body);

      if (!companyId) {
        return res.status(400).json({ error: "CompanyId required" });
      }

      if (!callType || !purpose || !outcome) {
        return res.status(400).json({ error: "CallType, Purpose, Outcome required" });
      }
financialYear = financialYear || null;
      const call = new Call({
        callType,
        purpose,
        outcome,
        description: description || "",
        companyId,
        financialYear: financialYear || null  // ✅ FIX
      });

      await call.save();

      res.status(201).json(call);

    } catch (error) {
      console.error("❌ CREATE ERROR:", error.message);
      res.status(400).json({ error: error.message });
    }
  },

  // ✅ GET BY ID
  getCallById: async (req, res) => {
    try {
      const call = await Call.findById(req.params.id);
      if (!call) return res.status(404).json({ error: 'Not found' });

      res.json(call);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // ✅ UPDATE (FIXED)
  updateCall: async (req, res) => {
    try {
      const updateData = { ...req.body };

      if (
        updateData.financialYear === "" ||
        updateData.financialYear === "null" ||
        updateData.financialYear === undefined
      ) {
        updateData.financialYear = null;
      }

      const call = await Call.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!call) {
        return res.status(404).json({ error: 'Not found' });
      }

      res.json(call);

    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // ✅ DELETE
  deleteCall: async (req, res) => {
    try {
      const call = await Call.findByIdAndDelete(req.params.id);

      if (!call) {
        return res.status(404).json({ error: 'Not found' });
      }

      res.json({ message: 'Deleted successfully' });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = callController;