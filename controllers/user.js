const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt=require('jsonwebtoken');
require("dotenv").config();

exports.postSignup = async (req, res, next) => {
    try {
        const { username, email, password,phonenum } = req.body;
        if (!email) {
            throw new Error('Please enter email');
        }
        const existingUser = await User.findOne({ where: { email: email } });
        if (existingUser) {
            return res.status(400).json({ err: 'User already exists' });
        }
        const saltrounds = 10;
        bcrypt.hash(password, saltrounds, async (err, hash) => {
            const user = await User.create({
                userName: username, email: email,phNo:phonenum,password: hash
            });
            return res.status(201).json({ message: 'User created successfully' });
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};




