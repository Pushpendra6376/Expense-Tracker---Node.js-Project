const express = require("express");
const router = express.Router();

const { authenticate } = require("../middlewares/authMiddleware");
const reportController = require("../controllers/downloadReportController");

/**
 * Report summary
 * Latest 10–15 expenses + totals
 * GET /report/summary?limit=15&type=monthly&month=2025-12
 */
router.get(
    "/summary",
    authenticate,
    reportController.getReportSummary
);

/**
 * Download full expense report (CSV)
 * Premium only
 * GET /report/download
 */
router.get(
    "/download",
    authenticate,
    reportController.downloadExpenseReport
);

/**
 * Download history
 * GET /report/history
 */
router.get(
    "/history",
    authenticate,
    reportController.getDownloadedReports
);

module.exports = router;
