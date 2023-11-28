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