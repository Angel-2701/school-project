<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Ingresa Credenciales</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-text-field
                label="Email"
                v-model="email"
                :rules="emailRules"
                required
              ></v-text-field>
              <v-text-field
                label="Password"
                v-model="password"
                :rules="passwordRules"
                type="password"
                required
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="submit">Login</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios'

export default {
  data: () => ({
    valid: true,
    email: '',
    emailRules: [
      (v) => !!v || 'E-mail is required',
      (v) => /.+@.+\..+/.test(v) || 'E-mail must be valid'
    ],
    password: '',
    passwordRules: [(v) => !!v || 'Password is required']
  }),
  methods: {
    async submit () {
      try {
        const response = await axios.post('http://localhost:3000/login', {
          correo: this.email,
          contraseña: this.password
        })

        if (response.status === 200) {
          const { token, rol, nombre, id } = response.data

          // Store the token and the user's name in localStorage
          localStorage.setItem('token', token)
          localStorage.setItem('userName', nombre)
          localStorage.setItem('id', id)

          switch (rol) {
            case 'admin':
              this.$router.push('/Admin')
              break
            case 'student':
              this.$router.push('/Student')
              break
            case 'teacher':
              this.$router.push('/Teacher/projects')
              break
            default:
              // Redirect to a default route for unknown roles
              this.$router.push('/default-route')
              break
          }

          console.log('Login successful:', response.data)
        } else {
          // Handle other status codes if needed
        }
      } catch (error) {
        console.error('Login error:', error.response.data.error)
      }
    }
  }
}
</script>

<style scoped>
.v-card {
  margin-top: 100px;
}
</style>
