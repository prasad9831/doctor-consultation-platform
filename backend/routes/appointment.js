const express = require("express");
const Appointment = require("../modals/Appointment");
const { authenticate, requireRole } = require("../middleware/auth");
const { query, body } = require("express-validator");
const validate = require("../middleware/validate");

const router = express.Router();

// Doctor's appointment

router.get(
  "/doctor",
  authenticate,
  requireRole("doctor"),
  [
    query("status").optional().isArray().withMessage("Status can be an Array"),
    query("status.*")
      .optional()
      .isString()
      .withMessage("Each status must be an string"),
  ],
  validate,

  async (req, res) => {
    try {
      const { status } = req.query;
      const filter = { doctorId: req.auth.id };

      if (status) {
        const statusArray = Array.isArray(status) ? status : [status];
        filter.status = { $in: statusArray };
      }

      const appointment = await Appointment.find(filter)
        .populate("patientId", "name email phone dob age profileImage")
        .populate("doctorId", "name fees phone specialization profileImage")
        .sort({ slotStartIso: 1, slotEndIso: 1 });

      res.ok(appointment, "Appointment fetch successfully");
    } catch (error) {
      console.error("Doctor appointment fetch error", error);
      res.serverError("Failed to fetch appointment", [error.message]);
    }
  },
);

// Patient appointment

router.get(
  "/patient",
  authenticate,
  requireRole("patient"),
  [
    query("status").optional().isArray().withMessage("Status can be an Array"),
    query("status.*")
      .optional()
      .isString()
      .withMessage("Each status must be an string"),
  ],
  validate,

  async (req, res) => {
    try {
      const { status } = req.query;
      const filter = { patientId: req.auth.id };

      if (status) {
        const statusArray = array.isArray(status) ? status : [status];
        filter.status = { $in: statusArray };
      }

      const appointment = await Appointment.find(filter)
        .populate(
          "doctorId",
          "name fees phone specialization hospitalInfo profileImage",
        )
        .populate("patientId", "name email profileImage age dob")
        .sort({ slotStartIso: 1, slotEndIso: 1 });

      res.ok(appointment, "Appointment fetch successfully");
    } catch (error) {
      console.error("Patient appointment fetch error", error);
      res.serverError("Failed to fetch appointment", [error.message]);
    }
  },
);

// Get boooked slots for doctor on specific date

router.get("/booked-slots/:doctor/:date", async (req, res) => {
  try {
    const { doctorId, date } = req.params;
    const startDay = new Date(date);
    startDay.setHours(0, 0, 0, 0);
    const endDay = new Date(date);
    endDay.setHours(23, 59, 59, 999);

    const bookedAppointment = await Appointment.find({
      doctorId,
      slotStartIso: { $gte: startDay, $lte: endDay },
      status: { $ne: "Cancelled" },
    }).select("slotStartIso");

    const bookedSlot = bookedAppointment.map((apt) => apt.slotStartIso);

    res.ok(bookedSlot, "Booked slot retrived");
  } catch (error) {
    res.serverError("Failed to fetch booked slot", [error.message]);
  }
});

