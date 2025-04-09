import { asyncHandler } from "../utils/asysns-handler.js";
import { ApiError } from "../utils/api-error.js";
import { User } from "../models/user.model.js";
import { upload } from "../middlewares/multer.middleware.js";
import { uplordFileToCloudinary } from "../utils/cloudinary.js";
import { sendMail,emailVerificationMailGenContent } from "../utils/mail.js";

const registerUser =  asyncHandler(async (req,res)=>{
    //! Take inputs from body
    //! Find user on basic of email
    //! IF existing user ha tho mat karo
    //! Create a user on Db 
    //! if nai huaa tha mat karo (error
    //! Genrate verification token
    //! Chaeck the avatar in the body ? uplord on cloudinary and save the url in db 
    //!  Send verfication mail to the user.
    //! send success response . 
    const {email,username,password} = req.body;

    const existingUser = await User.findOne({$or:[{username},{email}]});

    if(existingUser){
        throw new ApiError(402,"Already the email or username is associate in another account.");
    }



    const newUser = await User.create({email,username:username.toLowercase(),password});

    if(!newUser){
        throw new ApiError(501,"User is not created in db.")
    }

    console.log(req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path;
    if(avatarLocalPath){
        const avatar = await uplordFileToCloudinary(avatarLocalPath)
        newUser.avatar= {
            url:avatar?.url ?? "",
            localPath:avatarLocalPath??""
        }
    }

    const {hashedToken,unHashedToken,tokenExpiry}= await newUser.genrateTemoraryToken();

    newUser.emailVerificationToken = hashedToken
    newUser.emailVerificationExpiry = tokenExpiry
    await newUser.save()

    const user = await User.findOne(
                                    {_id:newUser._id},
                                    {username:1,email:1,fullName:1}
                                    )

    if(!user){
        throw new ApiError(500,"Unable to save newuser in database.");
    }

    const verificationUrl = `${process.env.BASE_URL}/api/v1/auth/verify:${unHashedToken}`
    const mailOptions = {
        email,
        subject: "Veryfication email.",
        mailgenContent:emailVerificationMailGenContent(username,verificationUrl)
    }

    await sendMail(mailOptions)

    return res
    .status(201)
    .json(new ApiResponse(201, "User registered successfully", user));

})

export {registerUser}