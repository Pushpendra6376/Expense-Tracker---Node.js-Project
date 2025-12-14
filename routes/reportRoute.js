const express = require("express");
const router = express.Router();

const {authenticate} = require("../middlewares/authMiddleware");
const downloadReportController = require("../controllers/downloadReportController");

router.get("/download", authenticate, downloadReportController.downloadExpenseReport);

router.get("/history", authenticate, downloadReportController.getDownloadedReports);

module.exports = router;
