const express = require("express");
const SettingsController = require("../controllers/SettingsController");

const router = express.Router();

router.get("/status", SettingsController.getStatus);

router.get("/zones", SettingsController.getZones);
router.post("/zones", SettingsController.setZones);
router.post("/record/update", SettingsController.updateRecord);

router.get("/credentials", SettingsController.getAWSCredentials);
router.post("/credentials", SettingsController.setAWSCredentials);

router.get("/settings", SettingsController.getGeneralSettings);
router.post("/settings", SettingsController.setGeneralSettings);

router.get("/log", SettingsController.getLog);

module.exports = router;
