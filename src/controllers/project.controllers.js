
import { asyncHandler } from "../utils/asysns-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { User } from "../models/user.model.js";
import { Project } from "../models/project.model.js";



const getProjects = async (req, res) => {
      const userId = req.user._id;

      const allProjects = await Project.find({createdBy:userId});
      if(!allProjects){
        return res.status(404).json(new ApiError(404,"Project not found."))
      }

      return res.status(200).json(new ApiResponse(200,"All project are here.",allProjects));
  };
  
  const getProjectById = async (req, res) => {
    // get project by id
  };
  
  const createProject = asyncHandler(async (req, res) => {
    const {name,description} = req.body;
    const userId = req.user._id;

    if(!name||!description){
      return res.status(402).json(new ApiError(402,"All project fildes are required."))
    }
    if(!userId){
      return res.status(401).json(new ApiError(401,"user id is not present."))
    }

    const isProjectExsit = await Project.findOne({name});
    if(isProjectExsit){
      return res.status(403).json(new ApiError(403,"Project is already created."))
    }
    const newProject = await Project.create({
      name,
      description,
      createdBy : userId
    })

    if(!newProject){
      return res.status(500).json(new ApiError(500,"Project is not created in DB."))
    }

    return res.status(200).json(new ApiResponse(200,"Project is created.",newProject));

});
  
  const updateProject = async (req, res) => {
    // update project
  };
  
  const deleteProject = asyncHandler(async (req, res) => {

      // const {projectId} =  

    
  })
  
  const getProjectMembers = async (req, res) => {
    // get project members
  };
  
  const addMemberToProject = async (req, res) => {
    // add member to project
  };
  
  const deleteMember = async (req, res) => {
    // delete member from project
  };
  
  const updateMemberRole = async (req, res) => {
    // update member role
  };
  
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
  