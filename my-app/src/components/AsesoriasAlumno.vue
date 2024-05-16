<template>
  <v-app>
    <v-container>
      <!-- Top Bar -->
      <v-app-bar app color="blue darken-2" dark>
        <!-- Burger menu icon -->
        <v-btn icon @click="drawer = !drawer">
          <v-icon>mdi-menu</v-icon>
        </v-btn>
        <!-- Title -->
        <v-toolbar-title>{{ userName }}</v-toolbar-title>
        <v-spacer></v-spacer>
        <!-- Logout button -->
        <v-btn icon @click="logout">
          <v-icon>mdi-logout</v-icon>
        </v-btn>
      </v-app-bar>

      <!-- Sidebar -->
      <v-navigation-drawer app v-model="drawer" color="blue darken-2" dark>
        <v-list dense>
          <v-list-item
            v-for="(item, index) in sidebarItems"
            :key="index"
            @click="navigate(index)"
          >
            <v-list-item-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>

      <!-- Main Content -->
      <v-main>
        <v-col cols="12" style="max-width: 800px; margin: 0 auto">
          <v-card class="mx-auto" max-width="600">
            <v-card-title class="blue darken-2 white--text"
              >Asesorías</v-card-title
            >
            <v-card-text>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="numberOfAsesorias"
                    label="Number of Asesorías"
                    type="number"
                    min="1"
                    @change="initializeAsesorias"
                  ></v-text-field>
                </v-col>
                <v-divider class="my-4"></v-divider>
                <v-col cols="6">
                  <v-row
                    v-for="(asesoria, index) in leftAsesorias"
                    :key="index"
                  >
                    <v-col cols="12">
                      <v-file-input
                        v-model="asesoria.file"
                        :label="'Upload File for Asesoría ' + (index + 1)"
                        prepend-icon="mdi-upload"
                      ></v-file-input>
                      <v-btn color="blue darken-2" @click="submitFile(index)"
                        >Submit</v-btn
                      >
                    </v-col>
                  </v-row>
                </v-col>
                <v-col cols="6">
                  <v-row
                    v-for="(asesoria, index) in rightAsesorias"
                    :key="index"
                  >
                    <v-col cols="12">
                      <v-file-input
                        v-model="asesoria.file"
                        :label="
                          'Upload File for Asesoría ' +
                          (leftAsesorias.length + index + 1)
                        "
                        prepend-icon="mdi-upload"
                      ></v-file-input>
                      <v-btn
                        color="blue darken-2"
                        @click="submitFile(leftAsesorias.length + index)"
                        >Submit</v-btn
                      >
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-main>
    </v-container>
  </v-app>
</template>

<script>
export default {
  data () {
    return {
      drawer: false,
      sidebarItems: [
        { title: 'Proyecto', icon: 'mdi-folder-outline' },
        { title: 'Asesorias', icon: 'mdi-account-plus-outline' }
      ],
      userName: localStorage.getItem('userName'), // Retrieve the user's name from localStorage
      numberOfAsesorias: 1, // Default to 1 asesoria
      asesorias: [{ file: null }] // Initialize with one asesoria
    }
  },
  computed: {
    leftAsesorias () {
      const half = Math.ceil(this.asesorias.length / 2)
      return this.asesorias.slice(0, half)
    },
    rightAsesorias () {
      const half = Math.ceil(this.asesorias.length / 2)
      return this.asesorias.slice(half)
    }
  },
  methods: {
    navigate (index) {
      switch (index) {
        case 0:
          this.$router.push('/student')
          break
        case 1:
          this.$router.push('/student/asesorias')
          break
        default:
          break
      }
    },
    logout () {
      // Logic to logout the user
      // For example, you can clear any user data or tokens stored in localStorage
      localStorage.removeItem('token')

      // Redirect the user to the login page
      this.$router.push('/login')
    },
    initializeAsesorias () {
      // Initialize the asesorias array based on the number of asesorias
      this.asesorias = Array.from({ length: this.numberOfAsesorias }, () => ({
        file: null
      }))
    },
    submitFile (index) {
      // Handle individual file submission logic
      const asesoria = this.asesorias[index]
      console.log(`File for Asesoría ${index + 1}:`, asesoria.file)
      // You can implement file upload functionality here
    }
  }
}
</script>

<style scoped>
.v-btn i {
  color: white;
}
</style>
