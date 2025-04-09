import { Router } from "express";
import { registerUser } from "../controllers/auth.controllers.js";
import {validate} from "../middlewares/validator.middleware.js"
import {userRegistationValidator} from "../validators/index.js"
const router = Router();

router.route("/register").post(userRegistationValidator(),validate,registerUser);

export default router