<template>
  <v-container fluid pt-0>
    <v-row justify="center">
      <v-col md="10" class="pt-0">
        <v-card style="margin-top: -64px; z-index: 5;" shaped>
          <v-toolbar height="64" class="pl-2" flat color="grey lighten-3">
            <v-toolbar-title class="font-weight-thin text-uppercase">Records</v-toolbar-title>

            <v-spacer></v-spacer>

            <v-toolbar-items>
              <v-row align="center" justify="start">
                <v-col class="py-0">
                  <v-select
                    style="max-width: 200px"
                    :items="zones"
                    item-text="name"
                    item-value="zoneId"
                    label="Select zone"
                    solo
                    hide-details
                    v-model="currentZoneId"
                    @change="setCurrentZone"
                  ></v-select>
                </v-col>
              </v-row>
            </v-toolbar-items>
          </v-toolbar>

          <v-divider></v-divider>

          <v-card-text>
            <v-alert type="error" v-if="error">{{ error_msg }}</v-alert>
            <v-card min-height="500" flat>
              <v-overlay :value="loading" absolute>
                <v-progress-circular indeterminate size="64"></v-progress-circular>
              </v-overlay>

              <v-card-actions v-if="!error && !loading">
                <v-btn disabled>{{currentZone.zoneId}}</v-btn>
                <v-spacer />
                <v-dialog v-model="dialog" max-width="500px" persistent>
                  <template v-slot:activator="{ on }">
                    <v-btn color="primary" v-on="on">
                      <v-icon left>mdi-plus</v-icon>Add record
                    </v-btn>
                  </template>
                  <v-card>
                    <v-card-title>
                      <span class="headline">{{ formTitle }}</span>
                    </v-card-title>

                    <v-card-text>
                      <v-container>
                        <v-row>
                          <v-col cols="12" sm="12">
                            <v-text-field
                              v-model="editedItem.name"
                              :rules="[domainCheck]"
                              label="Name"
                              :placeholder="currentZone.name"
                              :hint="`A record like '${currentZone.name}' or a subdomain record like 'mail.${currentZone.name}'`"
                            ></v-text-field>
                          </v-col>
                          <v-col cols="12" sm="6">
                            <v-text-field v-model="editedItem.type" label="Type" value="A" readonly></v-text-field>
                          </v-col>
                          <v-col cols="12" sm="6">
                            <v-text-field
                              v-model="editedItem.ttl"
                              label="Time to live (TTL)"
                              type="number"
                            ></v-text-field>
                          </v-col>
                        </v-row>
                      </v-container>
                    </v-card-text>

                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn
                        color="blue darken-1"
                        text
                        @click="close"
                        :disabled="saveLoading"
                      >Cancel</v-btn>
                      <v-btn
                        color="blue darken-1"
                        text
                        @click="updateTable"
                        :disabled="!allowSave"
                        :loading="saveLoading"
                      >Save</v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-card-actions>
              <v-data-table
                :headers="headers"
                :items="currentZone.records"
                sort-by="name"
                v-if="!error && !loading"
              >
                <template v-slot:item.action="{ item }">
                  <v-icon small class="mr-2" @click="updateRecord(item)">mdi-flash</v-icon>
                  <v-icon small class="mr-2" @click="editItem(item)">mdi-pencil</v-icon>
                  <v-icon small @click="deleteItem(item)">mdi-delete</v-icon>
                </template>
                <template v-slot:no-data>
                  <p class="my-4">No records configured.</p>
                </template>
              </v-data-table>
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
    currentZoneId: null,
    currentZone: null,
    error: false,
    error_msg: "",
    loading: true,
    api: new ApiService(),
    zones: [],
    valid: true,
    overlay: false,
    dialog: false,
    saveLoading: false,
    headers: [
      {
        text: "Name",
        align: "left",
        sortable: true,
        value: "name"
      },
      { text: "Type", value: "type", sortable: false },
      { text: "TTL", value: "ttl", sortable: false },
      { text: "Actions", value: "action", sortable: false, align: "right" }
    ],
    editedIndex: -1,
    editedItem: {
      name: "",
      type: "A",
      ttl: 300
    },
    defaultItem: {
      name: "",
      type: "A",
      ttl: 300
    }
  }),

  async mounted() {
    try {
      this.zones = (await this.api.getZones()).data.zones;
      //this.zones = [];
      if (this.zones.length == 0) {
        this.error =
          "There are no zones created in aws route53. Create a zone and reload this page to continue.";
      } else {
        this.currentZone = this.zones[0];
        this.currentZoneId = this.currentZone.zoneId;
      }
    } catch (err) {
      this.error = true;
      this.error_msg = err.response.data.error;
    } finally {
      let self = this;
      setTimeout(() => {
        self.loading = false;
      }, 500);
    }
  },

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "New Record" : "Edit Record";
    },
    allowSave() {
      return this.domainCheck(this.editedItem.name) === true;
    }
  },

  watch: {
    dialog(val) {
      val || this.close();
    }
  },

  methods: {
    async save() {
      try {
        this.zones = (await this.api.setZones({
          zones: this.zones
        })).data.zones;
      } catch (err) {
        this.error = true;
        this.error_msg = JSON.stringify(err.response.data);
      }
    },

    async updateRecord(record) {
      try {
        await this.api.updateRecord(this.currentZoneId, record);
      } catch (err) {
        this.error = true;
        this.error_msg = JSON.stringify(err.response.data);
      }
    },

    setCurrentZone() {
      let self = this;
      this.zones.forEach(zone => {
        if (zone.zoneId == self.currentZoneId) {
          self.currentZone = zone;
        }
      });
    },

    domainCheck(value) {
      var re = new RegExp(
        /^((?:(?:(?:\w[\.\-\+]?)*)\w)+)((?:(?:(?:\w[\.\-\+]?){0,62})\w)+)\.(\w{2,6})$/
      );
      if (!value.match(re)) {
        return "Please enter a valid (sub)domain name";
      }
      if (
        value != this.currentZone.name &&
        !value.endsWith(`.${this.currentZone.name}`)
      ) {
        return `Your domain has to be '${this.currentZone.name}' or has to end with '.${this.currentZone.name}'`;
      }
      for (let i = 0; i < this.currentZone.records.length; i++) {
        if (this.currentZone.records[i].name == value) {
          return "This (sub)domain already exists";
        }
      }
      return true;
    },

    editItem(item) {
      this.editedIndex = this.currentZone.records.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem(item) {
      const index = this.currentZone.records.indexOf(item);
      if (confirm("Are you sure you want to delete this record?")) {
        this.currentZone.records.splice(index, 1);
        this.save();
      }
    },

    close() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    },

    async updateTable() {
      this.saveLoading = true;
      if (this.editedIndex > -1) {
        Object.assign(
          this.currentZone.records[this.editedIndex],
          this.editedItem
        );
      } else {
        this.currentZone.records.push(this.editedItem);
      }
      await this.save();
      this.close();
      this.saveLoading = false;
    }
  }
};
</script>
