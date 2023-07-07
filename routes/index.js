var express = require("express");
const { AppError, sendResponse } = require("../helpers/utils");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.status(200).send("hello coder_manager");
});

/** Use userRouter*/
const userRouter = require("./user.api")
router.use("/users",userRouter)

/** Use taskRouter */
const taskRouter = require("./task.api")
router.use("/tasks",taskRouter)

/** export router */
module.exports = router;
