import {Router} from "express"
import {getTasks} from "../controllers/task.controllers.js";
import {isAuth} from "../middlewares/isAuth.Middleware.js"
import {taskPermission,isMember} from "../middlewares/prmission.middleware.js"


const router = Router({ mergeParams: true });

router.route("/").get(isAuth,isMember,getTasks)
export default router