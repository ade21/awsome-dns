const bodyParser = require("body-parser");
const morgan = require("morgan");
const api = require("./api");
const moment = require("moment");

const logfile =
  process.platform == "win32"
    ? `${__dirname}\\..\\..\\logs\\${moment().format(
        "YYYY-MM-DD_HH-mm-ss"
      )}.log`
    : `${__dirname}/../../logs/${moment().format("YYYY-MM-DD_HH-mm-ss")}.log`;

module.exports = app => {
  app.set("logfile", logfile);

  require("./services/LogService")(app);

  app.emit("log", {
    level: "info",
    message: `Starting AWSOME // DNS - If you like it, feel free to click on the gift icon :-)`
  });

  require("./services/CronService")(app);
  app.use(bodyParser.json());
  app.use(morgan("short"));
  app.use("/api", api);
};
