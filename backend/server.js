const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ MongoDB Atlas connection string
const mongoURI = "mongodb+srv://askarihaider46:sGgIRAgi2Msf8gTp@adsense.2ikkmm2.mongodb.net/?retryWrites=true&w=majority&appName=ADsense";

// ✅ Connect to MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Create Schema & Model
const formSchema = new mongoose.Schema({
  formId: { type: String, required: true, unique: true },
  formData: { type: Object, required: true },
});

const Form = mongoose.model("Form", formSchema);

// ✅ Save data
// app.post("/save-data", async (req, res) => {
//   const { formId, formData } = req.body;

//   try {
//     const existing = await Form.findOne({ formId });

//     if (existing) {
//       // Update existing document
//       existing.formData = formData;
//       await existing.save();
//     } else {
//       // Create new document
//       await Form.create({ formId, formData });
//     }

//     res.json({ message: `Data saved for ${formId} ✅` });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Error saving data" });
//   }
// });
app.post("/save-data", async (req, res) => {
  const { formId, formData } = req.body;

  try {
    let existing = await Form.findOne({ formId });

    if (existing) {
      // 🟩 If same country name already exists → update it
      const countries = existing.formData?.countries || [];
      const index = countries.findIndex(
        (c) => c.countrynametoday === formData.countrynametoday
      );

      if (index !== -1) {
        countries[index] = formData; // update existing
      } else {
        countries.push(formData); // add new country
      }

      existing.formData.countries = countries;
      await existing.save();
    } else {
      // 🆕 Create new document with first country entry
      await Form.create({
        formId,
        formData: { countries: [formData] },
      });
    }

    res.json({ message: `Country added/updated for ${formId} ✅` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving data" });
  }
});

// ✅ Get all data
app.get("/get-data", async (req, res) => {
  try {
    const forms = await Form.find();

    // Convert array to object: { formId1: data1, formId2: data2, ... }
    const result = {};
    forms.forEach((doc) => {
      result[doc.formId] = doc.formData;
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error reading data" });
  }
});

// ✅ For Railway/Heroku etc.
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
