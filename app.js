'use strict';

// https://github.com/socketio/socket.io 
// https://github.com/davidpadbury/promises-by-example/tree/master/node_modules/socket.io

const config = require('./config'),
      server = require('http').createServer(),
      io = require('socket.io')(server),
      // Promise = require('bluebird'),
      DB = require('./db'),
      assert = require('assert');

// Promise.promisifyAll(require("mongodb"));

const db = new DB(config);
db.connect();

const storeMessage = (text, from) => {
  return db.insertMessage(text, from, Date.now());
}

const sendMessages = (socket, since) => {
  console.log('Sending messages');
  db.getAllMessages()
    .then(msgs => {
      msgs.forEach(msg => {
        if (msg.time > since) {
          setImmediate(() => socket.send(msg))
        }
      });
    })
    .catch(error => {
      console.log(error);
    });
}

// Handle websocket connections

io.on('connection', (socket) => {

  console.log('socket connected');

  socket.on('set nickname', (name) => {
    console.log('Received set nickname');
    socket.set('nickname', name, () => {
      socket.emit('ready');
    })
  });

  socket.on('message', (data) => {
    console.log('Received message', data);
    storeMessage(data.text, data.from)
      .then(msg => socket.broadcast.send(msg))
      .catch(err => socket.send({ error: 'store_failed'}))
  });

  socket.on('past messages', (since) => {
    console.log('Received past messages request', since);
    sendMessages(socket, since);
  });

  socket.on('disconnect', () => {
    io.emit('user disconnected');
  });

});

console.log('Listening on port 3000');
server.listen(3000);