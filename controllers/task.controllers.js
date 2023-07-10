const { sendResponse, AppError, isValidObjectId } = require("../helpers/utils");
const Tasks = require("../models/task");
const Users = require("../models/user");
const { ObjectId } = require("mongodb");

const taskController = {};
// Create new task
taskController.createTask = async (req, res, next) => {
  const { name, description, status, assignee } = req.body;
  try {
    // input validate
    if (!name || !description) {
      throw new AppError(400, "Missing required data", "Bad Request");
    }
    const checkExistenceNameTask = await Tasks.findOne({ name: name });
    const checkExistenceDescriptionTask = await Tasks.findOne({
      description: description,
    });
    if (
      checkExistenceNameTask?.name === name ||
      checkExistenceDescriptionTask?.description === description
    ) {
      throw new AppError(
        400,
        "Name or Description Task Existence",
        "Bad Request"
      );
    }
    const task = await Tasks.create({ name, description, status, assignee });
    sendResponse(res, 200, true, { task }, null, "create task successfully");
  } catch (error) {
    next(error);
  }
};

// Get list tasks
taskController.getTasks = async (req, res, next) => {
  const allowedFilter = ["page", "limit", "status"];
  try {
    let { page, limit, status, ...filterQuery } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 5;
    //allow limit, page and search query string only
    const filterKeys = Object.keys(filterQuery);

    filterKeys.forEach((key) => {
      if (!allowedFilter.includes(key)) {
        throw new AppError(400, "Don't allow filter Query", "Bad Request");
      }
      if (!filterQuery[key]) delete filterQuery[key];
    });
    if (status) {
      let tasks = await Tasks.find({ status: `${status}` }).sort({
        updatedAt: -1,
      });
      tasks = tasks.filter((task) => task.isDeleted === false);
      sendResponse(
        res,
        200,
        true,
        { tasks },
        null,
        "get list tasks by status successfully"
      );
    } else {
      const tasks = await Tasks.find({ isDeleted: false })
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      sendResponse(
        res,
        200,
        true,
        { tasks },
        null,
        "get list tasks successfully"
      );
    }
  } catch (error) {
    next(error);
  }
};

// get task by _id
taskController.getTaskById = async (req, res, next) => {
  const { taskId } = req.params;

  try {
    if (!isValidObjectId(taskId)) {
      throw new AppError(400, "_id is require objectId", "Bad Request");
    }
    // Get task by _id
    const task = await Tasks.find({ _id: `${taskId}` }).populate("assignee");
    if (task.length === 0) {
      throw new AppError(404, "Not Found Task", "Bad Request");
    }
    if (task[0].isDeleted === true) {
      throw new AppError(404, "Not Found Task", "Bad Request");
    }
    sendResponse(res, 200, true, { task }, null, "get task by Id successfully");
  } catch (error) {
    next(error);
  }
};

//Assign a task to user
taskController.assignTask = async (req, res, next) => {
  let { userId, taskId } = req.body;
  try {
    // validate taskId and userId
    if (!isValidObjectId(taskId) || !isValidObjectId(userId)) {
      throw new AppError(400, "_id is require objectId", "Bad Request");
    }
    // check existence task
    const task = await Tasks.find({ _id: `${taskId}` });
    if (task.length === 0) {
      throw new AppError(404, "Not Found Task", "Bad Request");
    }
    if (task[0].isDeleted === true) {
      throw new AppError(404, "Not Found Task", "Bad Request");
    }
    // check task have been assignee
    if (task.assignee) {
      throw new AppError(400, "Task have been assignee", "Bad Request");
    }
    // check user existence
    const user = Users.find({ _id: userId });
    if (user.length === 0) {
      throw new AppError(400, "User not Existence", "Bad request");
    }
    // assign Task
    const assignTaskOfTasksCollection = await Tasks.findByIdAndUpdate(
      taskId,
      { assignee: userId },
      { new: true }
    );
    const assignTaskOfUsersCollection = await Users.findByIdAndUpdate(
      userId,
      { $push: { tasks: taskId } },
      { new: true }
    );

    sendResponse(
      res,
      200,
      true,
      { assignTaskOfTasksCollection, assignTaskOfUsersCollection },
      null,
      "Assign a task to a user successfully"
    );
  } catch (error) {
    next(error);
  }
};

