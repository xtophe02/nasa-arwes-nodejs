const express = require("express");
const launchsRouter = require("./launchs/launchs.router");
const planetsRouter = require("./planets/planets.router");

const api = express.Router();

//ROUTERS
api.use("/planets", planetsRouter);
api.use("/launchs", launchsRouter);

module.exports = api;
