/*
 * Create export configuration variables
 *
 */

// General containter for all the environments

var environments = {};

// Staging (default) environment object
environments.staging = {
  'httpPort' : 3030,
  'httpsPort' : 3443,
  'envName' : 'staging'
};

// Production environment object
environments.production = {
  'port' : 5050,
  'httpsPort' : 5443,
  'envName' : 'production'
};

// Decide which environment was passed in the command-line
// as an argument
var currentEnvironment = typeof(process.env.MODE_ENV) == 'string' ? process.env.MODE_ENV.toLowerCase() : '';

// Check if we've got a legit envName
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// Export the module
module.exports = environmentToExport;
