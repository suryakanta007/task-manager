import { Router} from "express";
import {createProject,getProjects,deleteProject} from "../controllers/project.controllers.js"
import {isAuth} from "../middlewares/isAuth.Middleware.js"

const router = Router();

router.route("/create-project").post(isAuth,createProject);
router.route("/get-project").get(isAuth,getProjects);
router.route("/delete").get(isAuth,deleteProject);

export default router