import mongoose , {Schema}from "mongoose"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import { type } from "os";
const userSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    fullName:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        unique:true,
        required:true,
        index:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true,
    },
    avatar:{
        url:{
            type:String,
            trim:true,
            default:"https://placehold.co/600x400"
        },
        localPath:{
            type:String,
            trim:true
        }
    },
    isEmailVerified:{
        type:Boolean,
        default:false
    },
    refreshToken:{
        type:String
    },
    emailVerificationToken:{
        type:String
    },
    emailVerificationExpiry:{   
        type:Date
    },
    forgetPasswordToken:{
        type:String,
    },
    forgetPasswordExpiry:{
        type:Date
    }

},{timestamps:true});


userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        return next()
    }
    this.password = await bcrypt.hash(this.password,10);
    next();
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.genrateAccessToken = async function(){
   return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            userName:this.userName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn:process.env.ACCESS_TOKEN_EXPIRY}
    )
}
userSchema.methods.genrateRefreshToken = async function(){
    return jwt.sign(
        {
            _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.genrateTemoraryToken = async function(){
    const  unHashedToken = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto.createHash('sha256').update(unHashedToken).digest("hex");
    const tokenExpiry = Date.now() + (20*60*1000) //20min add
    return {hashedToken,unHashedToken,tokenExpiry}
}

userSchema.methods.genrateForgetPasswordToken = async function(){
    const  unHashedToken = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto.createHash('sha256').update(unHashedToken).digest("hex");
    const tokenExpiry = Date.now() + (20*60*1000) //20min add
    this.forgetPasswordToken = hashedToken
    this.forgetPasswordExpiry = tokenExpiry
    return unHashedToken
}

export const User = mongoose.model("User",userSchema);



