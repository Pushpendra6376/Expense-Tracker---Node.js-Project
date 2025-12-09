const express = require("express");
const path = require("path");
require("dotenv").config();
const sequelize = require("./utils/db-collection"); 
const authRoutes = require("./routes/authRoute"); 
const expenseRotues = require('./routes/expenseRoute');
const paymentRoute = require('./routes/paymentRoute');
const userRoute = require('./routes/userRoute');
const forgotPasswordRoute = require('./routes/forgetPasswordRoute');

const app = express();

// Middleware to accept JSON data
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});

app.get('/expense.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'expense.html'));
});


app.get('/reset-password.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'reset-password.html'));
});


app.use('/auth', authRoutes);
app.use('/expense', expenseRotues);
app.use('/payment', paymentRoute);
app.use('/user', userRoute);
app.use('/password', forgotPasswordRoute)

// Database connection check
sequelize.authenticate()
  .then(() => console.log("Database Connected Successfully"))
  .catch((err) => console.log("DB Connection is Failed:", err));

// syncing our tables 
// sequelize.sync()
//   .then(() => console.log("All models synced successfully"))
//   .catch((err) => console.log("Sync error:", err));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
