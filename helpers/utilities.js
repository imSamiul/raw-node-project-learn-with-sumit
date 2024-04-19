// Important utility functions

const crypto = require('crypto');
const environment = require('./environment');

// module scaffolding
const utilities = {};

// parse JSON string to object
utilities.parseJSON = (jsonString) => {
  let output;
  try {
    output = JSON.parse(jsonString);
  } catch (error) {
    output = {};
  }
  return output;
};

// hash string
utilities.hash = (str) => {
  if (typeof str === 'string' && str.length > 0) {
    const hash = crypto
      .createHmac('sha256', environment.secretKey)
      .update(str)
      .digest('hex');
    return hash;
  }
  return false;
};
utilities.randomString = (strLength) => {
  let length = strLength;
  length = typeof strLength === 'number' && strLength > 0 ? strLength : false;
  if (length) {
    const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz1234567890';
    let output = '';
    for (let i = 0; i <= strLength; i += 1) {
      const randomCharacter = possibleCharacters.charAt(
        Math.floor(Math.random() * possibleCharacters.length),
      );
      output += randomCharacter;
    }
    return output;
  }
  return false;
};

module.exports = utilities;
