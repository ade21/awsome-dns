const SimpleNodeLogger = require("simple-node-logger");

class LogService {
  constructor(app) {
    this.logger = SimpleNodeLogger.createSimpleLogger({
      logFilePath: app.get("logfile"),
      timestampFormat: "DD.MM.YYYY HH:mm:ss"
    });
    this.app = app;
    this.app.on("log", this.log.bind(this));
  }

  log({ level, message }) {
    switch (level) {
      case "trace":
        this.logger.trace(message);
        break;
      case "debug":
        this.logger.debug(message);
        break;
      case "info":
        this.logger.info(message);
        break;
      case "warn":
        this.logger.warn(message);
        break;
      case "error":
        this.logger.error(message);
        break;
      case "fatal":
        this.logger.fatal(message);
        break;
      default:
        this.logger.info(message);
        break;
    }
  }
}

module.exports = async app => {
  new LogService(app);
};
