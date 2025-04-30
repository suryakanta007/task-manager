// get all tasks
import { asyncHandler } from "../utils/asysns-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { User } from "../models/user.model.js";
import { Project } from "../models/project.model.js";
import { UserRolesEnum } from "../utils/constants.js";
import { ProjectMember } from "../models/project-member.model.js";
import { Task } from "../models/task.model.js";
import {uplordFileToCloudinary} from "../utils/cloudinary.js";
const getTasks = asyncHandler(async (req, res, next) => {

  const { projectId } = req.params;
  const userId = req.user._id;

  const allTasks = await Task.find({
    assignedTo: userId,
    project: projectId
  })
  if (!allTasks) {
    return next(new ApiError(404, "No task found."));
  }
  return res.status(200).json(new ApiResponse(200, "Tasks fetched successfully", allTasks));

});

// get task by id
const getTaskById = asyncHandler(async (req, res,next) => {
  const { taskId, projectId } = req.params;
  const userId = req.user._id;

  const task = await Task.findOne({
    project: projectId,
    _id: taskId,
  })

  if (!task) {
    return next(new ApiError(404, "No task is Found in your project."))
  }

  return res.status(200).json(new ApiResponse(200, "Task fetched successfully", task));

})

// create task
const createTask = asyncHandler(async (req, res,next) => {
  const { projectId } = req.params;
  const userId = req.user._id;
  const { title, description,assignedTo = userId } = req.body;

  const isTitleExist = await Task.findOne({
    project: projectId,
    title
  })
  if (isTitleExist) {
    return next(new ApiError(404, "Task is already exist with same title."));
  }
  const isAssignedMember = await ProjectMember.findOne({
    user: assignedTo,
    project: projectId
  })

  if(!isAssignedMember){
    return next(new ApiError(404,"Assigned member not found in this project Member."))
  }

  const newTask = await Task.create({
    title,
    description,
    project: projectId,
    assignedTo,
    assignedBy: userId
  })

  if(!newTask){
    return next(new ApiError(500,"Task is not created successfully."));
  }
  const attachments = req?.files?.map((file) => file);
  let attachmentsUrl = [];
  if(attachments?.length > 0){
     attachmentsUrl = await Promise.all(attachments.map((file) => uplordFileToCloudinary(file)));
  }
  newTask.attachments = attachmentsUrl.filter(Boolean);
  await newTask.save();
  return res.status(200).json(new ApiResponse(200, "Task created successfully", newTask));

})

// update task
const updateTask = asyncHandler(async (req, res,next) => {
    const { taskId, projectId } = req.params;
    const userId = req.user._id;
    const { title, description,assignedTo = userId } = req.body;

    const isTaskExsist = await Task.findOne({
      project: projectId,
      _id: taskId,
    })
  
    if (!isTaskExsist) {
      return next(new ApiError(404, "No task is Found in your project."))
    }

    const isTitleExist = await Task.findOne({
      project: projectId,
      title
    })
    if (isTitleExist) {
      return next(new ApiError(404, "Task is already exist with same title."));
    }
    const isAssignedMember = await ProjectMember.findOne({
      user: assignedTo,
      project: projectId
    })
  
    if(!isAssignedMember){
      return next(new ApiError(404,"Assigned member not found in this project Member."))
    }

    isTaskExsist.title = title;
    isTaskExsist.description = description;
    isTaskExsist.assignedTo = assignedTo;

    const attachments = req?.files?.map((file) => file);
    let attachmentsUrl = [];
    if(attachments?.length > 0){
       attachmentsUrl = await Promise.all(attachments.map((file) => uplordFileToCloudinary(file)));
    }
    isTaskExsist.attachments = attachmentsUrl.filter(Boolean);
    await isTaskExsist.save();
    return res.status(200).json(new ApiResponse(200, "Task updated successfully", isTaskExsist));


})

// delete task
const deleteTask =asyncHandler( async (req, res,next) => {
  const {taskId,projectId} = req.params;
  const deletedTask = await Task.findOneAndDelete({
    _id: taskId,
    project: projectId
  })
  if(!deletedTask){
    return next(new ApiError(500,"Task is not deleted successfully."));
  }
  return res.status(200).json(new ApiResponse(200, "Task deleted successfully", deletedTask));
});

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
