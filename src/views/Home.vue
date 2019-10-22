<template>
  <v-container fluid pt-0>
    <v-row justify="center">
      <v-col md="10" class="pt-0">
        <v-card style="margin-top: -64px; z-index: 5;" shaped>
          <v-toolbar height="64" class="pl-2" flat color="grey lighten-3">
            <v-toolbar-title class="font-weight-thin text-uppercase">Status</v-toolbar-title>
          </v-toolbar>

          <v-divider></v-divider>

          <v-card-text>
            <v-card min-height="200" flat>
              <v-overlay :value="loading" absolute>
                <v-progress-circular indeterminate size="64"></v-progress-circular>
              </v-overlay>
              <v-list two-line subheader v-if="!loading">
                <v-list-item>
                  <v-list-item-avatar>
                    <v-icon :color="cron.running ? 'success' : 'error'">mdi-circle</v-icon>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title>Cron job</v-list-item-title>
                    <v-list-item-subtitle>Last cron job on {{cron.stamp}}: {{cron.msg}}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-avatar>
                    <v-icon :color="ip_change.new_ip === undefined ? 'error' : 'success'">mdi-circle</v-icon>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title>IP address change</v-list-item-title>
                    <v-list-item-subtitle
                      v-if="ip_change.new_ip !== undefined"
                    >Last ip change on {{ip_change.stamp}}. Changed from '{{ip_change.old_ip}}' to '{{ip_change.new_ip}}'.</v-list-item-subtitle>
                    <v-list-item-subtitle v-else>Never changed any records</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
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
    loading: true,
    interval: null,
    ip_change: {
      old_ip: undefined,
      new_ip: undefined,
      stamp: undefined
    },
    cron: {
      running: false,
      msg: undefined,
      stamp: undefined
    }
  }),

  async mounted() {
    this.loadStatus();
    this.interval = setInterval(this.loadStatus.bind(this), 5000);
  },

  beforeDestroy() {
    clearInterval(this.interval);
  },

  methods: {
    async loadStatus() {
      try {
        const {
          last_ip_change,
          cron_status
        } = (await this.api.getStatus()).data;
        this.ip_change = last_ip_change;
        this.cron = cron_status;
        this.loading = false;
      } catch (err) {
        // console.log(err);
      }
    }
  }
};
</script>
