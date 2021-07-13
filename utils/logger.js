const manager = require("simple-node-logger").createLogManager();

manager.createConsoleAppender();

const logger = (name) => {
  return manager.createLogger(name);
};

module.exports = logger;
