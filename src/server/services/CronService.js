const cron = require("node-cron");
const axios = require("axios");
const DatabaseService = require("../services/DatabaseService");
const Route53Service = require("../services/Route53Service");
const moment = require("moment");

const SettingsDB = new DatabaseService("settings");
const RecordsDB = new DatabaseService("records");

class CronService {
  constructor(app) {
    this.app = app;
    let self = this;

    this.app.on("intervalChanged", interval => {
      self.intervalChanged(interval);
    });

    this.app.on("updateRecord", data => {
      self.updateRecord(data);
    });

    let general = SettingsDB.get("general");
    if (
      general == undefined ||
      !general.update_interval ||
      !cron.validate(general.update_interval)
    ) {
      general = {
        update_interval: "*/5 * * * * *"
      };
      SettingsDB.put("general", general);
    }

    this.update_interval = general.update_interval;

    this.task = cron.schedule(
      this.update_interval,
      () => {
        self.worker();
      },
      {
        scheduled: false
      }
    );

    // this.app.emit("log", {
    //   level: "info",
    //   message: `Starting cron with expression '${this.update_interval}'`
    // });

    this.task.start();
    this.worker();
  }

  async worker() {
    const last_ip_change = SettingsDB.get("last_ip_change");
    let ip =
      typeof last_ip_change == "object" ? last_ip_change.new_ip : undefined;
    let current_ip = undefined;
    try {
      current_ip = (await axios.get("https://api.ipify.org/?format=json")).data
        .ip;
    } catch (err) {
      this.app.emit("log", {
        level: "error",
        message: `Error while looking up current ip address at 'https://api.ipify.org/?format=json': ${JSON.stringify(
          err
        )}`
      });
      SettingsDB.put("cron_status", {
        running: false,
        msg: `Last cron job failed. Could not get current ip address. See log for details.`,
        stamp: moment().format("DD.MM.YYYY HH:MM:ss")
      });
      return;
    }

    let r53 = null;
    try {
      const credentials = SettingsDB.get("aws-credentials");
      r53 = new Route53Service({
        accessKeyId: credentials.key,
        secretAccessKey: credentials.secret
      });
      await r53.zonesAsync();
    } catch (err) {
      this.app.emit("log", {
        level: "error",
        message: `Error while accessing route53. Please check credentials.`
      });
      SettingsDB.put("cron_status", {
        running: false,
        msg: `Last cron job failed. Could not access route53. See log for details.`,
        stamp: moment().format("DD.MM.YYYY HH:MM:ss")
      });
      return;
    }

    if (ip !== current_ip) {
      this.app.emit("log", {
        level: "info",
        message: `Detected ip address change. Last ip: ${ip} - New ip: ${current_ip}`
      });
      SettingsDB.put("last_ip_change", {
        old_ip: ip,
        new_ip: current_ip,
        stamp: moment().format("DD.MM.YYYY HH:MM:ss")
      });
      try {
        this.updateRecords(current_ip, r53);
      } catch (err) {
        this.app.emit("log", {
          level: "error",
          message: `Error while updating records: ${JSON.stringify(err)}`
        });
        SettingsDB.put("cron_status", {
          running: false,
          msg: `Last cron job failed. Could not update records. See log for details.`,
          stamp: moment().format("DD.MM.YYYY HH:MM:ss")
        });
        return;
      }
    }

    // this.app.emit("log", {
    //   level: "info",
    //   message: `Cron job finished successfully.`
    // });

    SettingsDB.put("cron_status", {
      running: true,
      msg: `Last cron job finished successfully.`,
      stamp: moment().format("DD.MM.YYYY HH:MM:ss")
    });
  }

  async updateRecord({ zoneId, record, r53 }) {
    let current_ip = undefined;
    try {
      current_ip = (await axios.get("https://api.ipify.org/?format=json")).data
        .ip;
    } catch (err) {
      this.app.emit("log", {
        level: "error",
        message: `Error while looking up current ip address at 'https://api.ipify.org/?format=json': ${JSON.stringify(
          err
        )}`
      });
      return;
    }

    this.app.emit("log", {
      level: "info",
      message: `Manually updating record '${record.name}' with ip address '${current_ip}'`
    });

    r53.setRecordAsync({
      zoneId,
      name: record.name,
      type: record.type,
      ttl: parseInt(record.ttl),
      values: [current_ip]
    });
  }

  async updateRecords(ip, r53) {
    const zoneIds = RecordsDB.keys();
    zoneIds.forEach(zoneId => {
      const records = RecordsDB.get(zoneId);
      //if(records.length == 0) continue;
      if (records.length > 0) {
        this.app.emit("log", {
          level: "info",
          message: `Updating records for zoneId '${zoneId}': ${JSON.stringify(
            records
          )}`
        });
        records.forEach(record => {
          r53.setRecordAsync({
            zoneId,
            name: record.name,
            type: record.type,
            ttl: parseInt(record.ttl),
            values: [ip]
          });
        });
      }
    });
  }

  intervalChanged(interval) {
    if (interval !== this.update_interval) {
      this.app.emit("log", {
        level: "info",
        message: `Restarting cron with expression '${interval}'`
      });
      this.update_interval = interval;
      this.task.stop();
      this.task.destroy();

      let self = this;
      this.task = cron.schedule(
        this.update_interval,
        () => {
          self.worker();
        },
        {
          scheduled: false
        }
      );

      this.task.start();
    }
  }
}

module.exports = async app => {
  new CronService(app);
};
