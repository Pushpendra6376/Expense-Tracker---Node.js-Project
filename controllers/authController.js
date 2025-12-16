const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const User = require('../models/user')
const TotalExpense = require('../models/totalExpense');

exports.signUp = async (req, res) =>{
    try {
        const {username, email, password} = req.body;

        const existingUser = await User.findOne({where: {email}});
        if(existingUser){
            return res.status(400).json({message: "Email is already registered"})
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
        });

        await TotalExpense.create({
            userId: newUser.id,
            totalExpense: 0
        });
        
        res.status(201).json({
            message: "User is registered successfully",
            user:{id:newUser.id, username, email}
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Something went wrong!"});
    }
}

exports.login = async (req,res) =>{
    try {
        const {email, password} = req.body;

        const user = await User.findOne({where: {email}});
        if(!user){
            return res.status(404).json({message:"User not found"});
        }

        const validPass = await bcrypt.compare(password, user.password);
        if(!validPass){
            return res.status(401).json({message: "password is incorrect"});
        }

        // [UPDATED] Removed isPremium from token to prevent staleness
        const token = jwt.sign({ 
            userId: user.id, 
            email: user.email
        },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.status(200).json({
            message:"User logged in successfully",
            token: token,
            user:{
                id:user.id,
                username: user.username,
                email: user.email,
                isPremium: user.isPremium
            }
        })
    } catch (error) {
        res.status(500).json({ error: "Something went wrong!"});
    }
}