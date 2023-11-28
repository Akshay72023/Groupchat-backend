const {Sequelize,DataTypes} = require('sequelize');
const sequelize= require('../utils/database');

const User= sequelize.define('user',{
    id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        autoIncrement:true,
        primaryKey:true
    },
    userName:{
        type: DataTypes.STRING
    },
    email:{
        type:DataTypes.STRING,
        unique:true
    },
    password: DataTypes.STRING,
    phNo: {
        type: DataTypes.STRING,
        unique : true
      }
});

module.exports = User;