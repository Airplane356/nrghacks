const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

// ✅ FIX: Allow requests from frontend (change to 3007)
app.use(cors({ origin: "http://localhost:3007" }));

// ✅ Allow preflight requests (OPTIONS method)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3007");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

const API_KEY = "AIzaSyD9K3Ayr4c32R4x54WI5K7fQ2gL0QN3yaI"; // Replace with your actual API key

app.post("/generate-resume", async (req, res) => {
  try {
    const { jobTitle, jobDescription, extractedText } = req.body;

    if (!jobTitle || !jobDescription || !extractedText) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    console.log("Generating LaTeX Resume for:", jobTitle);

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateText?key=${API_KEY}`,
      {
        prompt: `Generate a concise, one-page LaTeX resume based on the following extracted resume information: \n\n${extractedText}\n\n The resume should be tailored to this job description:\n\nJob Title: ${jobTitle}\n\n${jobDescription}\n\nFormat it using proper LaTeX syntax.`,
        max_tokens: 1000,
      }
    );

    console.log("API Response:", response.data);

    if (!response.data || !response.data.candidates || !response.data.candidates[0]) {
      return res.status(500).json({ error: "Failed to generate resume" });
    }

    res.json({ resume: response.data.candidates[0].output });

  } catch (error) {
    console.error("Error generating LaTeX resume:", error);
    res.status(500).json({ error: "Failed to generate resume." });
  }
});

// ✅ Change port from 5000 to a new one (use 4000, 8080, or environment variable)
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
