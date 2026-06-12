const express = require("express");
const { query, body } = require("express-validator");
const validate = require("../middleware/validate");
const { authenticate, requireRole } = require("../middleware/auth");
const Doctor = require("../modals/Doctor");
const Appointment = require("../modals/Appointment");

const router = express.Router();

router.get(
  "/list",
  [
    query("search").optional().isString(),
    query("specialization").optional().isString(),
    query("city").optional().isString(),
    query("category").optional().isString(),
    query("minFees").optional().isInt({ min: 0 }),
    query("maxFees").optional().isInt({ min: 0 }),
    query("sortBy")
      .optional()
      .isIn(["fees", "experience", "name", "createdAt"]),
    query("sortOrder").optional().isIn(["asc", "desc"]),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  validate,

  async (req, res) => {
    try {
      const {
        search,
        specialization,
        city,
        category,
        minFees,
        maxFees,
        sortBy = "createdAt",
        sortOrder = "desc",
        page = 1,
        limit = 20,
      } = req.query;
      const filter = { isVerified: true };
      if (specialization)
        filter.specialization = {
          $regex: `^${specialization}$`,
          $options: "i",
        };
      if (city) filter["hospitalInfo.city"] = { $regex: city, $options: "i" };
      if (category) {
        filter.category = category;
      }

      if (minFees || maxFees) {
        filter.fees = {};
        if (minFees) filter.fees.$gte = Number(minFees);
        if (maxFees) filter.fees.$lte = Number(maxFees);
      }

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { specialization: { $regex: search, $options: "i" } },
          { "hospitalInfo.name": { $regex: search, $options: "i" } },
        ];
      }

      const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
      const skip = (Number(page) - 1) * Number(limit);

      const [items, total] = await Promise.all([
        Doctor.find(filter)
          .select("-password -googleId")
          .sort(sort)
          .skip(skip)
          .limit(Number(limit)),
        Doctor.countDocuments(filter),
      ]);

      res.ok(items, "Doctors fetched", {
        page: Number(page),
        limit: Number(limit),
        total,
      });
    } catch (error) {
      console.error("Doctor fetched failed", error);
      res.serverError("Doctor fetched failed", [error.message]);
    }
  },
);

// Get the profile of doctor

router.get("/me", authenticate, requireRole("doctor"), async (req, res) => {
  const doc = await Doctor.findById(req.user._id).select("-password -googleId");
  res.ok(doc, "Profile fetched");
});

// Update Doctor Profile

router.put(
  "/onboarding/update",
  authenticate,
  requireRole("doctor"),
  [
    body("name").optional().notEmpty(),
    body("specialization").optional().notEmpty(),
    body("qualification").optional().notEmpty(),
    body("category").optional().notEmpty(),
    body("experience").optional().isInt({ min: 0 }),
    body("about").optional().isString(),
    body("fees").optional().isInt({ min: 0 }),
    body("hospitalInFo").optional().isObject(),
    body("avaliabalityRange.startDate").optional().isISO8601(),
    body("avaliabalityRange.endDate").optional().isISO8601(),
    body("avaliabalityRange.excludedWeekdays").optional().isArray(),
    body("dailyTimeRange").optional().isArray({ min: 1 }),
    body("dailyTimeRange.*.start").optional().isString(),
    body("dailyTimeRange.*.end").optional().isString(),
    body("slotDurationMinutes").optional().isInt({ min: 5, max: 180 }),
  ],
  validate,

  async (req, res) => {
    try {
      const update = { ...req.body };
      delete update.password;
      update.isVerified = true; // Mark Profile as Verified on Update
      const doc = await Doctor.findByIdAndUpdate(req.user._id, update, {
        new: true,
      }).select("-password -googleId");
      res.ok(doc, "Profile Updated");
    } catch (error) {
      res.serverError("Update Failed", [error.message]);
    }
  },
);

router.get(
  "/dashboard",
  authenticate,
  requireRole("doctor"),
  async (req, res) => {
    try {
      const doctorId = req.auth.id;
      const now = new Date();

      const startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0,
        0,
      );
      const endDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23,
        59,
        59,
        999,
      );

      const doctor = await Doctor.findById(doctorId)
        .select("-password -googleId")
        .lean();

      if (!doctor) {
        return res.notFound("Doctor Not Found");
      }

      const todayAppointment = await Appointment.find({
        doctorId,
        slotStartIso: { $gte: startDate, $lte: endDate },
      })
        .populate("patientId", "name profileImage age email phone dob")
        .populate("doctorId", "name profileImage fees specialization")
        .sort({ slotStartIso: 1 });

      const noww = new Date();

      const upcomingAppointment = await Appointment.find({
        doctorId,
        Status: { $in: ["Scheduled", "In Progress"] }, // 👈 allowed statuses
        $or: [
          { slotStartIso: { $gte: noww } }, // future
          { Status: "In Progress" }, // ongoing
        ],
      })
        .populate("patientId", "name profileImage age email phone dob")
        .populate("doctorId", "name profileImage fees specialization")
        .sort({ slotStartIso: 1 })
        .limit(5);

      const uniquePatientIds = await Appointment.distinct("patientId", {
        doctorId,
      });
      const totalPatient = uniquePatientIds.length;

      const completedAppointmentCount = await Appointment.countDocuments({
        doctorId,
        Status: "Completed",
      });

      const totalAppointment = await Appointment.find({
        doctorId,
      });

      const totalRevenue = totalAppointment.reduce(
        (sum, apt) => sum + (apt.fees || doctor.fees || 0),
        0,
      );

      const dashboardData = {
        user: {
          name: doctor.name,
          fees: doctor.fees,
          profileImage: doctor.profileImage,
          specialization: doctor.specialization,
          hospitalInfo: doctor.hospitalInfo,
        },
        stats: {
          totalPatient,
          totalAppointment: totalAppointment.length,
          totalRevenue,
          completedAppointment: completedAppointmentCount,
          averageRating: 4.8,
        },
        todayAppointment,
        upcomingAppointment,
        performance: {
          patientSatisfaction: 4.8,
          completionRate: 98,
          responseTime: "< 2min",
        },
      };

      res.ok(dashboardData, "Dashboard Data retrived");
      console.log("Dashboard Data retrived", dashboardData);
    } catch (error) {
      console.error("Dashboard Error", error);
      res.serverError("Failed to fetch doctor dashboard", [error.message]);
    }
  },
);

router.get("/:doctorId", validate, async (req, res) => {
  try {
    const { doctorId } = req.params;
    const doctor = await Doctor.findById(doctorId)
      .select("-password -googleId")
      .lean();

    if (!doctor) {
      return res.notFound("Doctor Not Found");
    }
    res.ok(doctor, "Doctor details fetch successfully");
  } catch (error) {
    res.serverError("Fetching | Failed", [error.message]);
  }
});

module.exports = router;
