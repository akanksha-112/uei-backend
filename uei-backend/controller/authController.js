const express=require('express');
const bcrypt = require('bcrypt');
const studentModel=require('../models/studentModel');
const JWT = require('jsonwebtoken')
const jwt=require('jsonwebtoken')
const secretKey="hsagdjfsad5sd46fsdnfas3d4f%$kjsbf"

module.exports.signup=async function signup(req,res){
    try{
        let obj=req.body;
        let student=await studentModel.create(obj)
        // sendMail("signup",student)
        if(student){
            res.json({
                message : 'student signed up',
                data : student
            })
        }
        else{
            res.json({
                message : "error while signing up"
            })
        }
    }catch(err){
        res.json({
            message : err.message
        })
    }
}

module.exports.login=async function login(req,res){
    try {
        const credentials=req.body;
        const mail=credentials.email;
        if(mail===undefined){
            res.json({
                message : "enter email and password"
            })
        }
        const student=await studentModel.findOne({email: mail});
        const isVerified=await bcrypt.compare(credentials.password,student.password);
        if(isVerified){
            console.log(student)
            const uid=student['_id'];
            const jwt=JWT.sign({payload : uid},secretKey);
            res.cookie('login',jwt,{httpOnly : true});
            res.json({
                message : "Welcome student",
                student : student 
            })
        }
        else{
            res.json({
                message : "wrong credentials"
            })
        }
    } catch (err) {
        console.log("login error",err)
        res.status(500).json({
            message : err
        })
    }
}

module.exports.isAuthorised = function isAuthorised(roles){
    return function(req,res,next){
        if(roles.includes(req.role)){
            next();
        }else{
            res.status(401).json({
                message : "operation not allowed"
            })
        }
    }
}

// protect route

module.exports.protectRoute=async function protectRoute(req,res,next){
    try{
        let token;
        if(req.cookies.login){
            token=req.cookies.login
            let payload=jwt.verify(token,JWT_KEY)
            if(!payload){
                return res.json({
                    message : "student not verified",
                })
            }
            const student=await studentModel.findById(payload.payload);
            req.role=student.role
            req.id=student.id;  
            
            next(); 
            
        }else{
            //browser
            const client=req.get('User-Agent');
            if(client.includes("Mozilla")){
                return res.redirect('/login');
            }
            //poostman
            return res.json({
                message : "please login"
            })  
        }
    }catch(err){
        return res.json({
            message : err.message,
        })
    }
} 

module.exports.forgetPassword=async function forgetPassword(req,res) {
    let{emailv}=req.body;
    try{
        const student=await studentModel.findOne({email : emailv})
        if(student){
            const resetToken=student.createResetToken();
            let resetPasswordLink=`${req.protocol}://${req.get('host')}/resetPassword/${resetToken}`
            //send email to the student useing nodemailer
            let obj={
                resetPasswordLink : resetPasswordLink,
                email : emailv
            }
            sendMail("resetPassword",obj);
            return res.json({
                message : "link sent"
            })
        }else{
            res.json({
                message : "please signup"
            });
        }
        
    }catch(err){ 
        res.json({
            message : err.message
        })
    }
}

module.exports.resetPassword=async function resetPassword(req,res){
    try{
        const token=req.params.token
        let {password,confirmPassword}=req.body;
        const student=await studentModel.findOne({resetToken : token})
        // reset password and will save in db
        if(student){
            student.resetPasswordHandler()
            await student.save();
            res.json({
                message : "password changed successfully please login again"
            })
        }
        else{
            res.json({
                message : "student not found here"
            })
        }
    }catch(err){
        res.json({
            message : err.message
        })
    }
}

module.exports.logout=function logout(req,res) {
    res.cookie('login','',{maxAge : 1});
    res.json({
        message : "student logged out succesfully"
    })
}