// Handler to handle user related routes

// dependencies
const { hash, parseJSON } = require('../../helpers/utilities');
const data = require('../../lib/data');

const handler = {};
handler.userHandler = (requestProperties, callBack) => {
  const acceptedMethods = ['get', 'post', 'put', 'delete']; // allowed methods for the route
  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    // check if the requested method is in the allowed methods
    handler._users[requestProperties.method](requestProperties, callBack); // call the method like _users.get
  } else {
    callBack(405);
  }
};

handler._users = {};

handler._users.get = (requestProperties, callBack) => {
  // check the phone number if valid
  const phone =
    typeof requestProperties.queryStringObject.phone === 'string' &&
    requestProperties.queryStringObject.phone.trim().length === 11
      ? requestProperties.queryStringObject.phone
      : false;
  if (phone) {
    // lookup the user
    data.read('users', phone, (error, user) => {
      if (!error && user) {
        const userObj = { ...parseJSON(user) };
        delete userObj.password;
        callBack(200, userObj);
      } else {
        callBack(404, {
          error: 'Requested user was not found!',
        });
      }
    });
  } else {
    callBack(404, {
      error: 'Requested user was not found!',
    });
  }
};
handler._users.post = (requestProperties, callBack) => {
  const firstName =
    typeof requestProperties.body.firstName === 'string' &&
    requestProperties.body.firstName.trim().length > 0
      ? requestProperties.body.firstName
      : false;
  const lastName =
    typeof requestProperties.body.lastName === 'string' &&
    requestProperties.body.lastName.trim().length > 0
      ? requestProperties.body.lastName
      : false;
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
  const tosAgreement =
    typeof requestProperties.body.tosAgreement === 'boolean' &&
    requestProperties.body.tosAgreement
      ? requestProperties.body.tosAgreement
      : false;
  if (firstName && lastName && phone && password && tosAgreement) {
    // make sure that the user doesn't already exist
    data.read('users', phone, (error) => {
      if (error) {
        const userObject = {
          firstName,
          lastName,
          phone,
          password: hash(password),
          tosAgreement,
        };
        // store the user to db
        data.create('users', phone, userObject, (error2) => {
          if (!error2) {
            callBack(200, {
              message: 'User was created successfully!',
            });
          } else {
            callBack(500, {
              error: 'Could not create user!',
            });
          }
        });
      } else {
        callBack(500, {
          error: 'There was a server side error or user already exist.',
        });
      }
    });
  } else {
    callBack(400, {
      error: 'You have an error in your request',
    });
  }
};

handler._users.put = (requestProperties, callBack) => {
  // check the phone number if valid

  const firstName =
    typeof requestProperties.body.firstName === 'string' &&
    requestProperties.body.firstName.trim().length > 0
      ? requestProperties.body.firstName
      : false;
  const lastName =
    typeof requestProperties.body.lastName === 'string' &&
    requestProperties.body.lastName.trim().length > 0
      ? requestProperties.body.lastName
      : false;
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

  if (phone) {
    if (firstName || lastName || password) {
      // read the data from db
      data.read('users', phone, (error, user) => {
        const userObj = { ...parseJSON(user) };
        if (!error && userObj) {
          if (firstName) {
            userObj.firstName = firstName;
          }
          if (lastName) {
            userObj.lastName = lastName;
          }
          if (password) {
            userObj.password = hash(password);
          }
          data.update('users', phone, userObj, (error2) => {
            if (!error2) {
              callBack(200, {
                message: 'user was updated successfully.',
              });
            } else {
              callBack(500, {
                message: 'There was a problem in the server side!',
              });
            }
          });
        } else {
          callBack(404, {
            message:
              "There is a problem in your database or user doesn't exits.",
          });
        }
      });
    } else {
      callBack(404, {
        message: 'There is a problem in your request!',
      });
    }
  } else {
    callBack(404, {
      error: 'Invalid phone number. Please try again!',
    });
  }
};
handler._users.delete = (requestProperties, callBack) => {
  const phone =
    typeof requestProperties.queryStringObject.phone === 'string' &&
    requestProperties.queryStringObject.phone.trim().length === 11
      ? requestProperties.queryStringObject.phone
      : false;
  if (phone) {
    data.read('users', phone, (error, user) => {
      if (!error && user) {
        data.delete('users', phone, (error2) => {
          if (!error2) {
            callBack(200, { message: 'User was successfully deleted.' });
          } else {
            callBack(500, 'There was a server side error.');
          }
        });
      } else {
        callBack(500, { message: 'There was a server side error' });
      }
    });
  } else {
    callBack(400, { message: 'There was a problem in your phone no!' });
  }
};
module.exports = handler;
