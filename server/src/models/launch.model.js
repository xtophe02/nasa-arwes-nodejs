const LaunchModel = require("./launchs.mongo.js");
const PlanetModel = require("./planets.mongo.js");
const axios = require("axios");
// const launchs = new Map();

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";
const DEFAULT_FLIGHT_NUMBER = 100;
// const launch = {
//   flightNumber: 100, //flight_number
//   mission: "Kleper Exploration X", //name
//   rocket: "Explorer IS1", //rocker.name
//   launchDate: new Date("december 27, 2030"), //date_local
//   target: "Kepler-442 b",
//   customers: ["NASA", "CM"], //payload.customers
//   upcoming: true, //upcoming
//   success: true, //success
// };
// let latestFlight = launch.flightNumber;

async function latestFlightNumber() {
  const res = await LaunchModel.findOne().sort("-flightNumber").lean();
  if (!res) {
    return DEFAULT_FLIGHT_NUMBER;
  }
  return res.flightNumber;
}

// launchs.set(launch.flightNumber, launch);
// saveLaunch(launch);

async function addNewLaunch(data) {
  // launchs.set(
  //   ++latestFlight,
  //   Object.assign(data, {
  //     flightNumber: latestFlight,
  //     customer: ["NASA", "ESA"],
  //     upcoming: true,
  //     success: true,
  //   })
  // );

  // return launchs.get(latestFlight);

  const query = await PlanetModel.findOne({ keplerName: data.target }).lean();
  if (query) {
    const lastestFlight = await latestFlightNumber();
    const newLaunch = Object.assign(data, {
      customers: ["NASA", "ESA"],
      flightNumber: lastestFlight + 1,
    });

    return await saveLaunch(newLaunch);
  } else {
    throw new Error("No matching planet!");
  }
}
async function abortLaunch(id) {
  // const aborted = launchs.get(parseInt(id));
  // aborted.upcoming = false;
  // aborted.success = false;
  return await LaunchModel.findOneAndUpdate(
    { flightNumber: parseInt(id) },
    {
      upcoming: false,
      success: false,
    },
    {
      new: true,
    }
  ).lean();
}
async function getLaunch(filter) {
  // return launchs.get(parseInt(id));
  return await LaunchModel.findOne(filter);
}

const getAllLaunchs = async ({ page = 1, limit = 0 }) => {
  // return Array.from(launchs.values());

  const limitABS = Math.abs(limit);
  const skip = (Math.abs(page) - 1) * limitABS;
  return await LaunchModel.find({}, { _id: 0, __v: 0 })
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limitABS)
    .lean();
};

async function saveLaunch(launch) {
  return await LaunchModel.findOneAndUpdate(
    { flightNumber: launch.flightNumber },
    launch,
    {
      upsert: true,
      new: true,
    }
  ).lean();
}
async function populateLaunchsDB() {
  const res = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      // page:2,
      // limit:20,
      pagination: false,
      populate: [
        { path: "rocket", select: { name: 1 } },
        { path: "payloads", select: { customers: 1 } },
      ],
    },
  });
  if (res.status !== 200) {
    console.error("somthing went wrong");
    throw new Error("Launch data download failed");
  }
  for (const launchDoc of res.data.docs) {
    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      launchDate: launchDoc["date_local"],
      // target: "Kepler-442 b",
      customers: launchDoc["payloads"].flatMap(
        (payload) => payload["customers"]
      ),
      upcoming: launchDoc["upcoming"],
      success: launchDoc["success"],
    };
    console.log(`${launch.flightNumber} - ${launch.mission}`);
    await saveLaunch(launch);
  }
}
async function loadLaunchData() {
  console.log("Downloading SPACEX data...");
  const firstLaunch = await getLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });

  if (firstLaunch) {
    console.log("already loaded on DB");
  } else {
    await populateLaunchsDB();
  }
}

module.exports = {
  addNewLaunch,
  abortLaunch,
  loadLaunchData,
  getAllLaunchs,
};
