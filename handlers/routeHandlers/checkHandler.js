// Handler to handle user defined checks

// dependencies
const { hash, parseJSON, randomString } = require('../../helpers/utilities');
const data = require('../../lib/data');
const tokenHandler = require('./tokenHandler');
const { maxChecks } = require('../../helpers/environment');

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

handler._check.post = (requestProperties, callBack) => {
  const protocol =
    typeof requestProperties.body.protocol === 'string' &&
    ['http', 'https'].indexOf(requestProperties.body.protocol) > -1
      ? requestProperties.body.protocol
      : false;
  const url =
    typeof requestProperties.body.url === 'string' &&
    requestProperties.body.url.trim().length > 0
      ? requestProperties.body.url
      : false;

  const method =
    typeof requestProperties.body.method === 'string' &&
    ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1
      ? requestProperties.body.method
      : false;
  const successCodes =
    typeof requestProperties.body.successCodes === 'object' &&
    requestProperties.body.successCodes instanceof Array
      ? requestProperties.body.successCodes
      : false;
  const timeOutSeconds =
    typeof requestProperties.body.timeOutSeconds === 'number' &&
    requestProperties.body.timeOutSeconds % 1 === 0 &&
    requestProperties.body.timeOutSeconds >= 1 &&
    requestProperties.body.timeOutSeconds <= 5
      ? requestProperties.body.timeOutSeconds
      : false;
  if (protocol && url && method && successCodes && timeOutSeconds) {
    const token =
      typeof requestProperties.headersObject.token === 'string'
        ? requestProperties.headersObject.token
        : false;
    // check if the user is authenticated and lookup the user phone by reading the token
    data.read('tokens', token, (error, tokenData) => {
      if (!error && tokenData) {
        const userPhone = parseJSON(tokenData).phone;
        // lookup the user data
        data.read('users', userPhone, (error2, userData) => {
          if (!error2 && userData) {
            tokenHandler._token.verify(token, userPhone, (tokenIsValid) => {
              if (tokenIsValid) {
                const userObj = parseJSON(userData);
                const userChecks =
                  typeof userObj.checks === 'object' &&
                  userObj.checks instanceof Array
                    ? userObj.checks
                    : [];
                if (userChecks.length < maxChecks) {
                  const checkId = randomString(20);
                  const checkObject = {
                    id: checkId,
                    userPhone,
                    protocol,
                    url,
                    method,
                    successCodes,
                    timeOutSeconds,
                  };
                  // save the object
                  data.create('checks', checkId, checkObject, (error3) => {
                    if (!error3) {
                      userObj.checks = userChecks;
                      userObj.checks.push(checkId);
                      // save the new user data
                      data.update('users', userPhone, userObj, (error4) => {
                        if (!error4) {
                          callBack(200, checkObject);
                        } else {
                          callBack(500, {
                            error: 'There was a problem in the server side!',
                          });
                        }
                      });
                    } else {
                      callBack(500, {
                        error: 'There is a problem in the server side!',
                      });
                    }
                  });
                } else {
                  callBack(401, {
                    error: 'User has already reached max check limit!',
                  });
                }
              } else {
                callBack(403, { error: 'Authentication timeout!' });
              }
            });
          } else {
            callBack(403, { error: 'user not found' });
          }
        });
      } else {
        callBack(403, { error: 'Authentication Problem!' });
      }
    });
  } else {
    callBack(400, { error: 'You have a problem in your request.' });
  }
};
handler._check.get = (requestProperties, callBack) => {};

handler._check.put = (requestProperties, callBack) => {};
handler._check.delete = (requestProperties, callBack) => {};
module.exports = handler;
