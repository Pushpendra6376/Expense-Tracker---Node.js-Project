const Expense = require("../models/expense");
const DownloadedReport = require("../models/downloadedReport");
const { uploadToS3 } = require("../utils/s3");
const { Op } = require("sequelize");

// CSV escape helper
const escapeCsv = (field) => {
    if (field == null) return "";
    const str = String(field);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};

exports.getReportSummary = async (req, res) => {
    try {
        const limit = Number(req.query.limit) || 10;

        const expenses = await Expense.findAll({
            where: { userId: req.user.userId },
            order: [["createdAt", "DESC"]],
            limit,
            raw: true
        });

        const allExpenses = await Expense.findAll({
            where: { userId: req.user.userId },
            attributes: ["amount", "category"],
            raw: true
        });

        let totalIncome = 0;
        let totalExpense = 0;

        for (const exp of allExpenses) {
            const isIncome =
                exp.category.toLowerCase() === "income" ||
                exp.category.toLowerCase() === "salary";

            if (isIncome) totalIncome += Number(exp.amount);
            else totalExpense += Number(exp.amount);
        }

        res.status(200).json({
            latestExpenses: expenses,
            totalCount: allExpenses.length,
            totalIncome,
            totalExpense,
            balance: totalIncome - totalExpense
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to load report summary" });
    }
};

/**
 * GET /report/download
 * Full CSV download
 */
exports.downloadExpenseReport = async (req, res) => {
    try {
        if (!req.user.isPremium) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const expenses = await Expense.findAll({
            where: { userId: req.user.userId },
            order: [["createdAt", "ASC"]],
            raw: true
        });

        if (!expenses.length) {
            return res.status(400).json({ message: "No expenses found" });
        }

        const header = ["Date", "Description", "Category", "Income", "Expense"];

        const rows = expenses.map(exp => {
            const isIncome =
                exp.category.toLowerCase() === "income" ||
                exp.category.toLowerCase() === "salary";

            return [
                exp.createdAt.toISOString().split("T")[0],
                escapeCsv(exp.description),
                escapeCsv(exp.category),
                isIncome ? Number(exp.amount).toFixed(2) : "",
                !isIncome ? Number(exp.amount).toFixed(2) : ""
            ].join(",");
        });

        const csvData = [header.join(","), ...rows].join("\n");

        const fileName = `expense-${req.user.userId}-${Date.now()}.csv`;
        const fileKey = `reports/${req.user.userId}/${fileName}`;

        const fileUrl = await uploadToS3(csvData, fileKey);

        await DownloadedReport.create({
            userId: req.user.userId,
            fileUrl,
            fileName
        });

        res.status(200).json({ fileUrl });

    } catch (err) {
        console.error("Download error:", err);
        res.status(500).json({ message: "Download failed" });
    }
};

exports.getDownloadedReports = async (req, res) => {
    try {
        const reports = await DownloadedReport.findAll({
            where: { userId: req.user.userId },
            attributes: [
                "id",
                "fileName",
                "fileUrl",
                "createdAt"
            ],
            order: [["createdAt", "DESC"]],
            raw: true
        });

        res.status(200).json({
            count: reports.length,
            reports
        });

    } catch (err) {
        console.error("Fetch report history error:", err);
        res.status(500).json({
            message: "Failed to fetch download history"
        });
    }
};
