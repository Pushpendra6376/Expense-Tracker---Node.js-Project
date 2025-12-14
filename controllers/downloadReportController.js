const Expense = require('../models/expense');
const DownloadedReport = require('../models/downloadedReport');
const {uploadToS3} = require('../utils/s3');

exports.downloadExpenseReport = async (req, res) => {
    try {
        if (!req.user.isPremium) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const expenses = await Expense.findAll({
            where: { userId: req.user.userId },
            order: [["createdAt", "ASC"]],
        });

        if (!expenses.length) {
            return res.status(400).json({ message: "No expenses found" });
        }

        let csv = "Date,Description,Category,Income,Expense\n";

        expenses.forEach(exp => {
            const isIncome =
                exp.category.toLowerCase() === "income" ||
                exp.category.toLowerCase() === "salary";

            csv += `${exp.createdAt.toISOString().split("T")[0]},${exp.description},${exp.category},${isIncome ? exp.amount : ""},${!isIncome ? exp.amount : ""}\n`;
        });

        const fileName = `expense-${Date.now()}.csv`;
        const fileKey = `reports/${req.user.userId}/${fileName}`;

        const fileUrl = await uploadToS3(csv, fileKey);

        await DownloadedReport.create({
            userId: req.user.userId,
            fileUrl,
            fileName,
        });

        res.status(200).json({ fileUrl });

    } catch (err) {
        console.error(err);
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