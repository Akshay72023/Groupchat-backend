const User = require('../models/user');
const GroupUser = require('../models/groupuser');
const sequelize = require('../utils/database');
const { Op } = require('sequelize');
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

function generateJWT (user){
    return jwt.sign({userId : user.id},process.env.TOKEN_SECRET)
}

exports.postLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ where: { email: email } });
        if (!existingUser) {
            return res.status(404).json({ err: "User not found" });
        }
        bcrypt.compare(password, existingUser.password, (err, result) => {
            if (err) {
                throw err;
            }
            if (result) {
                return res.status(200).json({success:true,message: 'Login successful' ,token : generateJWT(existingUser),username : existingUser.userName ,email : existingUser.email});
            } else {
                return res.status(401).json({success:false, err: "Unauthorized: Invalid password" });
            }
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

exports.checkIfAdmin = async(req,res,next)=>{
    const t = await sequelize.transaction();
    try{
        let user = req.user;
        let groupId = req.body.groupId;
        // checking if user is admin of group
            // first finding in GroupUser
        let response = await GroupUser.findOne({
            where : {
                [Op.and] : [
                    {userId : user.id},
                    {groupId : groupId}
                ]
            },transaction : t
        })
        await t.commit()
        // checking if admin or not
        if(response.isAdmin){
            res.json({success : true})
        }
        else{
            res.json({success : false,msg : 'You are not Admin'})
        }
    }
    catch(err){
        console.log(err);
        await t.rollback();
        res.json({success : false, msg : "Something Went Wrong"})
    }

};


