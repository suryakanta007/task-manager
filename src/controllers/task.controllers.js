// get all tasks
import { asyncHandler } from "../utils/asysns-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { User } from "../models/user.model.js";
import { Project } from "../models/project.model.js";
import {UserRolesEnum } from "../utils/constants.js";
import { ProjectMember } from "../models/project-member.model.js";
import {Task} from "../models/task.model.js";
const getTasks = asyncHandler(async (req, res,next) => {

  const {projectId} = req.params;
  const userId = req.user._id;

  const allTasks = await Task.find({
    assignedTo: userId,
    project:projectId
  })
  if(!allTasks){
    return next(new ApiError(404,"No task found."));
  }
  return res.status(200).json(new ApiResponse(200,"Tasks fetched successfully",allTasks));

}); 
  
  // get task by id
  const getTaskById = async (req, res) => {
    
  };
  
  // create task
  const createTask = async (req, res) => {
    // create task
  };
  
  // update task
  const updateTask = async (req, res) => {
    // update task
  };
  
  // delete task
  const deleteTask = async (req, res) => {
    // delete task
  };
  
  // create subtask
  const createSubTask = async (req, res) => {
    // create subtask
  };
  
  // update subtask
  const updateSubTask = async (req, res) => {
    // update subtask
  };
  
  // delete subtask
  const deleteSubTask = async (req, res) => {
    // delete subtask
  };
  
  export {
    createSubTask,
    createTask,
    deleteSubTask,
    deleteTask,
    getTaskById,
    getTasks,
    updateSubTask,
    updateTask,
  };
  