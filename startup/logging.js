const winston = require("winston");
require("winston-mongodb");
require("express-async-errors");

module.exports = function () {
  winston.exceptions.handle(
    new winston.transports.File({
      filename: "exceptions.log",
    })
  );

  winston.add(
    new winston.transports.File({
      filename: "app.log",
    })
  );

  winston.add(
    new winston.transports.Console({
      handleExceptions: true,
      handleRejections: true,
    })
  );

  // winston.exitOnError = false;
};
