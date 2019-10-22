<template>
  <v-skeleton-loader :loading="loading" type="article, actions">
    <v-card class="mx-auto">
      <v-list-item three-line>
        <v-list-item-content>
          <div class="overline mb-4">MISCELLANEOUS</div>
          <v-list-item-title class="headline mb-1">General Settings</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-text-field
            v-model="settings.update_interval"
            :rules="rules"
            label="Update interval"
            hint="Please provide a valid cron expression"
            placeholder="*/5 * * * * *"
            required
          ></v-text-field>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" @click="save" :disabled="!valid || equal">Save changes</v-btn>
      </v-card-actions>

      <v-overlay :value="overlay" absolute>
        <v-progress-circular indeterminate size="64"></v-progress-circular>
      </v-overlay>
    </v-card>
  </v-skeleton-loader>
</template>

<script>
import ApiService from "@/services/ApiService";

export default {
  data: () => ({
    loading: true,
    api: new ApiService(),
    valid: true,
    overlay: false,
    settings: {
      update_interval: "*/5 * * * *"
    },
    rules: [
      v =>
        /(@(annually|yearly|monthly|weekly|daily|hourly|reboot))|(@every (\d+(ns|us|µs|ms|s|m|h))+)|((((\d+,)+\d+|(\d+(\/|-)\d+)|\d+|\*) ?){5,7})/.test(
          v
        ) || "Invalid cron expression"
    ],
    beforeSave: {
      update_interval: "*/5 * * * *"
    }
  }),

  async mounted() {
    this.settings = (await this.api.getGeneralSettings()).data;
    this.beforeSave = this.$_.clone(this.settings);

    let self = this;
    setTimeout(() => {
      self.loading = false;
    }, 500);
  },

  computed: {
    equal() {
      return this.$_.isEqual(this.beforeSave, this.settings);
    }
  },

  watch: {},

  methods: {
    async save() {
      this.overlay = true;
      this.settings = (await this.api.setGeneralSettings(this.settings)).data;
      this.beforeSave = this.$_.clone(this.settings);
      let self = this;
      setTimeout(() => {
        self.overlay = false;
      }, 500);
    }
  }
};
</script>
