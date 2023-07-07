const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasks,
  getTaskById,
  deleteTask,
  assignTask,
  unAssignTask,
  updateStatusOfTask,
} = require("../controllers/task.controllers");

//Read
/**
 * @route GET api/tasks
 * @description Get a list of Tasks
 * @allowedQueries: status,page,limit
 */
router.get("/", getTasks); 

/**
 * @route GET api/tasks
 * @description Get a task by _id
 * params : _id of task
 */
router.get("/:taskId", getTaskById);

//Create
/**
 * @route POST api/tasks
 * @description Create a new task
 * @requiredBody: name,description, status default "pending", option assignee
 */
router.post("/", createTask);

// Update
/**
 * @route PUT api/tasks
 * @description assign task to user 
 * @requiredBody: userId, taskId
 */
router.put("/assigntask", assignTask);

/**
 * @route PUT api/tasks
 * @description unassign task to user 
 * @requiredBody: taskId
 */
router.put("/unassigntask",unAssignTask);

/**
 * @route PUT api/tasks
 * @description update status task
 * @requiredBody: status 
 */
router.put("/:taskId", updateStatusOfTask);

/**
 * @route DELETE  api/tasks
 * @description delete a task 
 */
router.delete("/:taskId", deleteTask);

// export router
module.exports = router;
