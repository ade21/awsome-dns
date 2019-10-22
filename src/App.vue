<template>
  <v-app>
    <v-app-bar clipped-left flat color="primary" dark prominent extension-height="48" extended app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-btn href="/" text large class="headline">
        <span class="font-weight-bold">AWS</span>
        <span class="font-weight-light">OME // DNS</span>
      </v-btn>
      <v-spacer></v-spacer>

      <v-btn icon href="https://github.com/ade21/awsome-dns" target="_blank">
        <v-icon>mdi-github-circle</v-icon>
      </v-btn>
      <v-btn icon href="https://www.paypal.me/ADehne/5" target="_blank">
        <v-icon>mdi-gift-outline</v-icon>
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer app clipped v-model="drawer">
      <v-list rounded>
        <v-list-item-group color="primary">
          <v-list-item v-for="(item, i) in general_items" :key="i" :to="item.route">
            <v-list-item-icon>
              <v-icon v-text="item.icon"></v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title v-text="item.text"></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <v-content>
      <router-view />

      <v-footer absolute class="font-weight-thin">
        <v-col class="text-center" cols="12">
          <strong>Made with &hearts; by André Dehne</strong>
        </v-col>
      </v-footer>
    </v-content>
  </v-app>
</template>

<script>
export default {
  data: () => ({
    drawer: true,
    general_items: [
      { text: "Status", icon: "mdi-view-dashboard", route: "/" },
      { text: "Records", icon: "mdi-web", route: "/records" },
      { text: "Logfile", icon: "mdi-clipboard-text-outline", route: "/logs" },
      { text: "Settings", icon: "mdi-settings", route: "/settings" }
    ]
  })
};
</script>

<style lang="scss">
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
