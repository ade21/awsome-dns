import axios from "axios";

class ApiService {
  async updateRecord(zoneId, record) {
    return await axios.post("/api/record/update", {
      zoneId,
      record
    });
  }

  async getStatus() {
    return await axios.get("/api/status");
  }

  async getLog() {
    return await axios.get("/api/log");
  }

  async getZones() {
    return await axios.get("/api/zones");
  }

  async setZones(zones) {
    return await axios.post("/api/zones", zones);
  }

  async getAWSCredentials() {
    return await axios.get("/api/credentials");
  }

  async setAWSCredentials(credentials) {
    return await axios.post("/api/credentials", credentials);
  }

  async getGeneralSettings() {
    return await axios.get("/api/settings");
  }

  async setGeneralSettings(settings) {
    return await axios.post("/api/settings", settings);
  }
}

export default ApiService;
