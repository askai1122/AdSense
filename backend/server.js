const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// File ka path
const dataFile = path.join(__dirname, "statsData.json");

// ✅ API: Save data to JSON file
// ✅ Save sirf ek form ka data
app.post("/save-data", (req, res) => {
    const { formId, formData } = req.body;
  
    fs.readFile(dataFile, "utf8", (err, data) => {
      let allData = {};
      if (!err && data) {
        allData = JSON.parse(data);
      }
  
      // Sirf is form ka data update karo
      allData[formId] = formData;
  
      fs.writeFile(dataFile, JSON.stringify(allData, null, 2), (err) => {
        if (err) {
          return res.status(500).json({ message: "Error saving data" });
        }
        res.json({ message: `Data saved for ${formId} ✅` });
      });
    });
  });
  
  // ✅ Get sab forms ka data
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
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
