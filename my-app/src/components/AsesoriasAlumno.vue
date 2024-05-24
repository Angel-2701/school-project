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
          <v-card class="mx-auto" max-width="800">
            <v-card-title class="blue darken-2 white--text"
              >Asesorías</v-card-title
            >
            <v-card-text>
              <v-row>
                <v-col cols="12">
                  <p>Número de asesorías asignadas: {{ numberOfAsesorias }}</p>
                </v-col>
                <v-divider class="my-4"></v-divider>
                <v-row>
                  <v-col
                    v-for="(asesoria, index) in asesorias"
                    :key="asesoria.id"
                    cols="12"
                    md="4"
                    class="d-flex align-center"
                  >
                    <v-card class="ma-2 pa-2" outlined>
                      <v-card-text
                        class="text-center"
                        v-if="asesoria.submitted"
                      >
                        <v-icon color="blue darken-2" size="48"
                          >mdi-file-pdf-box</v-icon
                        >
                        <div>{{ asesoria.file.filename }}</div>
                      </v-card-text>
                      <v-divider v-if="asesoria.submitted"></v-divider>
                      <v-file-input
                        v-if="!asesoria.submitted"
                        v-model="asesoria.file"
                        :label="'Asesoría ' + (index + 1)"
                        prepend-icon="mdi-upload"
                        :disabled="index !== nextEnabledIndex"
                        accept="application/pdf"
                        class="wide-field"
                      ></v-file-input>
                      <v-btn
                        v-if="asesoria.submitted"
                        :href="
                          'data:application/octet-stream;base64,' +
                          asesoria.file.data
                        "
                        :download="asesoria.file.filename"
                        color="blue darken-2"
                        block
                        >Descargar</v-btn
                      >
                      <v-btn
                        v-if="asesoria.submitted"
                        color="red darken-2"
                        block
                        @click="deleteFile(index)"
                        >Eliminar</v-btn
                      >
                    </v-card>
                  </v-col>
                </v-row>
              </v-row>
            </v-card-text>
            <v-card-actions>
              <v-btn
                color="blue darken-2"
                @click="submitFile"
                :disabled="!currentAsesoria.file"
                >Enviar Asesoría {{ nextEnabledIndex + 1 }}</v-btn
              >
              <v-btn color="blue darken-2" @click="downloadAllFiles"
                >Descargar todas las asesorías</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-col>
      </v-main>
    </v-container>
  </v-app>
</template>

<script>
import axios from 'axios'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

