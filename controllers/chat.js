const User = require('../models/user');
const Message = require('../models/message');
const sequelize = require('../utils/database');

exports.sendMsg = async(req,res,next)=>{
    const t = await sequelize.transaction()
    try{
        const msg = req.body.msg;
        const user = req.user
        // creating a new nessage
        await Message.create({
            message : msg,
            userId : user.id,
            username : user.userName,
        })
        await t.commit()
        res.json({msg : 'message Sent', success : true})

    }
    catch(err){
        await t.rollback()
        console.log(err)
        res.json({msg : 'Something went Wrong', success : false})
    }
};

exports.getMsg = async(req,res,next)=>{
    let t = sequelize.transaction()
    try{
        // getting all the messages from DB
        let msgArray = await Message.findAll({
            order : [
                ['createdAt','ASC']
            ]
        })
        res.json({msgArray : msgArray, success : true})
    }
    catch(err){
        console.log(err);
        res.json({msg : 'something went wrong', success : false})
    }
};