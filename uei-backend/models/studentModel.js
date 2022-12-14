const mongoose=require('mongoose');
const emailvalidator=require('email-validator');
const bcrypt=require('bcrypt')
const crypto=require('crypto')

const db_link='mongodb+srv://karan:z3y9jmdZNP1S8f2g@cluster0.1gkntll.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(db_link)
.then(function(db){
    console.log('database connected');
}).catch((err)=>{
    console.log(err);
})

const studentSchema=mongoose.Schema({
    name:{
        type : String,
        required : true
    },
    email :{
        type : String,
        required : true,
        unique : true,
        validate : function(){
            return emailvalidator.validate(this.email);
        }
    },
    password : {
        type : String,
        required : true,
        minLength : 8,
    },
    confirmPassword : {
        type : String,
        required : false,
        minLength : 8,
        validate : function(){
            return this.confirmPassword==this.password;
        }
    },
    // role:{
    //     type : String,
    //     enum:['Admin','Student','CollegeAdmin'],
    //     default: 'Student'
    // },
    // profileImage:{
    //     type:String,
    //     default:'img/users/default.jpeg'
    // },
    // resetToken : String
})
studentSchema.pre("save",async function(){
    let salt=await bcrypt.genSalt();
    let hashedString=await bcrypt.hash(this.password,salt);
    this.password=hashedString;
    this.confirmPassword=undefined;
})

studentSchema.methods.createResetToken=function(){
    //creating unique token using npm i crypto
    const resetToken=crypto.randomBytes(32).toString("hex");
    this.resetToken=resetToken;
    return resetToken;
}

const studentModel=mongoose.model('studentModel',studentSchema);

module.exports=studentModel;