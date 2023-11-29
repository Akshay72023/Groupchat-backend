const { v4: uuidv4 } = require('uuid');

const Group = require('../models/group');
const GroupUser = require('../models/groupuser');

const sequelize = require('../utils/database');
const User = require('../models/user');

exports.createNewGroup = async(req,res,next)=>{
    const t = await sequelize.transaction()
    try{
        const groupName = req.body.name;
        const uuid = uuidv4()
        let group = await Group.create({
            id : uuid,
            name: groupName,
        },
        {
            transaction : t
        })
        // now also storing this info in GroupUser table
        await GroupUser.create({
           userId : req.user.id,
           groupId : group.id 
        },
        {
            transaction : t,
        })
        await t.commit();
        res.json({grpId : group.id, success : true})
    }
    catch(err){
        await t.rollback()
        console.log(err);
        res.json({success : false})
    }

}

exports.getGroups = async(req,res,next)=>{
    const t = await sequelize.transaction();
    try{
        const user = req.user
        let groupArray = await user.getGroups({
            transaction : t,
        })                              // magic method
        await t.commit();
        res.json({groupArray : groupArray, success : true})

    }
    catch(err){
        await t.rollback();
        console.log(err);
        res.json({success : false})
    }
}


exports.findGroup = async(req,res,next)=>{
    const t = await sequelize.transaction();
    try{
        const groupId = req.query.groupId;
        let group = await Group.findByPk(groupId,{transaction:t});
        await t.commit();
        res.json({group : group, success : true})

    }
    catch(err){
        await t.rollback()
        console.log(err)
        res.json({success : false})
    }
}

exports.addUser = async(req,res,next)=>{
    const t = await sequelize.transaction()
    try{
        // first finding the user of given email
        let user = await User.findOne({
            where : {email : req.body.email},
            transaction : t
        })
        // if we find user 
        if(user){
            // connecting user to group 
            await GroupUser.create({
                userId : user.id,
                groupId : req.body.groupId,
            },{transaction : t})

            await t.commit()
            res.json({msg : 'User Added Succesfully', success : true})
        }
        else{
            await t.rollback()
            res.json({msg : 'User Not Found', success : false})
        }
    }
    catch(err){
        console.log(err)
        await t.rollback()
        res.json({msg : 'Something Went Wrong',success : false})
    }
}