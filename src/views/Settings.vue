<template>
  <v-container fluid pt-0>
    <v-row justify="center">
      <v-col md="10" class="pt-0">
        <v-card style="margin-top: -64px; z-index: 5;" min-height="600" shaped>
          <v-toolbar height="64" class="pl-2" flat color="grey lighten-3">
            <v-toolbar-title class="font-weight-thin text-uppercase">Settings</v-toolbar-title>

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
            <v-row align="start" justify="center">
              <v-col sm="12">
                <general-settings />
              </v-col>
              <v-col sm="12">
                <aws-settings />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import AwsSettings from "@/components/settings/aws.vue";
import GeneralSettings from "@/components/settings/general.vue";

export default {
  components: {
    AwsSettings,
    GeneralSettings
  },
  data: () => ({})
};
</script>
