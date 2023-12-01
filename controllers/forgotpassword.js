const bcrypt = require('bcrypt');
const User = require('../models/user');
const Forgotpassword = require('../models/forgotpassword');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

exports.forgotpassword = async (req, res, next) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ where: { email } });
      console.log('forgot user>>>', user.email);
      if (user.email) {
        const id = uuidv4();
        const createForgotpassword = await Forgotpassword.create({
          id: id,
          active: true,
          userId: user.id,
        });
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER, 
            pass: process.env.EMAIL_PASS, 
          },
        });
        const mailOptions = {
          from: process.env.EMAIL_USER, 
          to: email,
          subject: 'Reset Password',
          text: 'Click the link below to reset your password:',
          html: `<p>Click the link below to reset your password:</p><a href="http://16.16.27.246:5000/password/resetpassword/${id}">Reset password</a>`
        };
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
        res.status(200).json({ message: 'Email sent successfully.', uuid: id });
      } else {
        res.status(404).json({ message: 'User not found.' });
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message, message: false });
    }
  };

  exports.resetpassword = (req, res) => {
    const id =  req.params.id;
    Forgotpassword.findOne({ where : { id }}).then(forgotpasswordrequest => {
        if(forgotpasswordrequest){
            forgotpasswordrequest.update({ active: false});
            res.status(200).send(`<html>
                        <body>
                            <script>
                                document.getElementById("form").addEventListener('submit',
                                async function (e) {
                                    e.preventDefault();
                                    console.log('called')
                              });
                            </script>
                            <form action="http://16.16.27.246:5000/password/updatepassword/${id}" id="form" method="get">
                            <label for="password">Enter New Password</label><br>
                            <input type="password" name="password" id="password" required/><br><br>
                            <button type="submit" >Reset password</button><br><br>
                            </form>
                        </body>
                      </html>`)
            res.end()

        }
    })
}
  


exports.updatepassword = (req, res) => {
  try {
      const { password } = req.query;
      console.log(password);
      const { id } = req.params;
      Forgotpassword.findOne({ where : { id: id }}).then(resetpasswordrequest => {
          User.findOne({where: { id : resetpasswordrequest.userId}}).then(user => {
              console.log('userDetails', user)
              if(user) {
                  //encrypt the password

                  const saltRounds = 10;
                  bcrypt.genSalt(saltRounds, function(err, salt) {
                      if(err){
                          console.log(err);
                          throw new Error(err);
                      }
                      bcrypt.hash(password, salt, function(err, hash) {
                          // Store hash in your password DB.
                          if(err){
                              console.log(err);
                              throw new Error(err);
                          }
                          user.update({ password: hash }).then(() => {
                              res.status(201).json( 'Successfuly update the new password' );
                            
                          })
                      });
                  });
          } else{
              return res.status(404).json({ error: 'No user Exists', success: false})
          }
          })
      })
  } catch(error){
      return res.status(403).json({ error, success: false } )
  }

}