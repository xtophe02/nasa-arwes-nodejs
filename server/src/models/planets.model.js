const { parse } = require("csv-parse");
const fs = require("fs");
const path = require("path");
const PlanetModel = require("./planets.mongo");

function isHabitablePlanet(planet) {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
}

function loadPlanetData() {
  return new Promise((resolve, reject) => {
    // fs.createReadStream return event 'end' or 'data' etc
    fs.createReadStream(path.join(__dirname, "../../data", "kepler_data.csv"))
      //pipe is meant to connect readable stream to a writable stream
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", async (data) => {
        if (isHabitablePlanet(data)) {
          // planets.push(data);
          try {
            await PlanetModel.updateOne(
              {
                keplerName: data.kepler_name,
              },
              { keplerName: data.kepler_name },
              { upsert: true }
            );
          } catch (error) {
            console.error(error);
          }
        }
      })
      .on("error", (err) => {
        console.log("ERROR:", err);
        reject(err);
      })
      .on("end", async () => {
        const planetsCount = (await getAllPlanets()).length;
        console.log(`${planetsCount} habitable planets found!`);
        // console.log("we are done");
        resolve();
      });
  });
}

const getAllPlanets = async () => {
  return await PlanetModel.find({}, { _id: 0, __v: 0 }).lean();
};

module.exports = { loadPlanetData, getAllPlanets };
