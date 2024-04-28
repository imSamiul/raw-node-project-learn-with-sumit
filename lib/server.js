// Server library works with server related files

// dependencies
// for making a server we need http module

const http = require('http');
const { handleReqRes } = require('../helpers/handleReqRes');
const environment = require('../helpers/environment');
const { sendTwilioSms } = require('../helpers/notifications');

// app object - module scaffolding
const server = {};

sendTwilioSms('01XXXXXXXX', 'Hello world', (err) => {
  console.log(`this is the error`, err);
});

server.createServer = () => {
  const createServerVariable = http.createServer(server.handleReqRes);
  createServerVariable.listen(environment.port, () => {
    console.log(`Listening to port ${environment.port}`);
  });
};

// handle request response
server.handleReqRes = handleReqRes;

// start the server
server.init = () => {
  server.createServer();
};

module.exports = server;
