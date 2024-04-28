// Project initial file

const server = require('./lib/server');

const app = {};

app.init = () => {
  // start the server
  server.init();
};

module.exports = app;
