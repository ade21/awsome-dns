<template>
  <v-skeleton-loader :loading="loading" type="article, actions">
    <v-card class="mx-auto">
      <v-list-item three-line>
        <v-list-item-content>
          <div class="overline mb-4">AMAZON WEB SERVICES</div>
          <v-list-item-title class="headline mb-1">AWS Account Details</v-list-item-title>
          <v-list-item-subtitle>Insert your aws credentials in order to use this dynamic dns service.</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-text-field v-model="aws.key" :rules="rules.aws_key" label="AWS Key" required></v-text-field>
          <v-text-field
            v-model="aws.secret"
            :rules="rules.aws_secret"
            label="AWS Secret"
            required
            :type="show_secret ? 'text' : 'password'"
            :append-icon="show_secret ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append="show_secret = !show_secret"
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
    api: new ApiService(),
    loading: true,
    transition: "scale-transition",
    valid: true,
    show_secret: false,
    overlay: false,
    aws: {
      key: "",
      secret: ""
    },
    beforeSave: {
      key: "",
      secret: ""
    },
    rules: {
      aws_key: [v => !!v || "Key is required"],
      aws_secret: [v => !!v || "Secret is required"]
    }
  }),

  async mounted() {
    this.aws = (await this.api.getAWSCredentials()).data;
    this.beforeSave = this.$_.clone(this.aws);
    let self = this;
    setTimeout(() => {
      self.loading = false;
    }, 500);
  },

  computed: {
    equal() {
      return this.$_.isEqual(this.beforeSave, this.aws);
    }
  },

  watch: {},

  methods: {
    async save() {
      this.overlay = true;
      this.aws = (await this.api.setAWSCredentials(this.aws)).data;
      this.beforeSave = this.$_.clone(this.aws);
      let self = this;
      setTimeout(() => {
        self.overlay = false;
      }, 500);
    }
  }
};
</script>
