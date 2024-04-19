// Handler to handle token to related routes

// dependencies
const { hash, parseJSON, randomString } = require('../../helpers/utilities');
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

handler._token.get = (requestProperties, callBack) => {
  const phone =
    typeof requestProperties.body.phone === 'string' &&
    requestProperties.body.phone.trim().length === 11
      ? requestProperties.body.phone
      : false;
  const password =
    typeof requestProperties.body.password === 'string' &&
    requestProperties.body.password.trim().length > 0
      ? requestProperties.body.password
      : false;
  if (phone && password) {
    const hashPassword = hash(password);
    data.read('users', phone, (error, userInfo) => {
      if (!error && userInfo) {
        const userInfoObj = { ...parseJSON(userInfo) };

        if (hashPassword === userInfoObj.password) {
          const tokenId = randomString(20);
          const expires = Date.now() + 60 * 60 * 1000;
          const tokenObj = {
            phone,
            id: tokenId,
            expires,
          };
        } else {
          callBack(400, {
            error: 'Password not matched',
          });
        }
      } else {
        callBack(400, {
          error: 'You have an error in your request or userInfo not found.',
        });
      }
    });
  } else {
    callBack(400, {
      error: 'You have an error in your request',
    });
  }
};
handler._token.post = (requestProperties, callBack) => {};

handler._token.put = (requestProperties, callBack) => {};
handler._token.delete = (requestProperties, callBack) => {};
module.exports = handler;