//Unassign a task to user
taskController.unAssignTask = async (req, res, next) => {
  let { taskId, userId } = req.body;
  try {
    if (!isValidObjectId(taskId)) {
      throw new AppError(400, "_id is require objectId", "Bad Request");
    }
    // check existence task
    const task = await Tasks.find({ _id: `${taskId}` });
    if (task.length === 0) {
      throw new AppError(404, "Not Found Task", "Bad Request");
    }
    if (task[0].isDeleted === true) {
      throw new AppError(404, "Not Found Task", "Bad Request");
    }
    // check task don't have assignee
    if (!task.assignee) {
      throw new AppError(400, "Task don't have assignee", "Bad Request");
    }
    // check user existence
    const user = await Users.find({ _id: userId });

    let alltask = user[0].tasks;
    alltask = alltask.map((taskid) => taskid.toString());
    alltask = alltask.filter((taskid) => taskid !== taskId);

    if (user.length === 0) {
      throw new AppError(400, "User not Existence", "Bad request");
    }
    // unsign Task of TasksCollection
    const unAssignTaskOfTasksCollection = await Tasks.findByIdAndUpdate(
      taskId,
      { $unset: { assignee: 1 } },
      { new: true }
    );
    // unsign Task of Users Collection

    const unAssignTaskOfUsersCollection = await Users.findByIdAndUpdate(
      userId,
      { tasks: alltask },
      { new: true }
    );
    sendResponse(
      res,
      200,
      true,
      { unAssignTaskOfTasksCollection, unAssignTaskOfUsersCollection },
      null,
      "UnAssign a task to a user successfully"
    );
  } catch (error) {
    next(error);
  }
};

// update status of a task
taskController.updateStatusOfTask = async (req, res, next) => {
  const taskId = req.params.taskId;
  const { status } = req.body;
  const allowedStatus = ["pending", "working", "review", "done", "archive"];
  try {
    // validate _id
    if (!isValidObjectId(taskId)) {
      throw new AppError(400, "_id is require objectId", "Bad Request");
    }
    // check existence task
    const taskEx = await Tasks.find({ _id: `${taskId}` });
    if (taskEx.length === 0) {
      throw new AppError(404, "Not Found Task", "Bad Request");
    }
    if (taskEx[0].isDeleted === true) {
      throw new AppError(404, "Not Found Task", "Bad Request");
    }
    // validate status
    allowedStatus.forEach((key) => {
      if (!allowedStatus.includes(status)) {
        throw new AppError(400, "Don't allow status", "Bad Request");
      }
    });
    //update status
    let task = await Tasks.findById(taskId);
    if (task.status === "done") {
      if (status !== "archive") {
        throw new AppError(404, "Task accept only archive status");
      } else {
        const updateStatus = await Tasks.findByIdAndUpdate(
          taskId,
          { status: status },
          { new: true }
        );
      }
    }
    const updateStatus = await Tasks.findByIdAndUpdate(
      taskId,
      { status: status },
      { new: true }
    );
    sendResponse(
      res,
      200,
      true,
      { updateStatus },
      null,
      "updated Status successfully"
    );
  } catch (error) {
    next(error);
  }
};

// Soft delete a task (update isdeleted: true)
taskController.deleteTask = async (req, res, next) => {
  const taskId = req.params.taskId;
  try {
    isValidObjectId(taskId);
    if (!isValidObjectId(taskId)) {
      throw new AppError(400, "_id is require objectId", "Bad Request");
    }
    // check existence task
    const task = await Tasks.find({ _id: `${taskId}` });
    if (task.length === 0) {
      throw new AppError(404, "Not Found Task", "Bad Request");
    }
    if (task[0].isDeleted === true) {
      throw new AppError(404, "Task have been deleted", "Bad Request");
    }
    //
    let taskIsDeleted = await Tasks.findOneAndUpdate(
      { _id: taskId },
      { isDeleted: true },
      { new: true }
    );
    sendResponse(
      res,
      200,
      true,
      taskIsDeleted,
      null,
      "deleted task successfully"
    );
  } catch (error) {
    next(error);
  }
};
module.exports = taskController;
