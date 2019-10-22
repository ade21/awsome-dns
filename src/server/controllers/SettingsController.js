const DatabaseService = require("../services/DatabaseService");
const Route53Service = require("../services/Route53Service");
const lineByLine = require("n-readlines");

const RecordsDB = new DatabaseService("records");
const SettingsDB = new DatabaseService("settings");

const default_last_ip_change = {
  old_ip: undefined,
  new_ip: undefined,
  stamp: "never"
};

const default_cron_status = {
  running: false,
  msg: "Cron job did never run.",
  stamp: "never"
};

module.exports = {
  async getStatus(req, res) {
    let last_ip_change = SettingsDB.get("last_ip_change");
    let cron_status = SettingsDB.get("cron_status");
    last_ip_change =
      last_ip_change == undefined ? default_last_ip_change : last_ip_change;
    cron_status = cron_status == undefined ? default_cron_status : cron_status;
    res.json({
      last_ip_change,
      cron_status
    });
  },

  async getLog(req, res) {
    let lines = [];
    let line;
    const liner = new lineByLine(req.app.get("logfile"));
    while ((line = liner.next())) {
      let l = {
        stamp: line.toString("ascii").substring(0, 19),
        msg: line.toString("ascii").substring(20, line.length - 1)
      };
      if (l.msg.startsWith("TRACE")) {
        l.level = "trace";
      } else if (l.msg.startsWith("DEBUG")) {
        l.level = "debug";
      } else if (l.msg.startsWith("INFO")) {
        l.level = "info";
      } else if (l.msg.startsWith("WARN")) {
        l.level = "warn";
      } else if (l.msg.startsWith("ERROR")) {
        l.level = "error";
      } else if (l.msg.startsWith("FATAL")) {
        l.level = "fatal";
      }
      lines.push(l);
    }
    res.json({
      log: lines,
      session: req.app
        .get("logfile")
        .split("\\")
        .slice(-1)[0]
    });
  },

  async getZones(req, res) {
    try {
      const credentials = SettingsDB.get("aws-credentials");
      const r53 = new Route53Service({
        accessKeyId: credentials.key,
        secretAccessKey: credentials.secret
      });
      let zones = await r53.zonesAsync();
      for (let i = 0; i < zones.length; i++) {
        let records = RecordsDB.get(zones[i].zoneId);
        zones[i].records = records === undefined ? [] : records;
      }
      res.json({
        zones
      });
    } catch (err) {
      res.status(400).send({
        error:
          "Could not access route53. Please check credentials under settings page."
      });
    }
  },

  async setZones(req, res) {
    const { zones } = req.body;
    for (let i = 0; i < zones.length; i++) {
      RecordsDB.put(zones[i].zoneId, zones[i].records);
    }
    res.json({ zones });
  },

  async updateRecord(req, res) {
    const { zoneId, record } = req.body;
    req.app.emit("updateRecord", { zoneId, record });
    res.json({ zoneId, record });
  },

  getAWSCredentials(req, res) {
    let credentials = SettingsDB.get("aws-credentials");
    if (credentials == undefined) {
      credentials = {
        key: "",
        secret: ""
      };
    }
    res.json(credentials);
  },

  setAWSCredentials(req, res) {
    const credentials = {
      key: req.body.key,
      secret: req.body.secret
    };
    SettingsDB.put("aws-credentials", credentials);
    res.json(credentials);
  },

  getGeneralSettings(req, res) {
    const settings = SettingsDB.get("general");
    res.json(settings);
  },

  setGeneralSettings(req, res) {
    const settings = req.body;
    SettingsDB.put("general", settings);
    req.app.emit("intervalChanged", settings.update_interval);
    res.json(settings);
  }
};
