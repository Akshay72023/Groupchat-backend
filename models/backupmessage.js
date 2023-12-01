const {Sequelize, DataTypes} = require('sequelize');

const sequelize = require('../utils/database');

let BackupMsg = sequelize.define('backupmsg',{
    id : {
        type : DataTypes.INTEGER,
        primaryKey : true,
        allowNull : false,
        autoIncrement : true,
    },
    message : {
        type : DataTypes.STRING,
        allowNull : false,
    },
    username : {
        type : DataTypes.STRING,
        allowNull : false,
    },
    userId : {
        type : DataTypes.INTEGER,
        allowNull : false,
    },
    groupId: {
        type: DataTypes.STRING,
        allowNull: false,
    } 
});

module.exports = BackupMsg;