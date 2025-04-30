import { asyncHandler } from "../utils/asysns-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { User } from "../models/user.model.js";
import { upload } from "../middlewares/multer.middleware.js";
import { uplordFileToCloudinary } from "../utils/cloudinary.js";
import { sendMail, emailVerificationMailGenContent, forgetPasswordMailGenContent } from "../utils/mail.js";
import crypto from "crypto";
import jwt from "jsonwebtoken"

const registerUser = asyncHandler(async (req, res) => {
    const { email, username, password, fullName } = req.body;

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
        return res.status(402).json(new ApiError(402, "Already the email or username is associate in another account."))
    }
    console.log(username, typeof username)
    const newUser = await User.create({ email, username: username.toLowerCase(), password, fullName });

    if (!newUser) {
        res.status(500).json(new ApiError(501, "User is not created in db."));
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    if (avatarLocalPath) {
        const avatar = await uplordFileToCloudinary(avatarLocalPath)
        newUser.avatar = {
            url: avatar?.url ?? "",
            localPath: avatarLocalPath ?? ""
        }
    }

    const { hashedToken, unHashedToken, tokenExpiry } = await newUser.genrateTemoraryToken();

    newUser.emailVerificationToken = hashedToken
    newUser.emailVerificationExpiry = tokenExpiry
    await newUser.save()

    const user = await User.findOne(
        { _id: newUser._id },
        { username: 1, email: 1, fullName: 1 }
    )

    if (!user) {
        return res.status(500).json(new ApiError(500, "Unable to save newuser in database."))
    }

    const verificationUrl = `${process.env.BASE_URL}/api/v1/auth/verify/${unHashedToken}`
    const mailOptions = {
        email,
        subject: "Veryfication email.",
        mailgenContent: emailVerificationMailGenContent(username, verificationUrl)
    }

    await sendMail(mailOptions)

    return res
        .status(201)
        .json(new ApiResponse(201, "User registered successfully", user));

})

const veryfiEmail = asyncHandler(async (req, res) => {
    const { token } = req.params;
    console.log(token)
    const hashedToken = crypto.createHash('sha256').update(token).digest("hex");
    console.log(hashedToken);
    const user = await User.findOne({
        $and: [{
            emailVerificationToken: hashedToken,
            emailVerificationExpiry: { $gt: Date.now() }
        }]
    });
    if (!user) {
        return res.status(404).json(new ApiError(404, "Invalid token or token expairy."))
    }
    user.isEmailVerified = true
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save();
    return res.status(200).json(new ApiResponse(200, "User veryfied Successfully."))
})
const loginUser = asyncHandler(async (req, res) => {
    //login handler
    // get email and password from body
    // check if user exists
    // agar user exist nahi karta to error return kro
    // check karo user verified hai ya nahi
    // agar verified nahi hai to error return kro
    //password match karna hai
    //agar password nahi match karta to error return kro
    //user ke liye accesstoken and refresh token genrate karenge
    // refresh token ko user ke database me save karenge
    //access tpoken and refresh token ko cookie me set karenge
    // response return karnege ke user loged in succesfully
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
        return res.status(404).json(new ApiError(404, "User not Found."))
    }
    if (!existingUser.isEmailVerified) {
        return res.status(402).json(new ApiError(402, "User is not veryfied."))
    }

    const isPasswordMatched = existingUser.isPasswordCorrect(password);
    console.log("Hello")
    if (!isPasswordMatched) {
        return res.status(402).json(new ApiError(402, "Password is not correct."))
    }
    const accesstoken = await existingUser.genrateAccessToken();
    const refreshToken = await existingUser.genrateRefreshToken();
    existingUser.refreshToken = refreshToken;
    await existingUser.save();
    console.log(existingUser);
    res.cookie("accessToken", accesstoken, {
        httpOnly: true,
        secure: true,
        maxAge: 15 * 60 * 1000
    })
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: 24 * 60 * 60 * 1000
    })

    return res.status(200).json(new ApiResponse(200, "User login Successfuly."));

})

const forgetPassword = asyncHandler(async (req, res) => {
    // forget password request handler
    // body se user ka email le rahe hai
    // email ko validate kar rahe hai
    // agar nhai hai to error
    // user find kao is email se
    // user nahi hai to error
    // password reset token genrate karna hai
    // user save karna hai
    // email send karna hai
    // response sucess karna hai
    const { email } = req.body;
    if (!email) {
        return res.status(402).json(new ApiError(402, "Email is not provided"));
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json(new ApiError(404, "User not Found."));
    }
    const unhashedToken = await user.genrateForgetPasswordToken();
    await user.save();
    const resetPasswordUrl = `${process.env.BASE_URL}/api/v1/auth/reset-password/${unhashedToken}`
    const mailOptions = {
        email,
        subject: "Reset Password",
        mailgenContent: forgetPasswordMailGenContent(user.username, resetPasswordUrl)
    }
    await sendMail(mailOptions);

    return res.status(200).json(new ApiResponse(200, "Successfully sent reset password link."))
})

