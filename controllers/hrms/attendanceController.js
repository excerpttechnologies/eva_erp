const Employee = require('../../models/hrms/employee');
const Attendance = require('../../models/hrms/Attendance');

const attendanceController = {

  // Mark manual attendance
  markAttendance: async (req, res) => {
    const { employeeId } = req.body;

    try {
      if (!employeeId) {
        return res.status(400).json({ error: "Employee ID is required" });
      }

      // Verify employee exists and get employee data
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      // Get or create today's attendance document
      const todaysAttendance = await Attendance.getTodaysAttendance();

      // Check if employee already has attendance today
      const existingEmployee = todaysAttendance.employees.find(
        emp => emp.employeeObjectId.toString() === employeeId
      );

      if (existingEmployee) {
        return res.status(400).json({
          error: "Attendance already marked for today",
          attendance: existingEmployee
        });
      }

      // Add employee attendance record
      const employeeData = {
        employeeObjectId: employee._id,
        employeeId: employee.employeeId,
        firstName: employee.firstName,
        lastName: employee.lastName
      };

      todaysAttendance.updateEmployeeAttendance(employeeData, 'IN');
      await todaysAttendance.save();

      // Update employee schema with today's IN time
      employee.inTime = new Date();
      await employee.save();

      const employeeName = `${employee.firstName} ${employee.lastName}`.trim();
      console.log(`✅ Attendance marked for ${employeeName}`);

      const employeeRecord = todaysAttendance.employees.find(
        emp => emp.employeeObjectId.toString() === employeeId
      );

      res.json({
        message: "✅ Attendance marked successfully",
        attendance: {
          date: todaysAttendance.date,
          employeeRecord: {
            employeeObjectId: employeeRecord.employeeObjectId,
            employeeId: employeeRecord.employeeId,
            firstName: employeeRecord.firstName,
            lastName: employeeRecord.lastName,
            inTime: employeeRecord.inTime,
            status: employeeRecord.status
          }
        }
      });
    } catch (error) {
      console.error("Attendance error:", error);
      res.status(500).json({
        error: "❌ Error marking attendance",
        details: error.message
      });
    }
  },

  // Auto attendance (IN/OUT toggle)
  autoAttendance: async (req, res) => {
    const { employeeId } = req.body;

    try {
      if (!employeeId) {
        return res.status(400).json({ error: "Employee ID is required" });
      }

      // Verify employee exists and get employee data
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      // Get or create today's attendance document
      const todaysAttendance = await Attendance.getTodaysAttendance();

      // Find existing employee record for today
      const existingEmployee = todaysAttendance.employees.find(
        emp => emp.employeeObjectId.toString() === employeeId
      );

      const currentTime = new Date();
      const employeeName = `${employee.firstName} ${employee.lastName}`.trim();

      const employeeData = {
        employeeObjectId: employee._id,
        employeeId: employee.employeeId,
        firstName: employee.firstName,
        lastName: employee.lastName
      };

      if (!existingEmployee) {
        // First capture of the day - Mark IN time
        todaysAttendance.updateEmployeeAttendance(employeeData, 'IN');
        await todaysAttendance.save();

        // Save IN time to Employee schema
        employee.inTime = currentTime;
        await employee.save();

        console.log(`🟢 IN TIME marked for ${employeeName} at ${currentTime.toLocaleTimeString()}`);

        const employeeRecord = todaysAttendance.employees.find(
          emp => emp.employeeObjectId.toString() === employeeId
        );

        res.json({
          message: `🟢 Welcome ${employeeName}! IN time recorded`,
          attendance: {
            date: todaysAttendance.date,
            employeeRecord: employeeRecord
          },
          type: 'IN'
        });

      } else if (existingEmployee.status === 'IN' && !existingEmployee.outTime) {
        // Second capture - Mark OUT time and calculate working hours
        todaysAttendance.updateEmployeeAttendance(employeeData, 'OUT');
        await todaysAttendance.save();

        // Save OUT time and working hours to Employee schema
        employee.outTime = currentTime;
        employee.workingHours = existingEmployee.workingHours;
        await employee.save();

        const hours = Math.floor(existingEmployee.workingHours);
        const minutes = Math.floor((existingEmployee.workingHours % 1) * 60);

        console.log(`🔴 OUT TIME marked for ${employeeName} at ${currentTime.toLocaleTimeString()}`);
        console.log(`⏰ Total working hours: ${hours}h ${minutes}m`);

        res.json({
          message: `🔴 Goodbye ${employeeName}! OUT time recorded`,
          attendance: {
            date: todaysAttendance.date,
            employeeRecord: existingEmployee
          },
          workingSummary: `Total working time: ${hours} hours ${minutes} minutes`,
          type: 'OUT'
        });

      } else {
        // Already completed for the day
        const hours = Math.floor(existingEmployee.workingHours);
        const minutes = Math.floor((existingEmployee.workingHours % 1) * 60);

        res.json({
          message: `👋 Hello ${employeeName}! Your attendance is already complete for today`,
          attendance: {
            date: todaysAttendance.date,
            employeeRecord: existingEmployee
          },
          workingSummary: existingEmployee.workingHours > 0 ?
            `You worked ${hours} hours ${minutes} minutes today` :
            "Attendance complete",
          type: 'COMPLETED'
        });
      }

    } catch (error) {
      console.error("Auto attendance error:", error);
      res.status(500).json({
        error: "❌ Error processing attendance",
        details: error.message
      });
    }
  },

  // Get attendance records with filters
  getAttendanceRecords: async (req, res) => {
    try {
      const { date, employeeId } = req.query;
      let query = {};

      // Filter by date if provided
      if (date) {
        query.date = date; // Expecting YYYY-MM-DD format
      }

      const records = await Attendance.find(query).sort({ dateObject: -1 }).lean();

      // If filtering by specific employee
      if (employeeId) {
        const filteredRecords = [];

        records.forEach(attendanceDoc => {
          const employeeRecord = attendanceDoc.employees.find(
            emp => emp.employeeObjectId.toString() === employeeId || emp.employeeId === employeeId
          );

          if (employeeRecord) {
            filteredRecords.push({
              date: attendanceDoc.date,
              dateObject: attendanceDoc.dateObject,
              employeeRecord: employeeRecord,
              createdAt: attendanceDoc.createdAt,
              updatedAt: attendanceDoc.updatedAt
            });
          }
        });

        console.log(`📊 Fetching ${filteredRecords.length} attendance records for employee ${employeeId}`);
        return res.json(filteredRecords);
      }

      // Return all records in the format expected by frontend
      console.log(`📊 Fetching ${records.length} attendance documents`);
      res.json(records);
    } catch (err) {
      console.error("Error fetching attendance:", err);
      res.status(500).json({
        error: "❌ Error fetching attendance",
        details: err.message
      });
    }
  },

  // Get all employee attendance records (flattened from all dates)
  getAllEmployeeRecords: async (req, res) => {
    try {
      // No employeeId filtering
      const records = await Attendance.find({}).sort({ dateObject: -1 }).lean();

      let allEmployeeRecords = [];

      records.forEach(attendanceDoc => {
        if (attendanceDoc.employees && Array.isArray(attendanceDoc.employees)) {
          attendanceDoc.employees.forEach(empRecord => {
            allEmployeeRecords.push({
              ...empRecord,
              date: attendanceDoc.date,
              dateObject: attendanceDoc.dateObject,
              attendanceDocId: attendanceDoc._id
            });
          });
        }
      });

      console.log(`📊 Fetching ${allEmployeeRecords.length} employee attendancddde records`);
      res.json(allEmployeeRecords);
      console.log("all", allEmployeeRecords);
    } catch (err) {
      console.error("Error fetching employee records:", err);
      res.status(500).json({
        error: "❌ Error fetching employee attendance records",
        details: err.message
      });
    }
  },


  // Get today's attendance - FIXED VERSION with direct date matching
  getTodayAttendance: async (req, res) => {
    try {
      console.log('=== getTodayAttendance called ===');

      // Generate today's date string to match your existing data format
      const today = new Date();
      const todayString = today.getFullYear() + '-' +
        String(today.getMonth() + 1).padStart(2, '0') + '-' +
        String(today.getDate()).padStart(2, '0');

      console.log('Searching for date:', todayString);

      // Direct query to find today's attendance
      const attendanceDoc = await Attendance.findOne({
        date: todayString
      }).exec();

      console.log('Query result:', attendanceDoc ? 'Found' : 'Not found');

      if (!attendanceDoc) {
        // Return empty structure if no record exists for today
        return res.json({
          date: todayString,
          dateObject: new Date(),
          totalEmployeesPresent: 0,
          totalEmployeesCompleted: 0,
          employees: [],
          message: 'No attendance records for today yet'
        });
      }

      // Return the found record
      console.log(`Found today's attendance with ${attendanceDoc.employees.length} employees`);

      res.json({
        date: attendanceDoc.date,
        dateObject: attendanceDoc.dateObject,
        totalEmployeesPresent: attendanceDoc.totalEmployeesPresent || 0,
        totalEmployeesCompleted: attendanceDoc.totalEmployeesCompleted || 0,
        employees: attendanceDoc.employees || [],
        createdAt: attendanceDoc.createdAt,
        updatedAt: attendanceDoc.updatedAt,
        _id: attendanceDoc._id
      });

    } catch (err) {
      console.error('Error in getTodayAttendance:', err.message);
      res.status(500).json({
        error: 'Error fetching today\'s attendance',
        details: err.message
      });
    }
  },

  // Get attendance by specific date
  getAttendanceByDate: async (req, res) => {
    try {
      const { date } = req.params; // Expecting YYYY-MM-DD format

      const attendanceRecord = await Attendance.findOne({ date: date });

      if (!attendanceRecord) {
        return res.status(404).json({
          error: "No attendance records found for this date",
          date: date
        });
      }

      console.log(`📊 Attendance for ${date}: ${attendanceRecord.employees.length} employee records`);

      res.json({
        date: attendanceRecord.date,
        dateObject: attendanceRecord.dateObject,
        totalEmployeesPresent: attendanceRecord.totalEmployeesPresent,
        totalEmployeesCompleted: attendanceRecord.totalEmployeesCompleted,
        employees: attendanceRecord.employees,
        createdAt: attendanceRecord.createdAt,
        updatedAt: attendanceRecord.updatedAt
      });
    } catch (err) {
      console.error("Error fetching attendance by date:", err);
      res.status(500).json({
        error: "❌ Error fetching attendance",
        details: err.message
      });
    }
  },

  // Get database statistics
  getStats: async (req, res) => {
    try {
      const totalEmployees = await Employee.countDocuments();
      const totalAttendanceDays = await Attendance.countDocuments();

      // Check for invalid employees
      const allEmployees = await Employee.find({}, 'firstName lastName descriptor').lean();
      const validEmployees = allEmployees.filter(emp =>
        emp.descriptor &&
        Array.isArray(emp.descriptor) &&
        emp.descriptor.length === 128
      );

      // Get today's attendance
      const todaysAttendance = await Attendance.getTodaysAttendance();

      res.json({
        employees: {
          total: totalEmployees,
          valid: validEmployees.length,
          invalid: totalEmployees - validEmployees.length
        },
        attendance: {
          totalDays: totalAttendanceDays,
          todayPresent: todaysAttendance.totalEmployeesPresent,
          todayCompleted: todaysAttendance.totalEmployeesCompleted
        },
        database: {
          status: require('mongoose').connection.readyState === 1 ? "Connected" : "Disconnected",
          name: require('mongoose').connection.name
        }
      });
    } catch (error) {
      console.error("Stats error:", error);
      res.status(500).json({ error: "Error fetching statistics" });
    }
  },

  updaterecord: async (req, res) => {
    try {
      const { date } = req.params;
      const {
        employeeObjectId,
        inTime,
        outTime,
        status,
        firstName,
        lastName
      } = req.body;

      // Find the attendance document for the specific date
      const attendanceDoc = await Attendance.findOne({ date });

      if (!attendanceDoc) {
        return res.status(404).json({
          success: false,
          message: 'Attendance record not found for this date'
        });
      }

      // Find the employee record within the attendance document
      const employeeIndex = attendanceDoc.employees.findIndex(
        emp => emp.employeeObjectId.toString() === employeeObjectId.toString()
      );

      if (employeeIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Employee attendance record not found'
        });
      }

      // Update the employee record
      const employeeRecord = attendanceDoc.employees[employeeIndex];

      if (firstName) employeeRecord.firstName = firstName;
      if (lastName) employeeRecord.lastName = lastName;
      if (inTime !== undefined) employeeRecord.inTime = inTime ? new Date(inTime) : null;
      if (outTime !== undefined) employeeRecord.outTime = outTime ? new Date(outTime) : null;
      if (status) employeeRecord.status = status;

      // Recalculate working hours if both inTime and outTime are present
      if (employeeRecord.inTime && employeeRecord.outTime) {
        const workingMilliseconds = employeeRecord.outTime - employeeRecord.inTime;
        employeeRecord.workingHours = Math.round((workingMilliseconds / (1000 * 60 * 60)) * 100) / 100;
      } else {
        employeeRecord.workingHours = 0;
      }

      // Update counters
      attendanceDoc.totalEmployeesPresent = attendanceDoc.employees.filter(emp => emp.inTime).length;
      attendanceDoc.totalEmployeesCompleted = attendanceDoc.employees.filter(emp => emp.outTime).length;

      // Save the updated document
      await attendanceDoc.save();

      res.json({
        success: true,
        message: 'Attendance record updated successfully',
        data: employeeRecord
      });

    } catch (error) {
      console.error('Error updating attendance record:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating attendance record',
        error: error.message
      });
    }
  },

  // Delete attendance record
  deletebyid: async (req, res) => {
    try {
      const { date, employeeObjectId } = req.params;

      // Find the attendance document for the specific date
      const attendanceDoc = await Attendance.findOne({ date });

      if (!attendanceDoc) {
        return res.status(404).json({
          success: false,
          message: 'Attendance record not found for this date'
        });
      }

      // Find the employee record within the attendance document
      const employeeIndex = attendanceDoc.employees.findIndex(
        emp => emp.employeeObjectId.toString() === employeeObjectId.toString()
      );

      if (employeeIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Employee attendance record not found'
        });
      }

      // Remove the employee record
      const deletedEmployee = attendanceDoc.employees.splice(employeeIndex, 1)[0];

      // Update counters
      attendanceDoc.totalEmployeesPresent = attendanceDoc.employees.filter(emp => emp.inTime).length;
      attendanceDoc.totalEmployeesCompleted = attendanceDoc.employees.filter(emp => emp.outTime).length;

      // If no employees left for this date, optionally delete the entire document
      if (attendanceDoc.employees.length === 0) {
        await Attendance.findByIdAndDelete(attendanceDoc._id);
        return res.json({
          success: true,
          message: 'Attendance record deleted successfully (entire date record removed)',
          data: deletedEmployee
        });
      } else {
        // Save the updated document
        await attendanceDoc.save();
      }

      res.json({
        success: true,
        message: 'Employee attendance record deleted successfully',
        data: deletedEmployee
      });

    } catch (error) {
      console.error('Error deleting attendance record:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting attendance record',
        error: error.message
      });
    }
  },

  // Bulk delete attendance records (optional - for deleting multiple records)
  deleteall: async (req, res) => {
    try {
      const { recordsToDelete } = req.body; // Array of {date, employeeObjectId}

      if (!Array.isArray(recordsToDelete) || recordsToDelete.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request: recordsToDelete must be a non-empty array'
        });
      }

      const deletedRecords = [];
      const errors = [];

      for (const record of recordsToDelete) {
        try {
          const { date, employeeObjectId } = record;

          const attendanceDoc = await Attendance.findOne({ date });
          if (!attendanceDoc) {
            errors.push(`No attendance document found for date: ${date}`);
            continue;
          }

          const employeeIndex = attendanceDoc.employees.findIndex(
            emp => emp.employeeObjectId.toString() === employeeObjectId.toString()
          );

          if (employeeIndex === -1) {
            errors.push(`Employee not found in attendance for date: ${date}`);
            continue;
          }

          const deletedEmployee = attendanceDoc.employees.splice(employeeIndex, 1)[0];
          deletedRecords.push(deletedEmployee);

          // Update counters
          attendanceDoc.totalEmployeesPresent = attendanceDoc.employees.filter(emp => emp.inTime).length;
          attendanceDoc.totalEmployeesCompleted = attendanceDoc.employees.filter(emp => emp.outTime).length;

          if (attendanceDoc.employees.length === 0) {
            await Attendance.findByIdAndDelete(attendanceDoc._id);
          } else {
            await attendanceDoc.save();
          }

        } catch (err) {
          errors.push(`Error processing record: ${err.message}`);
        }
      }

      res.json({
        success: true,
        message: `Bulk delete completed. ${deletedRecords.length} records deleted.`,
        data: {
          deletedRecords,
          errors: errors.length > 0 ? errors : null
        }
      });

    } catch (error) {
      console.error('Error in bulk delete:', error);
      res.status(500).json({
        success: false,
        message: 'Error in bulk delete operation',
        error: error.message
      });
    }
  }
};

module.exports = attendanceController;



