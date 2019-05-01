const connectCloudantDB = require('./connectCloudantDB');
const EventEmitter = require('events')
const Logger = require('./Logger')
const uuidv4 = require('uuid/v4');

/**
 * Class for connecting to and performing operations
 * with a cloudant db instance
 */
class DatabaseConnector extends EventEmitter {

  constructor (dbName) {
    super()
    this.dbName = dbName
    this._connect = connectCloudantDB(this.dbName)
    this.genericFunction = this.genericFunction.bind(this)
  }

  /**
   * Convenience method for stringifying
   * json objects.
   * @param  {json} json JSON to be stringified
   * @return {string}      JSON object as string
   */
  _jStr(json) {
    return JSON.stringify(json, null, 2)
  }

  // _connect () {
  //   return connectCloudantDB(this.dbName)
  // }

  /**
   * Insert document into database
   * @param  {json} doc The document to be inserted
   * @return {Promise}    Resolves with data or rejects with error.
   * Also emits data on success and error on failure
   */
  saveDocument (doc) {
    return new Promise((resolve, reject) => {
      this._connect.then(db => {
        db.insert(doc)
          .then(data => {
            Logger.info(`In db[${this.dbName}] created doc: ${this._jStr(data)} `, 'DatabaseConnector#save');
            this.emit('save-success', data)
            resolve(data)
          })
          .catch(err => {
            Logger.error(err, 'DatabaseConnector#save');
            this.emit('save-error', err)
            reject(err)
        })
      })
    })
  }

  /* ------------------------------------------
      Example of how each function could look 
      if not abstracted out to use wrapper
     ------------------------------------------
  getDocByID (id) {
    return new Promise ((resolve, reject) => {
      this._connect.then(db => {
        // Get the document by id
        db.get(id).then(doc => {
          Logger.info(`From db[${this.dbName}] got doc: ${this._jStr(doc)} `);
          this.emit('get-success', doc)
          resolve(doc)
        })
        .catch(err => {
          Logger.error(err);
          this.emit('get-error', err)
          reject(err)
        })
      })
    })
  } 
  */
 
  get (id) {
    return this.connectWrapper(id, this.getDoc)
  }
 
  getDoc (id, db, outer, resolve, reject) {
    db.get(id).then(doc => {
      Logger.info(`From db[${outer.dbName}] got doc: ${JSON.stringify(doc)} `, 'DatabaseConnector#getDoc');
      outer.emit('get-success', doc)
      resolve(doc)
    })
    .catch(err => {
      Logger.error(err, 'DatabaseConnector#getDoc');
      outer.emit('get-error', err)
      reject(err)
    })
  }

  connectWrapper (id, proc) {
    return new Promise ((resolve, reject) => {
      this._connect.then(db => proc(id, db, this, resolve, reject))
      .catch(connectionError => {
        Logger.error(connectionError, 'DatabaseConnector#generic')
      })
    })
  }

  /**
   * Gets all of the documents stored in the database -
   * paginates at 100 records per call; see Cloudant docs
   * for more information.
   * @return {Promise} Promise resolves returning an object
   * containing an array of rows, one row for each document, 
   * or rejects with an error message
   */
  getAllDocuments () {
    return new Promise ((resolve, reject) => {
      this._connect.then(db => {
        db.list({ include_docs: true }).then(body => {
          body.rows.forEach((row, index) => {
            Logger.verbose(`Row ${index}:\n ${JSON.stringify(row, null, 2)}`, 'DatabaseConnector#getAllDocuments');
          })
          this.emit('get-docs-success', body)
          resolve(body)
        })
        .catch(err => {
          Logger.error(err, 'DatabaseConnector#getAllDocuments')
          this.emit('get-docs-error')
          reject(err)
        })
      })
    })
  }

  // get only list of all docs
   
  // update a doc
  
  // query db and return docs
}

const dbCon = new DatabaseConnector('test-database')

dbCon.get('26067263-118e-4a75-8dc0-155c93f4225a')
  .then(data => {
    Logger.info(data)
  })

// Read from Cloudant without query filter and then
// update a record with new information
// connectCloudantDB().then(db => {
//   db.list({ include_docs: true }).then(body => {
//     body.rows.forEach((row, index) => {
//       // If there is no PDF data, don't try to save anything.
//       console.log(`row ${index}:\n ${JSON.stringify(row, null, 2)}`);
//       let thisDoc = row.doc;
//       // This section is a test of pushing updates of entirely new content
//       // onto the record.
//       thisDoc.posts = [{"title": "Test", "content": "Some content"}];
//       comment = {
//         "username": "Fred",
//         "text": "Really interesting stuff" 
//       };
//       thisDoc.posts[0].comments = [];
//       thisDoc.posts[0].comments.push(comment);
//       db.insert(thisDoc)
//         .then(data => {
//           console.log("updated: ", data);
//         })
//         .catch(err => {
//           console.log(err);
//       });
//     });
//   });
// });