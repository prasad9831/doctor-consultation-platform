const express = require("express");
const router = express.Router();
const { generateCopilot } = require("../controllers/copilotController");
const { authenticate } = require("../middleware/auth");

router.post("/generate", authenticate, generateCopilot);

module.exports = router;