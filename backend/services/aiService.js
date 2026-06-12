const axios = require("axios");

/* ---------------- SAFE JSON EXTRACTOR ---------------- */
function extractJSON(text) {
  try {
    if (!text) return null;

    // Remove markdown blocks if any
    let cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Extract first valid JSON object
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start === -1 || end === -1) return null;

    const jsonString = cleaned.slice(start, end + 1);

    return JSON.parse(jsonString);
  } catch (err) {
    console.error("❌ JSON PARSE FAILED:", err.message);
    return null;
  }
}

/* ---------------- MAIN FUNCTION ---------------- */
async function generateAI(data) {
  try {
    const prompt = `
You are a STRICT MEDICAL JSON GENERATOR.

ABSOLUTE RULES:
- Output ONLY valid JSON
- NO markdown (no \`\`\`)
- NO explanation text
- NO extra characters before or after JSON
- NEVER truncate JSON
- NEVER continue writing after JSON ends

MEDICAL SAFETY RULES:
- Only suggest GENERIC medicines (Paracetamol, Antihistamine, Antacid)
- Do NOT use brand names
- Do NOT say "unable to determine"
- Always give a most probable diagnosis based on symptoms
- Keep medicine safe and common

OUTPUT FORMAT (STRICT):
{
  "diagnosis": "string",
  "notes": "string (short reasoning)",
  "prescription": [
    {
      "medicine": "string (generic medicine)",
      "dosage": "string",
      "tests": "string"
    }
  ]
}

Symptoms:
${data.symptoms?.join(", ") || "No symptoms provided"}
`;

    /* ---------------- CALL OLLAMA ---------------- */
    const response = await axios.post("http://localhost:11434/api/generate", {
      model: "phi3:mini",
      prompt,
      stream: false,
      options: {
        temperature: 0.1,
        top_p: 0.9,
        num_ctx: 512,
        num_predict: 180,
      },
    });

    const raw = response.data?.response || "";

    console.log("🧠 RAW AI RESPONSE:\n", raw);

    /* ---------------- PARSE ---------------- */
    let parsed = extractJSON(raw);

    /* ---------------- FALLBACK ---------------- */
    if (!parsed || !parsed.diagnosis || !parsed.prescription) {
      console.log("⚠️ Using fallback response");

      parsed = {
        diagnosis: "General viral infection / mild condition",
        notes:
          "Symptoms indicate common non-critical condition. Monitor and rest.",
        prescription: [
          {
            medicine: "Paracetamol",
            dosage: "500mg every 6–8 hours if fever",
            tests: "Not required",
          },
          {
            medicine: "Antihistamine",
            dosage: "Once daily if allergy symptoms",
            tests: "Not required",
          },
        ],
      };
    }

    /* ---------------- CLEAN OUTPUT ---------------- */
    const finalData = {
      diagnosis: parsed.diagnosis || "Not available",
      notes: parsed.notes || "No notes available",
      prescription: Array.isArray(parsed.prescription)
        ? parsed.prescription.map((p) => ({
            medicine: p.medicine || p.name || "Paracetamol",
            dosage: p.dosage || "As directed by physician",
            tests: p.tests || "Not required",
          }))
        : [],
    };

    return {
      success: true,
      message: "AI generated successfully",
      data: finalData,
    };
  } catch (error) {
    console.error("❌ ERROR:", error.message);

    return {
      success: false,
      message: "AI generation failed",
      errors: [error.message],
    };
  }
}

module.exports = { generateAI };
