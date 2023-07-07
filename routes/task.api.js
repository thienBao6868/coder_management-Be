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
 * @access private
 * @allowedQueries: status,page,limit
 */

router.get("/", getTasks); 
/**
 * @route GET api/tasks
 * @description Get a task by _id
 * @access private
 * params : _id of task
 */
router.get("/:taskId", getTaskById);

//Create
/**
 * @route POST api/tasks
 * @description Create a new task
 * @access private, manager
 * @requiredBody: name,description, status default "pending", option assignee
 */
router.post("/", createTask);

//Assignee task to User
router.put("/assigntask", assignTask);
//Assignee task to User
router.put("/unassigntask",unAssignTask);
// updtae status
router.put("/:taskId", updateStatusOfTask);
//Delete
router.delete("/:taskId", deleteTask);
module.exports = router;
