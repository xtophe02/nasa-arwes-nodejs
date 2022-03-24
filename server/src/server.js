const http = require("http");
require("dotenv").config();
const { connectDB } = require("./services/mongo");
const { loadPlanetData } = require("./models/planets.model.js");
const { loadLaunchData } = require("./models/launch.model.js");
const app = require("./app.js");

const PORT = process.env.PORT || 8000;
const server = http.createServer(app);

(async function () {
  await connectDB();
  await loadPlanetData();
  await loadLaunchData();
  server.listen(PORT, () => console.log(`server listining on port: ${PORT}`));
})();
