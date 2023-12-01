const BackupMsg = require('../models/backupmessage');
const Message = require('../models/message');
const sequelize = require('../utils/database');

exports.migrateData = async()=>{
    const t = await sequelize.transaction()
    try{
        // first finding all messages from message table
        let msgArray = await Message.findAll({transaction : t});
        // now itterating through whole array and copying it in backupMsg table
        for(let msgObj of msgArray){
            await BackupMsg.create({
                message : msgObj.message,
                userId : msgObj.userId,
                username : msgObj.username,
                groupId: msgObj.groupId
            },{transaction : t})

        }
        // msgArray.forEach(async(msgObj)=>{
        //     await BackupMsg.create({
        //         message : msgObj.message,
        //         userId : msgObj.userId,
        //         username : msgObj.username,
        //         groupId : msgObj.groupId,
        //     },{transaction : t})
        // })
        // now deleting all messages from message table 

        await Message.destroy({ where: {}, transaction: t });
        await t.commit()
        console.log('Data Migration successfully completed')
    }

    catch(err){
        await t.rollback()
        console.log('Some error occurd during data migration',err)
    }
};