const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const db_init = () => {
  const dbName = process.env.DB_NAME;
  const dbHost = process.env.DB_HOST; // or the appropriate host if different
  const dbPort = process.env.DB_PORT; // or the appropriate port if different
  const mongoURI = `mongodb://${dbHost}:${dbPort}/${dbName}`;
  return new Promise(async (resolve, reject) => {
    mongoose
      .connect(mongoURI)
      .then(() => {
        console.log(`Connected to MongoDB "${dbName}"...`);
        resolve();
      })
      .catch((err) => {
        console.error("Could not connect to MongoDB...", err);
        reject();
      });
  });
};

module.exports = { db_init };