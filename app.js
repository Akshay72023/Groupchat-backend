const express = require('express');
const sequelize = require('./utils/database');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path=require('path');

dotenv.config();
const app = express();
app.use(bodyParser.json());
app.use(cors({
    origin:"*",
    credentials: true
}));

const signupRoutes = require('./routes/user');
const passwordRoutes=require('./routes/forgotpassword');
const chatRoutes=require('./routes/chat');


app.use('/user',signupRoutes);
app.use('/password',passwordRoutes);
app.use('/chat',chatRoutes);


app.use((req,res,next)=>{
    res.sendFile(path.join(__dirname,`views/${req.url}`))
});

const User= require('./models/user');
const Forgotpassword=require('./models/forgotpassword');
const Message = require('./models/message');

User.hasMany(Forgotpassword);
Forgotpassword.belongsTo(User);
User.hasMany(Message);
Message.belongsTo(User);

sequelize
    .sync()
    //.sync({force:true})
    .then(() => {
        app.listen(5000, () => {
            console.log('Server is running on port 5000');
        });
    }).catch(err => {
        console.log('Error connecting to the database:', err);
    });
