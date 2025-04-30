
import { asyncHandler } from "../utils/asysns-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { User } from "../models/user.model.js";
import { Project } from "../models/project.model.js";
import {UserRolesEnum } from "../utils/constants.js";
import { ProjectMember } from "../models/project-member.model.js";
import { Mongoose , ObjectId} from "mongoose";



const getProjects = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const allProjects = await Project.find({ createdBy: userId });
  if (!allProjects) {
    return res.status(404).json(new ApiError(404, "Project not found."))
  }

  return res.status(200).json(new ApiResponse(200, "All project are here.", allProjects));
})

const getProjectById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(402).json(new ApiError(402, "Prjectid is required."));
  }
  const project = await Project.findById(id);
  if (!project) {
    return res.status(404).json(new ApiError(404, "Project not found."))
  }
  
  return res.status(200).json(new ApiResponse(200, "Project is found.", project))
})

const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user._id;

  if (!name ) {
    return res.status(402).json(new ApiError(402, "Project name is required"))
  }
  const isProjectExsit = await Project.findOne({ name });
  if (isProjectExsit) {
    return res.status(403).json(new ApiError(403, "Project is already created."))
  }
  const newProject = await Project.create({
    name,
    description,
    createdBy: userId
  })

  if (!newProject) {
    return res.status(500).json(new ApiError(500, "Project is not created in DB."))
  }

  const projectMember = await ProjectMember.create({
    user: userId,
    project: newProject._id,
    role: UserRolesEnum.PROJECT_ADMIN
  })
  if (!projectMember) {
    return res.status(500).json(new ApiError(500, "Project Member is not created in DB."))
  }

  return res.status(200).json(new ApiResponse(200, "Project is created.", newProject));

});

const updateProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const  userId  = req.user._id;
  if (!name && !description) {
    return res.status(402).json(new ApiError(402, "Noting to update."));
  }

  const isProjectExsit = await Project.findById(id);
  if (!isProjectExsit) {
    return res.status(404).json(new ApiError(404, "Project not found."))
  }
  if(!userId.equals(isProjectExsit.createdBy) ) {
    return res.status(403).json(new ApiError(403, "You are not authorized to update this project."))
  }
  

  const updateProject = await Project.findByIdAndUpdate(
    {
      _id: id
    },
    {
      $set: {
        name,
        description
      }
    },
    {
      new: true // return updated document.
    }
  )

  if (!updateProject) {
    return res.status(502).json(502, "The project data is not updated in the db.");
  }

  return res.status(200).json(new ApiResponse(200, "Update the project successfully", updateProject));
});

const deleteProject = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const userId = req.user._id;
  
  if (!projectId) {
    return next(new ApiError(402, "Project id is required."));
  }
  
  const isProjectExsit = await Project.findById(projectId);
  if (!isProjectExsit) {
    return next(new ApiError(404, "Project not found."));
  }

  if(!userId.equals(isProjectExsit.createdBy) ) {
    return next(new ApiError(403, "You are not authorized to update this project."));
  }
  
  const deleteProject = await Project.findByIdAndDelete(projectId);
  if (!deleteProject) {
    return next(new ApiError(500, "The project is not deleted successfully"));
  }

  return res.status(200).json(new ApiResponse(200, "Project Deleted successfully."))
})

const getProjectMembers = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  if (!projectId) {
    return next(new ApiError(402, "Project is not present."));
  }

  const projectMembers = await ProjectMember.find({ project: projectId });
  if (!projectMembers) {
    return next(new ApiError(404, "Project member is not Found."));
  }

  return res.status(200).json(new ApiResponse(200, "Project members Found", projectMembers));
});

const addMemberToProject = asyncHandler(async (req, res, next) => {
  const memberId = req.body.username;
  const { projectId } = req.params;
  const userId = req.user._id;

  if (!memberId) {
    return next(new ApiError(402, "Member id is required to add member to project."));
  }

  if (!projectId) {
    return next(new ApiError(402, "Project id is required to add member to project."));
  }

  //check if user is admin or project admin
  const user = await User.findById(userId).select("role");
  if (!(user.role !== "admin" || user.role !== "project_admin")) {
    return next(new ApiError(403, "You are not authorized to add member to this project"));
  }

  const isProjectExsit = await Project.findById(projectId);
  if (!isProjectExsit) {
    return next(new ApiError(404, "Project not found."));
  }
  const isMemberExsit = await User.findOne({ $and: [ { username: memberId }, { isEmailVerified: true } ] });
  
  if (!isMemberExsit) {
    return next(new ApiError(402, "User is not found or not verified."));
  }
 
  const isProjectMemberExsit = await ProjectMember.findOne({ $and: [ { user: isMemberExsit._id }, { project: projectId } ] });
  if (isProjectMemberExsit) {
    return next(new ApiError(403, "Member is already added to project."));
  }
  const newProjectMember = await ProjectMember.create(
    {
      user: isMemberExsit._id,
      project: projectId
    }
  )

  if (!newProjectMember) {
    return next(new ApiError(500, "Member is not added to project."));
  }
  return res.status(200).json(new ApiResponse(200, "Member added to project successfully.", newProjectMember));

});

const deleteMember = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { memberId } = req.body;
  const userId = req.user._id;

  if (!projectId) {
    return res.status(402).json(new ApiError(402, "Project is not present."))
  }
  if (!memberId) {
    return res.status(402).json(new ApiError(402, "member id is not prensent."))
  }

  const user = await User.findById(userId).select("role");
  if (user.role !== "admin" || user.role !== "project_admin") {
    return res.status(403).json(new ApiError(
      403,
      "You are not authorized to delete member from this project",
    ))
  }

  const isProjectExsit = await Project.findById(projectId);
  if (!isProjectExsit) {
    return res.status(404).json(new ApiError(404, "Project not found."))
  }

  const deleteProjectMember = await ProjectMember.deleteOne({
    project: projectId,
    user: memberId
  })

  if (!deleteMember) {
    return res.status(500).json(new ApiError(500, "Project "))
  }

  return res.status(200).json(new ApiResponse(200, "Project member is deleted.", deleteProjectMember));
});

const updateMemberRole = asyncHandler(async (req, res) => {
  const { memberId } = req.params;
  const { role } = req.body;

  const userId = req.user._id;
  //check if user is admin or project admin
  const user = await User.findById(userId).select("role");
  if (user.role !== "admin" || user.role !== "project_admin") {
    return res.status(403).json(new ApiError(
      403,
      "You are not authorized to update role of this member",
    ))
  }

  const updatedMember = await ProjectMember.findByIdAndUpdate(
    {
      _id: memberId,
    },
    {
      $set: {
        role,
      },
    },
    { new: true }, // returns the updated document
  );
  if (!updatedMember) {
    return res.status(500).json(new ApiError(500, "Member not found"))
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Member updated", updatedMember));
});

export {
  addMemberToProject,
  createProject,
  deleteMember,
  deleteProject,
  getProjectById,
  getProjectMembers,
  getProjects,
  updateMemberRole,
  updateProject,
};
