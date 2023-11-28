const express = require('express');
const sequelize = require('./utils/database');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path=require('path');

dotenv.config();
const app = express();
app.use(bodyParser.json());
app.use(cors());

const signupRoutes = require('./routes/user');


app.use('/user',signupRoutes);


app.use((req,res,next)=>{
    res.sendFile(path.join(__dirname,`views/${req.url}`))
});

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
