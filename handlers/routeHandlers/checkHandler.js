// Handler to handle user defined checks

// dependencies
const { hash, parseJSON } = require('../../helpers/utilities');
const data = require('../../lib/data');
const tokenHandler = require('./tokenHandler');

const handler = {};
handler.checkHandler = (requestProperties, callBack) => {
  const acceptedMethods = ['get', 'post', 'put', 'delete']; // allowed methods for the route
  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    // check if the requested method is in the allowed methods
    handler._check[requestProperties.method](requestProperties, callBack); // call the method like _users.get
  } else {
    callBack(405);
  }
};

handler._check = {};

handler._check.get = (requestProperties, callBack) => {};
handler._check.post = (requestProperties, callBack) => {};

handler._check.put = (requestProperties, callBack) => {};
handler._check.delete = (requestProperties, callBack) => {};
module.exports = handler;