export default {
  data () {
    return {
      drawer: false,
      sidebarItems: [
        { title: 'Proyecto', icon: 'mdi-folder-outline' },
        { title: 'Asesorias', icon: 'mdi-account-plus-outline' },
        { title: 'Archivos', icon: 'mdi-file-document-outline' }
      ],
      userName: localStorage.getItem('userName'),
      numberOfAsesorias: 0,
      asesorias: JSON.parse(localStorage.getItem('asesorias')) || [],
      userId: localStorage.getItem('id'),
      nextEnabledIndex: 0 // Index of the next enabled file input field
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
        case 2:
          this.$router.push('/student/archivos')
          break
        default:
          break
      }
    },
    logout () {
      localStorage.removeItem('token')
      this.$router.push('/login')
    },
    initializeAsesorias () {
      this.asesorias = Array.from(
        { length: this.numberOfAsesorias },
        (v, i) => ({
          id: i + 1,
          file: this.asesorias[i]?.file || null,
          submitted: this.asesorias[i]?.submitted || false // Set submitted status based on existing data
        })
      )
      // Find the next index to enable
      this.nextEnabledIndex = this.asesorias.findIndex(
        (asesoria) => !asesoria.submitted
      )
      if (this.nextEnabledIndex === -1) {
        this.nextEnabledIndex = this.numberOfAsesorias
      }
    },
    async submitFile () {
      const index = this.nextEnabledIndex
      const formData = new FormData()
      const asesoria = this.asesorias[index]

      if (asesoria.file && !asesoria.submitted) {
        formData.append('file', asesoria.file)

        try {
          const response = await axios.post(
            'http://localhost:3000/upload-asesoria',
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            }
          )

          if (response.status === 201) {
            const file = response.data.file
            asesoria.submitted = true
            asesoria.file = {
              _id: file.id,
              filename: file.filename
            }

            // Save the updated asesorias data in localStorage
            localStorage.setItem('asesorias', JSON.stringify(this.asesorias))

            // Send a PUT request to update the user with the file ID
            await axios.put(`http://localhost:3000/users/${this.userId}`, {
              archivosAsesorias: this.asesorias
                .filter((a) => a.submitted)
                .map((a) => a.file._id)
            })

            // Find and set the next enabled index
            this.nextEnabledIndex = this.asesorias.findIndex(
              (a) => !a.submitted
            )
            if (this.nextEnabledIndex === -1) {
              this.nextEnabledIndex = this.numberOfAsesorias
            }
            this.fetchFileData()
            window.alert('File uploaded successfully!') // Display alert
            console.log('File uploaded successfully!')
          } else {
            console.error('Failed to upload file.')
          }
        } catch (error) {
          console.error('Error uploading file:', error)
        }
      }
    },
    deleteFile (index) {
      const asesoriaId = this.asesorias[index].file._id
      axios
        .delete(`http://localhost:3000/asesorias/${asesoriaId}`)
        .then(async (response) => {
          if (response.status === 200) {
            this.asesorias[index].submitted = false
            // Set file property to null instead of an empty object
            this.asesorias[index].file = null
            localStorage.setItem('asesorias', JSON.stringify(this.asesorias))
            window.alert('File deleted successfully!')
            // Update the next enabled index
            this.nextEnabledIndex = index

            // Update the user's asesorias in the database
            const updatedAsesorias = this.asesorias
              .filter((a) => a.submitted)
              .map((a) => a.file._id)
            await axios.put(`http://localhost:3000/users/${this.userId}`, {
              archivosAsesorias: updatedAsesorias
            })
          } else {
            console.error('Failed to delete file.')
          }
        })
        .catch((error) => {
          console.error('Error deleting file:', error)
        })
    },

    async fetchAsesorias () {
      try {
        const response = await axios.get(
          `http://localhost:3000/users/${this.userId}`
        )
        const userData = response.data
        this.numberOfAsesorias = userData.asesorias
        this.initializeAsesorias() // Initialize asesorias based on fetched number
      } catch (error) {
        console.error('Error fetching asesorías:', error)
      }
    },
    async fetchFileData () {
      try {
        const response = await axios.get('http://localhost:3000/asesorias')
        const files = response.data
        // Update file objects with their data based on index
        files.forEach((file, index) => {
          if (this.asesorias[index]) {
            this.asesorias[index].file = file
          }
        })
      } catch (error) {
        console.error('Error fetching file data:', error)
      }
    },
    async downloadAllFiles () {
      // Ensure the latest data is fetched before downloading
      await this.fetchFileData()

      const zip = new JSZip()
      this.asesorias.forEach((asesoria, index) => {
        if (asesoria.file && asesoria.file.data) {
          const byteString = atob(asesoria.file.data)
          const ab = new ArrayBuffer(byteString.length)
          const ia = new Uint8Array(ab)
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i)
          }
          zip.file(`filename_${index + 1}.pdf`, ab)
        }
      })

      zip.generateAsync({ type: 'blob' }).then((content) => {
        saveAs(content, 'asesorias.zip')
      })
    }
  },
  mounted () {
    this.fetchAsesorias()
    this.fetchFileData()
  },
  computed: {
    currentAsesoria () {
      return this.asesorias[this.nextEnabledIndex] || {}
    },
    leftAsesorias () {
      const half = Math.ceil(this.asesorias.length / 2)
      return this.asesorias.slice(0, half)
    },
    rightAsesorias () {
      const half = Math.ceil(this.asesorias.length / 2)
      return this.asesorias.slice(half)
    }
  }
}
</script>

<style scoped>
.v-btn i {
  color: white;
}

.v-card {
  width: 100%;
}

.wide-field {
  width: 100%;
}
</style>
