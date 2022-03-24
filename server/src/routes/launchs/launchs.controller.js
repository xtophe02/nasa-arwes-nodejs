const {
  getAllLaunchs,
  addNewLaunch,
  abortLaunch,
} = require("../../models/launch.model.js");

async function httpGetAllLaunchs(req, res) {
  return res.status(200).json(await getAllLaunchs(req.query));
}
async function httpAbortLaunch(req, res) {
  // console.log(getLaunchByID(req.params.launchId));
  const launch = await abortLaunch(req.params.launchId);
  if (!launch) {
    return res.status(400).json({ error: "launch doesn't exists" });
  }
  return res.status(204).json(launch);
}
async function httpPostLaunch(req, res) {
  const launch = req.body;
  // console.log(launch);
  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.launchDate ||
    !launch.target
  ) {
    return res.status(400).json({ error: "Missing required launch property" });
  }
  launch.launchDate = new Date(launch.launchDate);
  if (isNaN(launch.launchDate)) {
    return res.status(400).json({ error: "Invalid launch date" });
  }
  try {
    const newLaunch = await addNewLaunch(launch);
    // console.log(newLaunch);
    return res.status(201).json(newLaunch);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

module.exports = { httpGetAllLaunchs, httpAbortLaunch, httpPostLaunch };
