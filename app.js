
// https://github.com/socketio/socket.io 
// https://github.com/davidpadbury/promises-by-example/tree/master/node_modules/socket.io

let server = require('http').createServer();
let io = require('socket.io')(server);
// var Promise = require('promise');

// TODO: For now just keep all messages in an array (eventually DB)
let messages = [];

let storeMessage = (text, from) => {
  let msg = {
    text,
    from,
    time: Date.now()
  };
  messages.push(msg);
  return msg;
}

let sendMessages = (socket, since) => {
  console.log('Sending messages', messages.length);
  for (let i=0, len=messages.length; i < len; i++) {
    let msg = messages[i];
    if (msg.time > since) {
      setImmediate(() => socket.send(msg))
    }
  }
}

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
    let msg = storeMessage(data.text, data.from);
    socket.broadcast.send(msg);
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