const { sendResponse, AppError, isValidObjectId } = require("../helpers/utils");
const Tasks = require("../models/task");
const Users = require("../models/user");

const userController = {};

//Create a user
userController.CreateUser = async (req, res, next) => {
  const { name, role } = req.body;

  try {
    if (!name) {
      throw new AppError(400, "Missing required data", "Bad Request");
    }
    const checkExistenceName = await Users.findOne({ name: name });

    if (checkExistenceName?.name === name) {
      throw new AppError(400, "Name Existence", "Bad Request");
    }
    const user = await Users.create({ name, role });
    sendResponse(res, 200, true, { user }, null, "create user success");
  } catch (error) {
    next(error);
  }
};
//Get all user
userController.getUsers = async (req, res, next) => {
  //input validation
  const allowedFilter = ["page", "limit", "search"];

  try {
    let { page, limit, search, ...filterQuery } = req.query;
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
    if (search) {
      const user = await Users.findOne({ name: `${search}` });
      sendResponse(res, 200, true, { user }, null, "get user by name success");
    } else {
      const users = await Users.find()
        .sort({ createdAt: 1 })
        .skip((page - 1) * limit)
        .limit(limit);
      sendResponse(
        res,
        200,
        true,
        { users },
        null,
        "get list users successfully"
      );
    }
  } catch (error) {
    next(error);
  }
};
// Get all tasks of 1 user (Decide which one is better: by name or by id?)
userController.getAllTasksOfUser = async (req, res, next) => {
  const { userId } = req.params;

  try {
    if (!isValidObjectId(userId )) {
      throw new AppError(400, "_id is require objectId", "Bad Request");
    }
    const allTasksOfUser = await Tasks.find({ assignee: `${userId}` })
    sendResponse(
      res,
      200,
      true,
      { allTasksOfUser },
      null,
      "get all Tasks of User successfully "
    );
  } catch (error) {
    next(error);
  }
};

module.exports = userController;
