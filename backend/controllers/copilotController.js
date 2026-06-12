const Appointment = require("../modals/Appointment");
const { generateAI } = require("../services/aiService");

const generateCopilot = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Appointment ID required",
      });
    }

    const appointment =
      await Appointment.findById(appointmentId).populate("patientId");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    const aiInput = {
      symptoms: Array.isArray(appointment.symptoms)
        ? appointment.symptoms
        : appointment.symptoms.split(","),

      allergies: appointment.patientId?.allergies?.split(",") || [],
      currentMedications:
        appointment.patientId?.currentMedications?.split(",") || [],
      chronicConditions:
        appointment.patientId?.chronicConditions?.split(",") || [],
    };

    console.log("AI INPUT 👉", aiInput);

    const aiResult = await generateAI(aiInput);

    console.log("AI RESULT 👉", aiResult);

    if (!aiResult || aiResult.success === false) {
      return res.status(500).json({
        success: false,
        message: "AI generation failed",
        errors: aiResult?.errors || ["Unknown AI error"],
      });
    }

    // 🔥 FIX: extract actual data
    const aiData = aiResult.data;

    const formattedPrescription = (aiData.prescription || []).map((p) => ({
      medicine: p.medicine || "",
      dosage: p.dosage || "",
      tests: p.tests || "",
    }));

    await Appointment.findByIdAndUpdate(appointmentId, {
      prescription: formattedPrescription,
      diagnosis: aiData.diagnosis || "",
      notes: aiData.notes || "",
    });

    return res.json({
      success: true,
      message: "AI generated successfully",
      data: aiData, // ✅ clean response
    });
  } catch (error) {
    console.error("❌ AI ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "AI failed",
      errors: [error.message || "Server error"],
    });
  }
};

module.exports = { generateCopilot };
