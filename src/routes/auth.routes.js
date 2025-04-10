import { Router } from "express";
import { registerUser ,veryfiEmail } from "../controllers/auth.controllers.js";
import {validate} from "../middlewares/validator.middleware.js"
import {userRegistationValidator} from "../validators/index.js"
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();

router.route("/register").post(upload.single("avatar"),userRegistationValidator(),validate,registerUser);
router.route("/verify/:token").get(veryfiEmail);

export default router