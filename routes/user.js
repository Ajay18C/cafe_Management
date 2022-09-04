const express = require('express');
const connection = require('../connection');
const router = express.Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const nodemailer = require('nodemailer');

router.post('/signup',(req,res)=>{
    let user = req.body;
    query = "select email,password,status,role from user where email=?"
    connection.query(query,[user.email],(err,results)=>{
        if(!err){
            if(results.length <= 0){
                query = "insert into user (name,contactNumber,email,password,status,role)values(?,?,?,?,'false','user')"
                connection.query(query,[user.name,user.contactNumber,user.email,user.password],(err,results)=>{
                    if(!err){
                        return res.status(200).json({message:"successfully registered"})
                    }else{
                        return res.status(500).json(err)
                    }
                });
            }else{
                return res.status(400).json({message:"Email already exists"})
            }
        }
    else{
        return res.status(500).json(err)
    }
    })
})

router.post('/login',(req,res)=>{
    const user = req.body;
    query = "select email,password,status,role from user where email=?"
    connection.query(query,[user.email],(err,results)=>{
        console.log(results)
        if(!err){
            if(results.length <=0 || results[0].password != user.password){
                return res.status(401).json({"message":"Incorrect username or password"});
            }else if(results[0].status === "false"){
                return res.status(401).json({"message":"Wait for admin approval"})
            }else if(results[0].password == user.password){
                const response = {email:results[0].email,role:results[0].role}
                const accessToken = jwt.sign(response,process.env.ACCESS_TOKEN,{expiresIn:'8h'})
                return res.status(200).json({token:accessToken})
            }else{
                return res.status(400).json({"message":"Something went wrong Please try again later !"})
            }
        }
        else{
            return res.status(500).json(err)
        }
    })
})

var transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.EMAIL,
        pass:process.env.PASSWORD
    }
})

router.post('/forgotPassword',(req,res)=>{
    const user = req.body;
    query = "select email,password from user where email=?"
    connection.query(query,[user.email],(err,results)=>{
        if(!err){
            if(results.length<=0){
                return res.status(200).json({"message":"password send successfully to your email."})
            }else{
                var mailOptions = {
                    from:process.env.EMAIL,
                    to:user.email,
                    subject:"Password by cafe management system",
                    html:"<p><b>Your login details for cafe management system </b><br><b>EMAIL:</b>"+results[0].email+"<br><b>PASSWORD:</b>"+results[0].password+"<br><a href='http://localhost:4200/'>Click here to login</a></p>"
                };
                transporter.sendMail(mailOptions,function(error,info){
                    if(error){
                        console.log(error)
                    }else{
                        console.log("Email sent :"+info.response)
                    }
                });
                return res.status(200).json({"message":"password send successfully to your email."})
            }
        }
        else{
            return res.status(500).json(err)
        }
    })
})

router.get('/getUser',(req,res)=>{
    query = 'select * from user where role = "user"'
    connection.query(query,(err,results)=>{
        if(!err){
            return res.status(200).json(results)
        }
        else{
            return res.status(500).json(err)
        }
    })
})

router.patch('/updateStatus',(req,res)=>{
    let user = req.body
    query = "update user set status=? where id =?";
    connection.query(query,[user.status],[user.id],(err,results)=>{
        if(!err){
            if(results.affectedRows == 0){
                return res.status(404).json({"message":"user id does not exists"});
            }else{
                return res.status(200).json({"message":"user updated successfully"})
            }
        }
        else{
            return res.status(500).json(err)
        }
    })
})

router.get('/checkToken',(req,res)=>{
    res.status(200).json({"message":"true"});
})

router.post('/changePassword',(req,res)=>{
    let user = req.body
})

module.exports = router