const Expense = require('../models/expense');
const DownloadedReport = require('../models/downloadedReport');
const {uploadToS3} = require('../utils/s3');

// Helper to safely format CSV fields (handles commas and quotes)
const escapeCsv = (field) => {
    if (field == null) return '';
    const stringField = String(field);
    // Agar field me comma ya newline hai, toh usko quotes me wrap karo
    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
};

exports.downloadExpenseReport = async (req, res) => {
    try {
        if (!req.user.isPremium) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const expenses = await Expense.findAll({
            where: { userId: req.user.userId },
            order: [["createdAt", "ASC"]],
            raw: true // Memory optimization: Sequelize object ki jagah plain JSON layega
        });

        if (!expenses.length) {
            return res.status(400).json({ message: "No expenses found" });
        }

        // CSV Header
        const header = ["Date", "Description", "Category", "Income", "Expense"];
        
        // Use Array map & join instead of string concatenation (Faster & Cleaner)
        const csvRows = expenses.map(exp => {
            const isIncome = 
                exp.category.toLowerCase() === "income" || 
                exp.category.toLowerCase() === "salary";

            return [
                exp.createdAt.toISOString().split("T")[0],
                escapeCsv(exp.description), // Fix: Comma issue handled
                escapeCsv(exp.category),
                isIncome ? exp.amount : "",
                !isIncome ? exp.amount : ""
            ].join(",");
        });

        // Combine header and rows
        const csvData = [header.join(","), ...csvRows].join("\n");

        const fileName = `expense-${Date.now()}.csv`;
        const fileKey = `reports/${req.user.userId}/${fileName}`;

        // Upload to S3
        const fileUrl = await uploadToS3(csvData, fileKey);

        await DownloadedReport.create({
            userId: req.user.userId,
            fileUrl,
            fileName,
        });

        res.status(200).json({ fileUrl });

    } catch (err) {
        console.error("Report Generation Error:", err);
        res.status(500).json({ message: "Download failed" });
    }
};

exports.getDownloadedReports = async (req, res) => {
    try {
        const reports = await DownloadedReport.findAll({
            where: { userId: req.user.userId },
            order: [["createdAt", "DESC"]],
        });

        res.status(200).json({ reports });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch reports" });
    }
};