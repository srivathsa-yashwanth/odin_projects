var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const mongoose = require("mongoose");
require("dotenv").config();

var indexRouter = require("./routes/index");
const categoryRouter = require('./routes/category')
const manufacturerRouter = require('./routes/manufacturer')
const cpuRouter = require('./routes/cpu')
const gpuRouter = require('./routes/gpu')

var app = express();

mongoose.set("strictQuery", false);
const mongoDbString = process.env.mongoDbConnectionString;
const mongoConnect = async () => {
  await mongoose.connect(mongoDbString);
};
mongoConnect().catch((e) => console.log(`MongoDb connection error: ${e}`));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/category", categoryRouter);
app.use("/manufacturer", manufacturerRouter);
app.use("/cpu", cpuRouter);
app.use("/gpu", gpuRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
