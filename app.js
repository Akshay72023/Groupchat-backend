const express = require('express');
const sequelize = require('./utils/database');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path=require('path');
const cors = require('cors');
const CronJob = require('cron').CronJob;
const dataMigration = require('./services/datamigration');
dotenv.config();
const app = express();
app.use(bodyParser.json());
app.use(cors());

const io = require('socket.io')(8000, {
    cors: {
      origin: '*',
    }
  });

  io.on('connection', (socket) => {
    console.log('A new user has connected with socket id:', socket.id);
  
    socket.on('sendMsg', (msgObj) => {
      console.log(msgObj.msg, msgObj.username, msgObj.time);
      io.to(msgObj.groupId).emit('message', msgObj);
    });
  
    socket.on('sendFile', (fileObj) => {
      io.to(fileObj.groupId).emit('fileMessage', fileObj);
    });
  
    socket.on('joinRoom', (room) => {
      socket.join(room);
    });
  
    socket.on('leaveRoom', (room) => {
      socket.leave(room);
    });
  });
  


const signupRoutes = require('./routes/user');
const passwordRoutes=require('./routes/forgotpassword');
const chatRoutes=require('./routes/chat');
const groupRoutes = require('./routes/group');


app.use('/user',signupRoutes);
app.use('/password',passwordRoutes);
app.use('/chat',chatRoutes);
app.use('/group',groupRoutes);


app.use((req,res,next)=>{
    res.sendFile(path.join(__dirname,`views/${req.url}`))
});

const User= require('./models/user');
const Forgotpassword=require('./models/forgotpassword');
const Message = require('./models/message');
const Group = require('./models/group');
const GroupUser = require('./models/groupuser');


User.hasMany(Forgotpassword);
Forgotpassword.belongsTo(User);
User.hasMany(Message);
Message.belongsTo(User);
User.belongsToMany(Group,{through : GroupUser,foreignKey : "userId"});
Group.belongsToMany(User,{through : GroupUser, foreignKey : 'groupId'});
Group.hasMany(Message);
Message.belongsTo(Group);

// using cron to schedule  msg transfer (from message table to backupMsg table) every night at 1AM 
let job = new CronJob(
  '0 1 * * *',
  dataMigration.migrateData,
  null,
  true,
  'Asia/Kolkata'
);

async function startServer() {
    try {
      await sequelize.
      //sync({force :true})
      sync();
      app.listen(5000, () => {
        console.log('Listening on port 5000');
      });
    } catch (err) {
      console.log('Error connecting to the database:', err);
    }
  }
  
startServer();
  

