const express = require("express");
const { query, body } = require("express-validator");
const validate = require("../middleware/validate");
const { authenticate, requireRole } = require("../middleware/auth");
const Patient = require('../modals/Patient');
const { computeAgeFromDob } = require("../utils/date");
const router = express.Router();
// Get the profile of Patient

router.get(
  "/me",
  authenticate,
  requireRole("patient"), async (req, res) => {
    const patient = await Patient.findById(req.user._id).select(
      "-password -googleId",
    );
    res.ok(patient, "Profile fetched");
  },
);

// Update Patient Profile

router.put("/onboarding/update", authenticate, requireRole("patient"), [
  body("name").optional().notEmpty(),
  body("phone").optional().isString(),
  body("dob").optional().isISO8601(),
  body("gender").optional().isIn(['male','female','other']),
  body("bloodGroup").optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),

  body("emergencyContact").optional().isObject(),
  body("emergencyContact.name").optional().isString().notEmpty(),
  body("emergencyContact.phone").optional().isString().notEmpty(),
  body("emergencyContact.relationship").optional().isString().notEmpty(),

  body("medicalHistory").optional().isObject(),
  body("medicalHistory.allergies").optional().isString().notEmpty(),
  body("medicalHistory.currentMedications").optional().isString().notEmpty(),
  body("medicalHistory.chronicConditions").optional().isString().notEmpty(),
], validate, 

    async(req, res) => {
        try {
            const update = {...req.body};

            if(update.dob){
                update.dob = computeAgeFromDob(update.dob)
            }

            delete update.password;
            update.isVerified = true; // Mark Profile as Verified on Update
            const patient = await Patient.findByIdAndUpdate(req.user._id, update, {new : true}).select("-password -googleId")
            res.ok(patient, 'Profile Updated')
        } catch (error) {
            res.serverError('Update Failed', [error.message])
        }
    }
);

module.exports = router;