const resetPassword = asyncHandler(async (req, res) => {
    // reset password handler
    // passwords ko body se nikalo
    // toke ko query se nikalo
    // password or cnfPassword ko compare karo
    // agae same nahi hai to error
    // token ko hash karalo
    // uss hash se user ko find karo
    // user nahi mila to error
    // agar user mila to password ko update karo
    // forgotPasswordToken ko undefined karo
    // forgotPasswordExpiry ko undefined karo
    // user ko save kardo
    // success message return karo

    const { password, confirmPassword } = req.body;
    const { token } = req.params;

    const hashedToken = crypto.createHash('sha256').update(token).digest("hex");

    const user = await User.findOne({
        $and: [{ forgetPasswordToken: hashedToken },
        { forgetPasswordExpiry: { $gt: Date.now() } }]
    })

    if (!user) {
        return res.status(404).json(new ApiError(404, "User not found with the token."))
    }

    user.password = password;
    user.forgetPasswordToken = undefined;
    user.forgetPasswordExpiry = undefined;
    await user.save()
    return res.status(200).json(new ApiResponse(200, "Password Reset SuccessFully."));
})

const logoutUser = asyncHandler(async (req, res) => {
    //!logout controller
    //banda logged in hum authenticate kara rahe hai
    // uske id ko req.user se access kar saket hai .
    //us id se user find karlenge and refreshToken ko "" set karenge
    // cokkes ko bhi khali kaenge
    //response bhejdenge ki bhai user logout ho gaya.
    const { _id } = req.user

    console.log(_id)

    const user = await User.findById(_id).updateOne({ refreshToken: "" });
    if (!user) {
        return res.status(404).json(new ApiError(404, "User not found."))
    }
    res.cookie("accessToken", "");
    res.cookie("refreshToken", "");

    return res.status(200).json(new ApiResponse(200, "User logout Successfully."));

})

const refreshAccessTokenHandler = asyncHandler(async (req, res) => {
    const { refreshToken } = req.cookies
    if (!refreshToken) {
        return res.status(402).json(new ApiError(402, "Refresh token is not present."))
    }

    try {
        const decoded = await jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded._id).select("-password -refreshToken");
        if (!user) {
            return res.status(402).json(new ApiError(402, "User is not found."));
        }

        const newRefreshToken = await user.genrateRefreshToken();
        const accessToken = await user.genrateAccessToken();
        user.refreshToken = newRefreshToken;
        await user.save();

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            maxAge: 15 * 60 * 1000
        })
        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: true,
            maxAge: 24 * 60 * 60 * 1000
        })

        return res.status(200).json(new ApiResponse(200, "Refresh Token Created Successfully."));

    } catch (error) {
        console.log((new ApiError(401, "Invalid token or expired.")), "\nerror :", error);
        return next(new ApiError(401, "Invalid token or expired."))
    }
})


const resendEmailVerification = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json(new ApiError(404, "User not found by with this email."))
    }
    const { hashedToken, unHashedToken, tokenExpiry } = await user.genrateTemoraryToken();
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;
    const verificationUrl = `${process.env.BASE_URL}/api/v1/auth/verify/${unHashedToken}`
    const mailOptions = {
        email,
        subject: "Veryfication email.",
        mailgenContent: emailVerificationMailGenContent(username, verificationUrl)
    }

    await sendMail(mailOptions);
    return res.status(200).json(new ApiResponse(200, "Verfication url send successfully."));

});


const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { password, newPassword, confirmPassword } = req.body;
    const { _id, email, username } = req.user;

    const user = await User.findById(_id);
    console.log(user    )
    const isOldPAsswordMathed = user.isPasswordCorrect(password);
    if (!isOldPAsswordMathed) {
        return res.status(402).json(new ApiError(402, "Old password is not matched."))
    }
    user.password = newPassword;
    await user.save()

    return res.status(200).json(new ApiResponse(200, "Password changed successfully."));
});

const getCurrentUser = asyncHandler(async (req, res, next) => {
    const { _id } = req.user;
    const user = await User.findById(_id).select("-password -refreshToken");
    if(!user){
      return next(new ApiError(404, "User not found."));
    }
    return res.status(200).json(new ApiResponse(200, "User found successfully.", user));
  });


export { registerUser, veryfiEmail, loginUser, forgetPassword, resetPassword, logoutUser, refreshAccessTokenHandler, resendEmailVerification, changeCurrentPassword,getCurrentUser }