// Handle all environment related stuff here

const environment = {};

environment.staging = {
  port: 3000,
  envName: 'staging',
  secretKey: 'samiul',
  maxChecks: 5,
};

environment.production = {
  port: 5000,
  envName: 'production',
  secretKey: 'karim',
  maxChecks: 5,
};

// determine which environment was passed
const currentEnvironment =
  typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';

// export corresponding environment object
const environmentToExport =
  typeof environment[currentEnvironment] === 'object'
    ? environment[currentEnvironment]
    : environment.staging;
module.exports = environmentToExport;
