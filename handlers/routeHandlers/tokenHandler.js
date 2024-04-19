// Handler to handle token to related routes

// dependencies
const { hash, parseJSON } = require('../../helpers/utilities');
const data = require('../../lib/data');

const handler = {};
handler.tokenHandler = (requestProperties, callBack) => {
  const acceptedMethods = ['get', 'post', 'put', 'delete']; // allowed methods for the route
  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    // check if the requested method is in the allowed methods
    handler._token[requestProperties.method](requestProperties, callBack); // call the method like _users.get
  } else {
    callBack(405);
  }
};

handler._token = {};

handler._token.get = (requestProperties, callBack) => {};
handler._token.post = (requestProperties, callBack) => {};

handler._token.put = (requestProperties, callBack) => {};
handler._token.delete = (requestProperties, callBack) => {};
module.exports = handler;
