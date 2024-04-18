const handler = {};

handler.notFoundHandler = (requestProperties, callBack) => {
  callBack(404, {
    message: 'Your requested URL was not found!',
  });
};
module.exports = handler;
