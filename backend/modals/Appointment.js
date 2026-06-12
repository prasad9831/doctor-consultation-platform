const mongoose = require("mongoose");

const { Schema } = mongoose;

const appointmentSchema = new Schema(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    slotStartIso: {
      type: String,
      required: true,
    },

    slotEndIso: {
      type: String,
      required: true,
    },

    consultationType: {
      type: String,
      enum: ["Video Consultation", "Voice Call"],
      default: "Video Consultation",
    },

    Status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled", "In Progress"],
      default: "Scheduled",
    },

    symptoms: {
      type: String,
      default: "",
    },

    zegoRoomId: {
      type: String,
      default: "",
    },

    prescription: [
      {
        medicine: String,
        dosage: String,
        tests: String,
      },
    ],

    diagnosis: {
      type: String,
      default: "",
    },

    notes: {
      type: String,
      default: "",
    },

    transcript: {
      type: String,
      default: "",
    },
    // Payment Fields

    consultationFees: {
      type: Number,
      required: true,
    },

    platformFees: {
      type: Number,
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Refunded"],
      default: "Pending",
    },

    payoutStatus: {
      type: String,
      enum: ["Pending", "Paid", "Cancelled"],
      default: "Pending",
    },

    payoutDate: {
      type: Date,
    },

    paymentMethod: {
      type: String,
      default: "Online",
    },

    //RazorPay payment fields

    razorpayOrderId: {
      type: String,
    },

    razorpayPaymentId: {
      type: String,
    },

    razorpaySignature: {
      type: String,
    },

    paymentDate: {
      type: Date,
    },
  },
  { timestamps: true },
);

appointmentSchema.index(
  { doctorId: 1, date: 1, slotStartIso: 1 },
  { unique: true },
);

module.exports = mongoose.model("Appointment", appointmentSchema);
