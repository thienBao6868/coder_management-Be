// import
require("dotenv").config();
let cors = require("cors");
let mongoose = require("mongoose");
let { sendResponse, AppError } = require("./helpers/utils");
// generator
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
const { error } = require("console");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
// connect mongoDB
const mongoURL = process.env.MONGODB_URL;
mongoose
  .connect(mongoURL)
  .then(() => console.log(`connected ${mongoURL}`))
  .catch((error) => console.log(error));

app.use("/", indexRouter);
// handle error Not match router
app.use((req, res, next) => {
  const error = new AppError("404", "Not found", "Bad require");
  next(error);
});

/* Initialize Error Handling */
app.use((err, req, res, next) => {
    console.log("ERROR", err);
      return sendResponse(
        res,
        err.statusCode ? err.statusCode : 500,
        false,
        null,
        { message: err.message },
        err.isOperational ? err.errorType : "Internal Server Error"
      );
  });   

module.exports = app;
