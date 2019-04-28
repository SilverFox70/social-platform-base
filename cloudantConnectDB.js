if (!process.env.NODE_ENV) require("dotenv").config();
const Cloudant_DB = require("@cloudant/cloudant");

const connectCloudantDB = () => {
  return new Promise((resolve, reject) => {
    Cloudant_DB(
      {
        url: process.env.DB_URL,
        username: process.env.DB_USER,
        password: process.env.DB_PASS
      },
      function(err, cloudant, pong) {
        if (err) {
          return console.log("Failed to initialize Cloudant: ", err.message);
          reject(err);
        } else {
          console.log(`Ping Result: ${JSON.stringify(pong, null, 2)}`);
          const db = cloudant.use(
            `party-post`
          );
          resolve(db);
        }
      }
    );
  });
};

module.exports = connectCloudantDB;
