<template>
  <v-container>
    <v-card v-if="user">
      <v-card-title>User Details</v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12" md="6">
              <v-row>
                <v-col cols="4">
                  <strong>ID:</strong>
                </v-col>
                <v-col cols="8">
                  {{ user._id }}
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="4">
                  <strong>Name:</strong>
                </v-col>
                <v-col cols="8">
                  {{ user.nombre }}
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="4">
                  <strong>Last Name:</strong>
                </v-col>
                <v-col cols="8">
                  {{ user.apellido }}
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12" md="6">
              <v-row>
                <v-col cols="4">
                  <strong>Email:</strong>
                </v-col>
                <v-col cols="8">
                  {{ user.correo }}
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="4">
                  <strong>Project:</strong>
                </v-col>
                <v-col cols="8">
                  {{ user.project }}
                </v-col>
              </v-row>
              <!-- Add more fields as needed -->
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
    <v-card v-else>
      <v-card-title>Loading...</v-card-title>
    </v-card>
  </v-container>
</template>

<script>
import axios from 'axios'

export default {
  data () {
    return {
      user: null
    }
  },
  beforeRouteEnter (to, from, next) {
    const userId = parseFloat(to.params.userId)
    axios
      .get(`http://localhost:3000/users/${userId}`)
      .then((response) => {
        next((vm) => {
          vm.user = response.data
        })
      })
      .catch((error) => {
        console.error('Error fetching user details:', error)
        next(false) // Prevent component from rendering
      })
  }
}
</script>

<style scoped>
/* Add any necessary styling */
</style>
