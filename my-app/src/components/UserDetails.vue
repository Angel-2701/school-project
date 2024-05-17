<template>
  <v-container>
    <v-card v-if="user" class="user-card">
      <v-card-title class="user-card-title blue darken-2">Detalles de Usuario</v-card-title>
      <v-card-text>
        <v-container>
          <v-row v-for="(value, key) in user" :key="key" class="user-detail-row">
            <v-col cols="4">
              <strong>{{ key }}:</strong>
            </v-col>
            <v-col cols="8">
              {{ value }}
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
.user-card {
  max-width: 800px;
  margin: auto;
  background-color: #f3f5f7;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.user-card-title {
  color: #fff;
  font-size: 24px;
  padding: 20px;
  background-color: #1976d2; /* Changed background color to blue darken-2 */
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.user-detail-row {
  border-bottom: 1px solid #ddd;
  padding: 10px 20px;
}

.user-detail-row:nth-last-child(1) {
  border-bottom: none;
}

.user-detail-row strong {
  font-weight: bold;
  color: #666;
}

.user-detail-row v-col {
  padding: 0;
}

@media (max-width: 600px) {
  .user-card-title {
    font-size: 20px;
  }
}
</style>
