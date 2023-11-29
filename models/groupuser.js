const {Sequelize, DataTypes} = require('sequelize');

const sequelize = require('../utils/database');

const GroupUser = sequelize.define('groupUser',{
    id : {
        type : DataTypes.INTEGER,
        allowNull : false,
        autoIncrement : true,
        primaryKey : true,
    },
    isAdmin : {
        type : DataTypes.BOOLEAN,
        allowNull : false,
    },
    userName : {
        type : DataTypes.STRING,
        allowNull : false
    }
});

module.exports = GroupUser;