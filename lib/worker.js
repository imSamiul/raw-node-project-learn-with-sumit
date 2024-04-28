// Worker library works with worker related files.

const worker = {};

worker.gatherAllChecks = () => {};

worker.loop = () => {
  setInterval(() => {
    worker.gatherAllChecks();
  }, 1000 * 60);
};
worker.init = () => {
  // execute all the checks
  worker.gatherAllChecks();
  // call the loops so that checks continue
  worker.loop();
};
module.exports = worker;
