const handler = {};

handler.sampleHandler = (requestProperties, callBack) => {
  callBack(200, {
    message: 'This is a sample url',
  });
};
module.exports = handler;
