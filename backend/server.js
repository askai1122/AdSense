const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;  // 👈 Railway ka PORT use karo

// Middleware
app.use(cors());
app.use(bodyParser.json());

// File ka path
const dataFile = path.join(__dirname, "statsData.json");

// ✅ Save data
app.post("/save-data", (req, res) => {
  const { formId, formData } = req.body;

  fs.readFile(dataFile, "utf8", (err, data) => {
    let allData = {};
    if (!err && data) {
      allData = JSON.parse(data);
    }

    allData[formId] = formData;

    fs.writeFile(dataFile, JSON.stringify(allData, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ message: "Error saving data" });
      }
      res.json({ message: `Data saved for ${formId} ✅` });
    });
  });
});

// ✅ Get data
app.get("/get-data", (req, res) => {
  if (!fs.existsSync(dataFile)) {
    return res.json({});
  }

  fs.readFile(dataFile, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error reading data" });
    }
    res.json(JSON.parse(data || "{}"));
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
