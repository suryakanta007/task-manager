import {ProjectMember} from "../models/project-member.model.js";
import { UserRolesEnum } from "../utils/constants.js";
import { ApiError } from "../utils/api-error.js";
import { User } from "../models/user.model.js";


const taskPermission = async(req,res,next) => {
    try {
        const {projectId} = req.params;
        const userId = req.user._id;

        const user = await ProjectMember.findOne({
            user: userId,
            project: projectId,
            role:UserRolesEnum.ADMIN||UserRolesEnum.PROJECT_ADMIN
        })

        if(!user){
            return next(new ApiError(403,"You are not authorized to perform this action."));
        }

        next();
    } catch (error) {
        return next(new ApiError(401,"authorization failed.",error));
    }
}

const isMember = async(req,res,next)=>{
    try {
        const {projectId} = req.params;
        const userId = req.user._id;
        const user = await ProjectMember.findOne({
            user: userId,
            project: projectId
        })
        if(!user){
            return next(new ApiError(403,"You are not authorized to perform this action."));
        }
        next();
    } catch (error) {
        return next(new ApiError(401,"authorization failed.",error));
    }
}

export {taskPermission,isMember}