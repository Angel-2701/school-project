<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Ingresa Credenciales</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-alert
              v-if="alert"
              type="error"
              dismissible
              @click="alert = false"
            >
              Las credenciales son incorrectas
            </v-alert>
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-text-field
                label="Correo Electrónico"
                v-model="email"
                :rules="emailRules"
                required
              ></v-text-field>
              <v-text-field
                label="Contraseña"
                v-model="password"
                :rules="passwordRules"
                type="password"
                required
              ></v-text-field>
              <v-btn text color="primary" @click="forgotPassword"
                >¿Olvidaste tu contraseña?</v-btn
              >
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="submit">Entrar</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="forgotPasswordDialog" max-width="500">
      <v-card>
        <v-card-title>
          <span class="headline">Recuperar Contraseña</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="resetForm" v-model="resetValid" lazy-validation>
            <v-text-field
              label="Correo Electrónico"
              v-model="resetEmail"
              :rules="emailRules"
              email
              required
            ></v-text-field>
            <v-text-field
              label="Teléfono"
              v-model="resetNumber"
              number
              required
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="sendResetEmail">Enviar</v-btn>
          <v-btn text @click="forgotPasswordDialog = false">Cancelar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="verifyCodeDialog" max-width="500">
      <v-card>
        <v-card-title>
          <span class="headline">Verificar Código</span>
        </v-card-title>
        <v-card-text>
          <v-form
            ref="verifyCodeForm"
            v-model="verifyCodeValid"
            lazy-validation
          >
            <v-text-field
              label="Código de Verificación"
              v-model="verificationCode"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="verifyCode">Verificar</v-btn>
          <v-btn text @click="verifyCodeDialog = false">Cancelar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="resetPasswordDialog" max-width="500">
      <v-card>
        <v-card-title>
          <span class="headline">Restablecer Contraseña</span>
        </v-card-title>
        <v-card-text>
          <v-form
            ref="resetPasswordForm"
            v-model="resetPasswordValid"
            lazy-validation
          >
            <v-text-field
              label="Nueva Contraseña"
              v-model="newPassword"
              :rules="newPasswordRules"
              type="password"
              required
            ></v-text-field>
            <v-text-field
              label="Confirmar Nueva Contraseña"
              v-model="confirmNewPassword"
              :rules="[
                (v) => !!v || 'Confirmación de contraseña requerida',
                (v) => v === newPassword || 'Las contraseñas deben coincidir', // Ensure `this` is properly scoped
              ]"
              type="password"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="resetPassword"
            >Restablecer Contraseña</v-btn
          >
          <v-btn text @click="resetPasswordDialog = false">Cancelar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import axios from 'axios'

export default {
  data: () => ({
    verificationCode: '',
    sentCode: '',
    alert: false,
    valid: true,
    email: '',
    emailRules: [
      (v) => !!v || 'Correo requerido',
      (v) => /.+@.+\..+/.test(v) || 'Correo debe ser válido'
    ],
    password: '',
    passwordRules: [(v) => !!v || 'Contraseña requerida'],
    forgotPasswordDialog: false,
    resetEmail: '',
    resetNumber: '',
    resetValid: true,
    verifyCodeDialog: false,
    resetPasswordDialog: false,
    newPassword: '', // Initialize the newPassword field
    confirmNewPassword: '',
    newPasswordRules: [
      (v) => !!v || 'Nueva contraseña requerida',
      (v) => v.length >= 6 || 'La contraseña debe tener al menos 6 caracteres'
    ]
  }),
  methods: {
    async resetPassword () {
      if (this.$refs.resetPasswordForm.validate()) {
        if (this.newPassword === this.confirmNewPassword) {
          try {
            const user = await this.getUserByCorreo(this.resetEmail)

            if (user) {
              user.contraseña = this.newPassword // Update the user's password

              const response = await axios.put(
                `http://localhost:3000/users/${user._id}`,
                {
                  contraseña: this.newPassword
                }
              )

              if (response.status === 200) {
                console.log('Contraseña actualizada con éxito.')
                this.resetPasswordDialog = false // Close the reset password dialog
                alert('Contraseña actualizada con éxito.')
              } else {
                console.error(
                  'Error al actualizar la contraseña:',
                  response.status
                )
                alert('Error al actualizar la contraseña.')
              }
            } else {
              alert('El usuario no existe.')
            }
          } catch (error) {
            console.error('Error updating password:', error)
            alert('Error al actualizar la contraseña.')
          }
        } else {
          alert('Las contraseñas no coinciden.')
        }
      }
    },
    async getUserByCorreo (correo) {
      try {
        const response = await axios.get(
          `http://localhost:3000/users/email/${correo}`
        )
        if (response.status === 200) {
          return response.data
        } else {
          console.error('Error fetching user data:', response.status)
          return null
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        return null
      }
    },
    async sendResetEmail () {
      if (this.$refs.resetForm.validate()) {
        try {
          const user = await this.getUserByCorreo(this.resetEmail) // Assuming resetEmail contains the email address

          if (user && user.numeroTelefonico === Number(this.resetNumber)) {
            // Add '+52' prefix to the phone number
            const prefixedPhoneNumber = `+52${this.resetNumber}`

            // Send SMS if phone numbers match
            const response = await axios.post(
              'http://localhost:3000/send-sms',
              {
                phone: prefixedPhoneNumber
              }
            )

            if (response.status === 200) {
              console.log(
                'Se ha enviado un mensaje de texto para restablecer tu contraseña.'
              )
              this.forgotPasswordDialog = false
              this.verifyCodeDialog = true // Show the verification code dialog
              this.sentCode = response.data.code
            } else {
              console.log('Error al enviar el mensaje de texto.')
            }
          } else {
            alert(
              'El usuario no existe o el número de teléfono es incorrecto.'
            )
          }
        } catch (error) {
          console.error('Error sending reset email:', error)
          alert('Error al eviar el mensaje de texto.')
        }
      }
    },

    async verifyCode () {
      try {
        const response = await axios.post('http://localhost:3000/verify-code', {
          code: this.verificationCode,
          sentCode: this.sentCode // Sending the stored verification code to the server for comparison
        })

        if (response.data.success) {
          // Code verification successful
          console.log('Code verification successful')
          this.verifyCodeDialog = false // Close the verification code dialog
          this.resetPasswordDialog = true // Open the dialog to enter the new password
        } else {
          // Code verification failed, handle the error
          alert('Código Incorrecto.')
          console.error('Code verification failed:', response.data.message)
        }
      } catch (error) {
        alert('Código Incorrecto.')
        console.error('Error verifying code:', error)
      }
    },

    forgotPassword () {
      this.forgotPasswordDialog = true
    },
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
        this.alert = true
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
