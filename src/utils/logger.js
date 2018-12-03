import winston from 'winston';
import appRoot from 'app-root-path';

const { NODE_ENV } = process.env;

let level;
let transports;

switch (NODE_ENV) {
  case 'production':
    level = 'verbose';
    transports = [
      new winston.transports.File({
        filename: `${appRoot}/logs/error.log`,
        level: 'error',
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
      }),
      new winston.transports.File({
        filename: `${appRoot}/logs/combined.log`,
        level: 'verbose',
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: false,
      }),
    ];
    break;
  default:
    level = 'verbose';
    transports = [
      new winston.transports.Console({
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true,
      }),
    ];
    break;
}

const logger = winston.createLogger({
  level,
  transports,
  exitOnError: false, // do not exit on handled exceptions
});

// For logging morgan logs
logger.createStream = () => ({
  write: message => logger.info(message),
});

export default logger;
