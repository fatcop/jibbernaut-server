'strict on';

const Promise = require('bluebird'),
      mongodb = Promise.promisifyAll(require('mongodb')),
      assert = require('assert');

// MongoClient = Promise.promisifyAll(require('mongodb').MongoClient,

class DB {

  constructor(config) {
    this.url = config.db.url;
    this.db = null;
    this.messages = null;
  }

  connect() {
    const self = this;
    const { url } = this;

    // Connect to MongoDB - keep it synchronous as want to fail early if issue.

    mongodb.MongoClient.connect(url, function(err, db) {
      assert.equal(null, err);
      console.log(`Connected to Mongo DB: ${url}`);
      self.db = db;
      self.messages = db.collection('messages')
    });
  }

  insertMessage(text, from, time) {
    const self = this;
    const newMsg = {
      text,
      from,
      time
    };
    return new Promise(function(resolve, reject) {
      // this.messages.insertOne(newMsg, function(err, r) {
      self.messages.insertOneAsync(newMsg)
        .then(function() {
          resolve(newMsg);
        })
        .catch(function(err) {
          // assert.equal(null, err);
          // assert.equal(1, r.insertedCount);
          console.log(err);
          return reject(err);
        });
      });
      // return newMsg;
  }

  getAllMessages() {
    // Returns: Promise of array of messages
    return this.messages.find({}).toArrayAsync();
  }  
}

module.exports = DB;
