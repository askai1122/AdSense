const mongoose = require("mongoose");

const formSchema = new mongoose.Schema({
  formId: { type: String, required: true, unique: true },
  formData: { type: Object, required: true },
});

const Form = mongoose.model("Form", formSchema);

module.exports = Form;
