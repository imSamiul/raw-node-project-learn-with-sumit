// Notification Library

// Dependencies
const https = require('https');
const queryString = require('querystring');
const { twilio } = require('./environment');

// Module scaffolding
const notifications = {};

notifications.sendTwilioSms = (phoneNo, msgText, callback) => {
  // input validation
  const userPhoneNo =
    typeof phoneNo === 'string' && phoneNo.trim().length === 11
      ? phoneNo.trim()
      : false;
  const userMsgText =
    typeof msgText === 'string' && msgText.trim().length <= 1600
      ? msgText.trim()
      : false;

  if (userPhoneNo && userMsgText) {
    const payload = {
      To: `+88${userPhoneNo}`,
      From: twilio.fromPhone,
      Body: userMsgText,
    };

    // stringify the payload
    const stringifyPayload = queryString.stringify(payload);

    // configure the request details
    const requestDetails = {
      hostname: 'api.twilio.com',
      method: 'POST',
      path: `/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
      auth: `${twilio.accountSid}:${twilio.authToken}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    // instantiate the request object
    const request = https.request(requestDetails, (res) => {
      // get the status of the sent request
      const status = res.statusCode;
      // callback successfully if the request went through
      if (status === 200 || status === 201) {
        callback(false);
      } else {
        callback(`Status code returned was ${status}`);
      }
    });
    request.on('error', (error) => {
      callback(error);
    });
    request.write(stringifyPayload);
    request.end();
  } else {
    callback('There was a error in your phone no or text message.');
  }
};

module.exports = notifications;
