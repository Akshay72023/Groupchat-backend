const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');

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
           groupId : group.id,
           isAdmin : true,
           userName : req.user.userName
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
        console.log(req.body.email);
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
                isAdmin : false,
                userName : user.userName
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

exports.getAllMembers = async(req,res,next)=>{
    const t = await sequelize.transaction()
    try{
        let user = req.user;
        let groupId = req.query.groupId;
        // finding all members
        let result = await GroupUser.findAll({
            where : {groupId : groupId},
            transaction : t,
        })
        await t.commit()
        res.json({success : true, userArray : result})
    }
    catch(err){
        console.log(err)
        await t.rollback()
        res.json({success : false})
    }
}

exports.removeMember = async(req,res,next)=>{
    // const t = await sequelize.transaction()
    try{
        let user = req.user;
        let rmvUserId = req.body.rmvUserId;
        let groupId = req.body.groupId;
        //first checking if user requesting to remove member is admin or not 
        let result = await GroupUser.findOne({
            where : {
                [Op.and] : [
                    {groupId : groupId},
                    {userId : user.id},
                ]
            }
        })

        if(result.isAdmin){
            // if user is admin finding rmvuser and destroying it
            let userToDestroy = await GroupUser.findOne({
                where : {
                    [Op.and] : [
                        {groupId : groupId},
                        {userId : rmvUserId}
                    ]
                },
            })

            if(userToDestroy){
                userToDestroy.destroy()
                // await t.commit()
                res.json({success : true})
            }
            else{
                res.json({msg : 'Something went wrong', success : false})
            }
        }
        else{
            // if user is not admin
            // await t.rollback()
            res.json({msg : 'You are not Admin',success : false})
        }

    }
    catch(err){
        console.log(err)
        // await t.rollback()
        res.json({msg : 'Something Went Wrong', success : false})
    }

}


exports.makeAdmin = async(req,res,next)=>{
    try{
        let user = req.user;
        let mkAdminUserId = req.body.mkAdminUserId;
        let groupId = req.body.groupId;
        //first checking if user requesting to make some user admin is itself admin or not 
        let result = await GroupUser.findOne({
            where : {
                [Op.and] : [
                    {groupId : groupId},
                    {userId : user.id},
                ]
            }
        })

        if(result.isAdmin){
            // making mkAdmin user admin of group
            let userToMkAdmin = await GroupUser.findOne({
                where : {
                    [Op.and] : [
                        {groupId : groupId},
                        {userId : mkAdminUserId}
                    ]
                },
            })

            if(userToMkAdmin){
                // making user admin
                userToMkAdmin.isAdmin = true;
                userToMkAdmin.save()
                res.json({success : true})

            }
            else{
                res.json({msg : 'Something went wrong' ,success : false})
            }
        }
        else{
            res.json({msg : 'You are not Admin', success : false})
        }
    }
    catch(err){
        console.log(err)
        res.json({msg : 'Something Went Wrong', success : false})
    }
}


exports.removeAdmin = async(req,res,next)=>{
    try{
        let user = req.user;
        let rmAdminUserId = req.body.rmAdminUserId;
        let groupId = req.body.groupId;
        //first checking if user requesting to remove some admin is itself admin or not 
        let result = await GroupUser.findOne({
            where : {
                [Op.and] : [
                    {groupId : groupId},
                    {userId : user.id},
                ]
            }
        })

        if(result.isAdmin){
            // removing rmAdminUser from admin of the group
            let adminToRemove = await GroupUser.findOne({
                where : {
                    [Op.and] : [
                        {groupId : groupId},
                        {userId : rmAdminUserId}
                    ]
                },
            })

            if(adminToRemove){
                // removing from admin
                adminToRemove.isAdmin = false;
                adminToRemove.save()
                res.json({success : true})

            }
            else{
                res.json({msg : 'Something went wrong' ,success : false})
            }
        }
        else{
            res.json({msg : 'You are not Admin', success : false})
        }
    }
    catch(err){
        console.log(err)
        res.json({msg : 'Something Went Wrong', success : false})
    }
}