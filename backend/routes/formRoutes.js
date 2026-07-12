const express = require("express");
const { saveData, getData } = require("../controllers/formController");

const router = express.Router();

router.post("/save-data", saveData);
router.get("/get-data", getData);

module.exports = router;
