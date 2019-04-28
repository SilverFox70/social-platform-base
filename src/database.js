const connectCloudantDB = require('./connectCloudantDB');
const uuidv4 = require('uuid/v4');

connectCloudantDB().then(db => {
  let doc = {
    _id: uuidv4(),
    first_name: "Adam",
    last_name: "Savage",
    posts: []
  }

  db.insert(doc)
    .then(data => {
        console.log("Created: ", data);
      })
    .catch(err => {
      console.log(err);
  });
});