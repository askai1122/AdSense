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
  try {
    const { formId, formData } = req.body;
    console.log("📥 Incoming data for", formId, JSON.stringify(formData, null, 2));

    let existing = await Form.findOne({ formId });

    // 🟢 Handle all "countries*" forms the same way (today, yesterday, etc.)
    if (formId.startsWith("countries")) {
      const newCountries = formData.countries || [];

      if (!Array.isArray(newCountries) || newCountries.length === 0) {
        return res.status(400).json({ message: "⚠️ No countries provided" });
      }

      if (existing) {
        console.log(`🟢 Updating existing countries document for ${formId}...`);

        const countries = existing.formData?.countries || [];

        newCountries.forEach((newC) => {
          // Get the key name dynamically (e.g., countrynametoday, countrynameyesterday, etc.)
          const nameKey = Object.keys(newC).find((k) => k.startsWith("countryname"));
          if (!nameKey) return;

          const newName = newC[nameKey].trim().toLowerCase();
          const index = countries.findIndex(
            (c) => c[nameKey]?.trim().toLowerCase() === newName
          );

          if (index !== -1) {
            countries[index] = newC; // update existing country
          } else {
            countries.push(newC); // add new country
          }
        });

        existing.formData.countries = countries;
        await existing.save();
      } else {
        console.log(`🆕 Creating new countries document for ${formId}...`);
        await Form.create({
          formId,
          formData: { countries: newCountries },
        });
      }

      return res.json({
        message: `✅ ${newCountries.length} country record(s) saved/updated for ${formId}`,
      });
    }

    // 🟣 Default: handle all non-country forms normally
    if (existing) {
      existing.formData = formData;
      await existing.save();
      console.log("🟣 Updated existing document for", formId);
    } else {
      await Form.create({ formId, formData });
      console.log("🆕 Created new document for", formId);
    }

    res.json({ message: `✅ Data saved for ${formId}` });
  } catch (err) {
    console.error("❌ Error saving data:", err);
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
