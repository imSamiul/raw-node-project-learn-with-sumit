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
handler._check.get = (requestProperties, callBack) => {
  const id =
    typeof requestProperties.queryStringObject.id === 'string' &&
    requestProperties.queryStringObject.id.trim().length === 21
      ? requestProperties.queryStringObject.id
      : false;

  if (id) {
    data.read('checks', id, (error, checkData) => {
      if (!error && checkData) {
        const token =
          typeof requestProperties.headersObject.token === 'string'
            ? requestProperties.headersObject.token
            : false;
        tokenHandler._token.verify(
          token,
          parseJSON(checkData).userPhone,
          (tokenIsValid) => {
            if (tokenIsValid) {
              callBack(200, parseJSON(checkData));
            } else {
              callBack(403, { error: 'Authentication failure' });
            }
          },
        );
      } else {
        callBack(500, { error: " ID doesn't exist!" });
      }
    });
  } else {
    callBack(400, { error: 'You have a problem in your request.' });
  }
};

handler._check.put = (requestProperties, callBack) => {
  const id =
    typeof requestProperties.body.id === 'string' &&
    requestProperties.body.id.trim().length === 21
      ? requestProperties.body.id
      : false;
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
  if (id) {
    if (id || protocol || url || method || successCodes || timeOutSeconds) {
      data.read('checks', id, (error, checkData) => {
        if (!error && checkData) {
          const checkObj = parseJSON(checkData);
          const token =
            typeof requestProperties.headersObject.token === 'string'
              ? requestProperties.headersObject.token
              : false;
          tokenHandler._token.verify(
            token,
            checkObj.userPhone,
            (tokenIsValid) => {
              if (tokenIsValid) {
                if (protocol) {
                  checkObj.protocol = protocol;
                }
                if (protocol) {
                  checkObj.url = url;
                }
                if (protocol) {
                  checkObj.method = method;
                }
                if (protocol) {
                  checkObj.successCodes = successCodes;
                }
                if (protocol) {
                  checkObj.timeOutSeconds = timeOutSeconds;
                }
                data.update('checks', id, checkObj, (error2) => {
                  if (!error2) {
                    callBack(200);
                  } else {
                    callBack(500, { error: 'There was a server side error!' });
                  }
                });
              } else {
                callBack(403, {
                  error: 'Authentication error! Token is not valid.',
                });
              }
            },
          );
        } else {
          callBack(500, { error: 'There was a problem in the server side!' });
        }
      });
    } else {
      callBack(400, {
        error: 'You mus provide at least one field to update!',
      });
    }
  } else {
    callBack(400, { error: 'You have a problem in your request!' });
  }
};
handler._check.delete = (requestProperties, callBack) => {
  const id =
    typeof requestProperties.queryStringObject.id === 'string' &&
    requestProperties.queryStringObject.id.trim().length === 21
      ? requestProperties.queryStringObject.id
      : false;
  if (id) {
    data.read('checks', id, (error, checkData) => {
      if (!error && checkData) {
        const checkObj = parseJSON(checkData);
        const token =
          typeof requestProperties.headersObject.token === 'string'
            ? requestProperties.headersObject.token
            : false;
        tokenHandler._token.verify(
          token,
          checkObj.userPhone,
          (isTokenValid) => {
            if (isTokenValid) {
              data.delete('checks', id, (error2) => {
                if (!error2) {
                  data.read('users', checkObj.userPhone, (error3, userData) => {
                    if (!error3 && userData) {
                      const userObj = parseJSON(userData);
                      const userChecks =
                        typeof userObj.checks === 'object' &&
                        userObj.checks instanceof Array
                          ? userObj.checks
                          : [];
                      const indexOfCheck = userObj.checks.indexOf(id);
                      if (indexOfCheck > -1) {
                        userObj.checks.splice(indexOfCheck, 1);
                        userObj.checks = userChecks;
                        data.update(
                          'users',
                          userObj.phone,
                          userObj,
                          (error4) => {
                            if (!error4) {
                              callBack(200);
                            } else {
                              callBack(500, {
                                error: 'Error while updating the user data.',
                              });
                            }
                          },
                        );
                      } else {
                        callBack(400, {
                          error: 'Item not found in user data object',
                        });
                      }
                    } else {
                      callBack(500, { error: 'Error while fetching userData' });
                    }
                  });
                } else {
                  callBack(500, { error: 'Error deleting check data' });
                }
              });
            } else {
              callBack(403, { error: 'Authentication Failure' });
            }
          },
        );
      } else {
        callBack(500, { error: 'Id not found' });
      }
    });
  } else {
    callBack(400, { error: 'You have a problem in your request' });
  }
};
module.exports = handler;
