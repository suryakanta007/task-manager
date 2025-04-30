import {Router} from "express"
import {getTasks,getTaskById,createTask,updateTask, deleteTask} from "../controllers/task.controllers.js";
import {isAuth} from "../middlewares/isAuth.Middleware.js"
import {taskPermission,isMember} from "../middlewares/prmission.middleware.js"
import {upload}from "../middlewares/multer.middleware.js";
import {createTaskValidator,updateTaskValidator} from "../validators/index.js"
import {validate} from "../middlewares/validator.middleware.js";

const router = Router({ mergeParams: true });

router.route("/").get(isAuth,isMember,getTasks);
router.route("/:taskId").get(isAuth,isMember,getTaskById);
router.route("/").post(isAuth,taskPermission,upload.array("attachments",5),createTaskValidator(),validate,createTask);
router.route("/:taskId").put(isAuth,taskPermission,upload.array("attachments",5),updateTaskValidator(),validate,updateTask);
router.route("/:taskId").delete(isAuth,taskPermission,deleteTask);


export default router