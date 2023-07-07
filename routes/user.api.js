const express= require("express")
const { CreateUser,getUsers, getAllTasksOfUser } = require("../controllers/user.controllers")
const router = express.Router()

// Read
/**
 * @route GET api/users
 * @description Get a list of users
 * @access private 
 * @allowedQueries: search,page,limit
 */
router.get("/",getUsers)

/**
 * @route GET api/users
 * @description Get all tasks of user by _id
 */
router.get("/alltasksofuser/:userId",getAllTasksOfUser)

//Create
/**
 * @route POST api/users
 * @description Create a new user
 * @access private manager 
 * @requiredBody: name,(role default empolyee)
 */
router.post("/",CreateUser)

/** exports module */
module.exports= router