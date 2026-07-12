const Form = require("../models/Form");

const saveData = async (req, res) => {
  try {
    const { formId, formData } = req.body;
    console.log("📥 Incoming data for", formId, JSON.stringify(formData, null, 2));

    const existing = await Form.findOne({ formId });

    if (formId.startsWith("countries")) {
      const newCountries = formData.countries || [];

      if (!Array.isArray(newCountries) || newCountries.length === 0) {
        return res.status(400).json({ message: "⚠️ No countries provided" });
      }

      if (existing) {
        console.log(`🟢 Replacing existing countries for ${formId}...`);
        existing.formData.countries = newCountries;
        existing.markModified("formData");
        await existing.save();
      } else {
        console.log(`🆕 Creating new countries document for ${formId}...`);
        await Form.create({
          formId,
          formData: { countries: newCountries },
        });
      }

      return res.json({
        message: `✅ ${newCountries.length} country record(s) saved for ${formId}`,
      });
    }

    if (existing) {
      existing.formData = formData;
      existing.markModified("formData");
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
};

const getData = async (req, res) => {
  try {
    const forms = await Form.find();

    const result = {};
    forms.forEach((doc) => {
      result[doc.formId] = doc.formData;
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error reading data" });
  }
};

module.exports = {
  saveData,
  getData,
};
