const express = require("express");
const {
  httpGetAllLaunchs,
  httpPostLaunch,
  httpAbortLaunch,
} = require("./launchs.controller.js");

const launchsRouter = express.Router();

launchsRouter.get("/", httpGetAllLaunchs);
launchsRouter.post("/", httpPostLaunch);
launchsRouter.delete("/:launchId", httpAbortLaunch);

module.exports = launchsRouter;
