const express=require('express');
const app=express();
const studentRouter=express.Router();
const {signup,login,protectRoute,isAuthorised,resetPassword,forgetPassword,logout}=require('../controller/authController')

studentRouter.route('/:id')


studentRouter.route('/signup')
.post(signup)

studentRouter.route('/login')
.post(login)

//forget password
studentRouter.route('/forgetPassword')
.post(forgetPassword)

studentRouter.route('/resetPassword/:token')
.post(resetPassword);

module.exports=studentRouter;
