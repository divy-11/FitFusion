const expess = require("express");
const RouterApp = expess.Router();
const userRoute = require("./user")
const activityRoute = require("./activity")
const goalRoute = require("./goals")
const insightRoute = require("./insights")

RouterApp.use("/users", userRoute)
RouterApp.use("/activities", activityRoute)
RouterApp.use("/goals", goalRoute)
RouterApp.use("/insights", insightRoute)

module.exports = RouterApp