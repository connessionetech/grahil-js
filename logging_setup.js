'use strict';

let log4js = require("log4js");
log4js.configure({
    appenders: {
        out: { type: 'stdout' },
        app: { type: 'file', filename: 'grahil.log' }
      },
      categories: {
        default: { appenders: [ 'out', 'app' ], level: 'debug' }
      }
  });


let logger = log4js.getLogger();
module.exports = logger;