router.post("/book", authenticate, requireRole("patient"), [
  body("doctorId").isMongoId().withMessage("valid DoctorId is required"),
  body("slotStartIso").isISO8601().withMessage("valid start time is required"),
  body("slotEndIso").isISO8601().withMessage("valid end time is required"),
  body("consultationType")
    .isIn(["Video Consultation", "Voice Call"])
    .withMessage("Valid consultation type required"),

  body("symptoms")
    .isString()
    .trim()
    .isLength({ min: 10 })
    .withMessage("Symptoms description is required (min 10 char)"),

  body("consultationFees")
    .isNumeric()
    .withMessage("consultationFees is required"),

  body("platformFees").isNumeric().withMessage("platformFees is required"),

  body("totalAmount").isNumeric().withMessage("totalAmount is required"),
  ,
  validate,

  async (req, res) => {
    try {
      const {
        doctorId,
        slotStartIso,
        slotEndIso,
        consultationType,
        date,
        symptoms,
        consultationFees,
        platformFees,
        totalAmount,
      } = req.body;

      const conflictingAppointment = await Appointment.findOne({
        doctorId,
        status: { $in: ["Scheduled", "In Progress"] },
        $or: [
          {
            slotStartIso: { $lt: new Date(slotEndIso) },
            slotEndIso: { $gt: new Date(slotStartIso) },
          },
        ],
      });

      if (conflictingAppointment) {
        return res.forbidden("This time slot is already booked");
      }

      // Generate unique roomId

      const zegoRoomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const appointment = new Appointment({
        doctorId,
        patientId: req.auth.id,
        date: new Date(date),
        slotStartIso: new Date(slotStartIso),
        slotEndIso: new Date(slotEndIso),
        consultationType,
        symptoms,
        zegoRoomId,
        status: "Scheduled",
        consultationFees,
        platformFees,
        totalAmount,
        paymentStatus: "Pending",
        payoutStatus: "Pending",
      });

      await appointment.save();
      await appointment.populate(
        "doctorId",
        "name fees phone specialization hospitalInfo profileImage",
      );
      await appointment.populate("patientId", "name email age dob");

      res.create(appointment, "Appointment Booked Successfully");
    } catch (error) {
      console.error("Book appointment error", error);
      res.serverError("Failed to book appointment", [error.message]);
    }
  },
]);

// Join
router.get("/join/:id", authenticate, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("patientId", "name")
      .populate("doctorId", "name");

    if (!appointment) {
      return res.notFound("Appointment not found");
    }

    appointment.status = "In Progress";
    await appointment.save();

    res.ok(
      { roomId: appointment.zegoRoomId, appointment },
      "Consultation joined Successfully",
    );
  } catch (error) {
    console.error("Join Consultation error", error);
    res.serverError("Failed to Join Consultatio", [error.message]);
  }
});

// End
router.put("/end/:id", authenticate, async (req, res) => {
  try {
    const { prescription, notes } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        Status: "Completed",
        prescription,
        notes,
        updatedAt: new Date(),
      },
      { new: true },
    ).populate("patientId doctorId");

    if (!appointment) {
      return res.notFound("Appointment not found");
    }

    await appointment.save();

    res.ok(appointment, "Consultation completed Successfully");
  } catch (error) {
    console.error("End Consultation error", error);
    res.serverError("Failed to End Consultation", [error.message]);
  }
});

// Update
router.put(
  "/status/:id",
  authenticate,
  requireRole("doctor"),
  async (req, res) => {
    try {
      const { status } = req.body;
      const appointment = await Appointment.findById(req.params.id).populate(
        "patientId doctorId",
      );

      if (!appointment) {
        return res.notFound("Appointment not found");
      }

      if (appointment.doctorId._id.toString() !== req.auth.id) {
        return res.forbidden("Access denied");
      }
      appointment.Status = status;
      appointment.updatedAt = new Date();
      await appointment.save();

      res.ok(appointment, "Appointment Status Updated Successfully");
    } catch (error) {
      console.error("Updated appointment status error", error);
      res.serverError("Failed to Updated appointment status", [error.message]);
    }
  },
);

// Get Singal Appointment By Id

router.get("/:id", authenticate, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("patientId", "name email profileImage age dob")
      .populate(
        "doctorId",
        "name fees phone specialization hospitalInfo profileImage",
      );

    if (!appointment) {
      return res.notFound("Appointment not found");
    }

    const userRole = req.auth.type;
    if (
      userRole === "doctor" &&
      appointment.doctorId._id.toString() !== req.auth.id
    ) {
      return res.forbidden("Access denied");
    }
    if (
      userRole === "patient" &&
      appointment.patientId._id.toString() !== req.auth.id
    ) {
      return res.forbidden("Access denied");
    }

    res.ok({ appointment }, "Appointment Fetch Successfully");
  } catch (error) {
    console.error("Get appointment error", error);
    res.serverError("Failed to Get appointment", [error.message]);
  }
});

module.exports = router;
