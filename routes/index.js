const expess = require("express");
const RouterApp = expess.Router();
const userRoute = require("./user")
const activityRoute = require("./activity")
const goalRoute = require("./goals")

RouterApp.use("/users", userRoute)
RouterApp.use("/activities", activityRoute)
RouterApp.use("/goals", goalRoute)

module.exports = RouterApp