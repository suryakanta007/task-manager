import { Router} from "express";
import {createProject,getProjects,deleteProject,getProjectById,updateProject,addMemberToProject, getProjectMembers,deleteMember,updateMemberRole} from "../controllers/project.controllers.js"
import {isAuth} from "../middlewares/isAuth.Middleware.js"

const router = Router();

router.route("/create-project").post(isAuth,createProject);
router.route("/get-project").get(isAuth,getProjects);
router.route("/delete/:projectId").get(isAuth,deleteProject);
router.route("/get-project/:id").get(isAuth,getProjectById);
router.route("/update-Project/:id").post(isAuth,updateProject);
router.route("/add-member/:projectId").post(isAuth,addMemberToProject)
router.route("/get-members/:projectId").get(isAuth,getProjectMembers);
router.route("/delete-member/:projectId").post(isAuth,deleteMember);
router.route("/update-member-role/:memberId").post(isAuth,updateMemberRole);

export default router