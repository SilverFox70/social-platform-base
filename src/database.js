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

// Read from Cloudant without query filter
connectCloudantDB().then(db => {
  db.list({ include_docs: true }).then(body => {
    body.rows.forEach((row, index) => {
      // If there is no PDF data, don't try to save anything.
      console.log(`row ${index}:\n ${JSON.stringify(row, null, 2)}`);
      let thisDoc = row.doc;
      // This section is a test of pushing updates of entirely new content
      // onto the record.
      thisDoc.posts = [{"title": "Test", "content": "Some content"}];
      comment = {
        "username": "Fred",
        "text": "Really interesting stuff" 
      };
      thisDoc.posts[0].comments = [];
      thisDoc.posts[0].comments.push(comment);
      db.insert(thisDoc)
        .then(data => {
          console.log("updated: ", data);
        })
        .catch(err => {
          console.log(err);
      });
    });
  });
});