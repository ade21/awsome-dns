<template>
  <v-container fluid pt-0>
    <v-row justify="center">
      <v-col md="10" class="pt-0">
        <v-card style="margin-top: -64px; z-index: 5;" min-height="600" shaped>
          <v-toolbar height="64" class="pl-2" flat color="grey lighten-3">
            <v-toolbar-title class="font-weight-thin text-uppercase">Logfile</v-toolbar-title>

            <v-spacer></v-spacer>

            <!--v-btn icon>
              <v-icon>mdi-magnify</v-icon>
            </v-btn>

            <v-btn icon>
              <v-icon>mdi-apps</v-icon>
            </v-btn>

            <v-btn icon>
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn-->
          </v-toolbar>

          <v-divider></v-divider>

          <v-card-text>
            <p>Showing content of current logfile '{{session}}'</p>
            <v-textarea outlined full-width no-resize readonly rows="30" v-model="logdump"></v-textarea>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import ApiService from "@/services/ApiService";
export default {
  data: () => ({
    api: new ApiService(),
    logs: [],
    logdump: "",
    session: "",
    interval: null
  }),

  async mounted() {
    this.loadLogs();
    this.interval = setInterval(this.loadLogs.bind(this), 5000);
  },

  beforeDestroy() {
    clearInterval(this.interval);
  },

  methods: {
    async loadLogs() {
      const response = (await this.api.getLog()).data;
      this.logs = response.log;
      this.session = response.session;

      this.logdump = "";
      for (let i = 0; i < this.logs.length; i++) {
        this.logdump += `${this.logs[i].stamp} - ${this.logs[i].msg}\n`;
      }
    }
  }
};
</script>
