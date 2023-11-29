const User = require('../models/user');
const Message = require('../models/message');
const sequelize = require('../utils/database');
const { Op } = require('sequelize');

exports.sendMsg = async(req,res,next)=>{
    try{
        const msg = req.body.msg;
        const user = req.user;
        const groupId = req.body.groupId
        // creating a new nessage
        await Message.create({
            message : msg,
            userId : user.id,
            username : user.userName,
            groupId : groupId
        })
        res.json({msg : 'message Sent', success : true})

    }
    catch(err){
        console.log(err)
        res.json({msg : 'Something went Wrong', success : false})
    }
};

exports.getNewMsg = async(req,res,next)=>{
    try{
        let newMsgArray = await Message.findAll({
            where : {
                id : {
                    [Op.gt] : +req.query.lastMsgId
                },
                groupId : req.query.groupId
            }
        })
        res.json({newMsgArray : newMsgArray, success : true})
    }
    catch(err){
        console.log(err);
        res.json({msg : 'something went wrong', success : false})
    }
};