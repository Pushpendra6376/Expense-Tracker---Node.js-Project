const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
console.log("API KEY LOADED:", process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash"
});

exports.predictCategory = async (description) => {
    try {
        const prompt = `Expense: "${description}"

Choose ONE category from:
Food, Petrol, Credit Card, Shopping, Travel
Return only the category name.`;

        const result = await model.generateContent(prompt);

        return result.response.text().trim();

    } catch (err) {
        console.error("AI CATEGORY ERROR:", err);
        return "Other";
    }
};
