import { Router } from "express";
import { registerUser ,veryfiEmail,loginUser,forgetPassword,resetPassword,logoutUser, refreshAccessTokenHandler } from "../controllers/auth.controllers.js";
import {validate} from "../middlewares/validator.middleware.js"
import {userRegistationValidator,userLoginValidator,resetPasswordValidator} from "../validators/index.js"
import { upload } from "../middlewares/multer.middleware.js";
import {isAuth} from "../middlewares/isAuth.Middleware.js"
const router = Router();

router.route("/register").post(upload.single("avatar"),userRegistationValidator(),validate,registerUser);
router.route("/verify/:token").get(veryfiEmail);
router.route("/login").post(userLoginValidator(),validate,loginUser);
router.route("/forget-password").post(forgetPassword);
router.route("/reset-password/:token").post(resetPasswordValidator(),validate,resetPassword);
router.route("/refresh-token").get(refreshAccessTokenHandler);

// Potected Routes 
router.route("/logout").post(isAuth,logoutUser);

export default router