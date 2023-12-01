const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

exports.uploadToS3 = (data,filename)=>{
    return new Promise((resolve,reject)=>{
        // first making an AWS instence
        let s3Instence = new AWS.S3({
            accessKeyId : process.env.AWS_USER_KEY,
            secretAccessKey : process.env.AWS_USER_SECRET,
        })

        // we have to upload buffer to aws so I am using readFile to read the image data  
        const fileData = fs.readFileSync(path.join(__dirname,'..',data.path))

        // making an object to upload to bucket
        let params = {
            Bucket : process.env.AWS_BUCKET_NAME,
            Key:filename,
            Body : fileData,
            ACL:'public-read',
        }

        // uploading to s3 bucket
        s3Instence.upload(params,(error,s3Response)=>{
            if(error){
                console.log('Error occurd :',error)
                reject(error)
            }
            else{
                console.log('file uploaded ')
                resolve(s3Response.Location)
            }
        })
    })
};