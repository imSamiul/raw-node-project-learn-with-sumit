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

handler._token.post = (requestProperties, callBack) => {
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
          data.create('tokens', tokenId, tokenObj, (error2) => {
            if (!error2) {
              callBack(200, {
                message: 'Token for this user is created successfully.',
              });
            } else {
              callBack(400, {
                message:
                  'There is an error while creating a token for this user!',
              });
            }
          });
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
handler._token.get = (requestProperties, callBack) => {
  // check the token if valid
  const token =
    typeof requestProperties.queryStringObject.token === 'string' &&
    requestProperties.queryStringObject.token.trim().length === 21
      ? requestProperties.queryStringObject.token
      : false;
  if (token) {
    // lookup the user token
    data.read('tokens', token, (error, tokenData) => {
      if (!error && tokenData) {
        const tokenObj = { ...parseJSON(tokenData) };

        callBack(200, tokenObj);
      } else {
        callBack(404, {
          error: 'Requested token was not found!',
        });
      }
    });
  } else {
    callBack(404, {
      error: 'Requested token was not found!',
    });
  }
};

handler._token.put = (requestProperties, callBack) => {
  const id =
    typeof requestProperties.body.id === 'string' &&
    requestProperties.body.id.trim().length === 21
      ? requestProperties.body.id
      : false;

  const extend = !!(
    typeof requestProperties.body.extend === 'boolean' &&
    requestProperties.body.extend === true
  );
  if (id && extend) {
    data.read('tokens', id, (error, tokenData) => {
      const tokenObj = { ...parseJSON(tokenData) };
      if (tokenObj.expires > Date.now()) {
        tokenObj.expires = Date.now() + 60 * 60 * 1000;
        data.update('tokens', id, tokenObj, (error2) => {
          if (!error2) {
            callBack(200, { message: 'Token Updated Successfully' });
          } else {
            callBack(500, { message: 'There was a server side error.' });
          }
        });
      } else {
        callBack(400, {
          error: 'Token already expired!',
        });
      }
    });
  } else {
    callBack(400, {
      error: 'There was a problem in your request',
    });
  }
};
handler._token.delete = (requestProperties, callBack) => {
  const id =
    typeof requestProperties.queryStringObject.id === 'string' &&
    requestProperties.queryStringObject.id.trim().length === 21
      ? requestProperties.queryStringObject.id
      : false;
  if (id) {
    data.read('tokens', id, (error, tokenData) => {
      if (!error && tokenData) {
        data.delete('tokens', id, (error2) => {
          if (!error2) {
            callBack(200, { message: 'Token was successfully deleted.' });
          } else {
            callBack(500, 'There was a server side error.');
          }
        });
      } else {
        callBack(500, { message: 'There was a server side error' });
      }
    });
  } else {
    callBack(400, { message: 'There was a problem in your requested id!' });
  }
};
handler._token.verify = (id, phone, callback) => {
  data.read('tokens', id, (error, tokenData) => {
    if (!error && tokenData) {
      if (
        parseJSON(tokenData).phone === phone &&
        parseJSON(tokenData).expires > Date.now()
      ) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};
module.exports = handler;
