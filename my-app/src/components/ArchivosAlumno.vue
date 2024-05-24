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
        <v-col cols="12" style="max-width: 1000px; margin: 0 auto">
          <v-card class="mx-auto" max-width="800">
            <v-card-title class="blue darken-2 white--text">
              Archivos
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col
                  v-for="(archivo, index) in archivos"
                  :key="archivo.id"
                  cols="12"
                  md="6"
                >
                  <v-card class="mb-3">
                    <v-card-title>{{ archivo.fieldName }}</v-card-title>
                    <v-card-text class="text-center" v-if="archivo.submitted">
                      <v-icon color="blue darken-2" size="48"
                        >mdi-file-pdf-box</v-icon
                      >
                      <div>{{ archivo.file.filename }}</div>
                    </v-card-text>
                    <v-divider v-if="archivo.submitted"></v-divider>
                    <v-file-input
                      v-if="!archivo.submitted"
                      v-model="archivo.file"
                      :label="archivo.fieldName"
                      prepend-icon="mdi-upload"
                      accept="application/pdf"
                    ></v-file-input>
                    <v-btn
                      v-if="archivo.submitted"
                      :href="
                        'data:application/octet-stream;base64,' +
                        archivo.file.data
                      "
                      :download="archivo.file.filename"
                      color="blue darken-2"
                      >Descargar</v-btn
                    >
                    <v-btn
                      v-if="archivo.submitted"
                      color="red darken-2"
                      @click="deleteFile(index)"
                      >Eliminar</v-btn
                    >
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
            <v-divider class="my-4"></v-divider>
            <v-card-actions>
              <v-btn
                :disabled="isSubmitDisabled"
                color="blue darken-2"
                @click="submitForm"
                >Enviar</v-btn
              >
              <v-btn color="primary" @click="downloadAllFiles"
                >Descargar todos los archivos</v-btn
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
      archivos: [
        {
          id: 1,
          fieldName: 'Solicitud de residencias profesionales',
          file: null,
          submitted: false
        },
        {
          id: 2,
          fieldName: 'Carta de presentación',
          file: null,
          submitted: false
        },
        {
          id: 3,
          fieldName: 'Carta de aceptación',
          file: null,
          submitted: false
        },
        { id: 4, fieldName: 'Cartilla IMSS', file: null, submitted: false },
        {
          id: 5,
          fieldName: 'Oficio de Asignación de asesor interno',
          file: null,
          submitted: false
        },
        { id: 6, fieldName: 'Anteproyecto', file: null, submitted: false },
        {
          id: 7,
          fieldName: 'Liberación de los 5 créditos',
          file: null,
          submitted: false
        },
        {
          id: 8,
          fieldName: 'Liberación servicio social',
          file: null,
          submitted: false
        }
      ],
      userName: localStorage.getItem('userName'),
      drawer: false,
      sidebarItems: [
        { title: 'Proyecto', icon: 'mdi-folder-outline' },
        { title: 'Asesorias', icon: 'mdi-account-plus-outline' },
        { title: 'Archivos', icon: 'mdi-file-document-outline' }
      ],
      userId: localStorage.getItem('id')
    }
  },
  mounted () {
    // Fetch data if needed
    this.fetchArchivoData()
  },
  computed: {
    isSubmitDisabled () {
      return this.archivos.some((archivo) => !archivo.file)
    }
  },
  methods: {
    async fetchArchivoData () {
      try {
        const response = await axios.get('http://localhost:3000/archivos')
        const files = response.data
        // Update archivo objects with their data based on index
        files.forEach((file, index) => {
          if (this.archivos[index]) {
            this.archivos[index].file = {
              id: file._id,
              filename: file.filename,
              data: file.data // assuming 'data' contains the base64 string
            }
            this.archivos[index].submitted = true
          }
        })
      } catch (error) {
        console.error('Error fetching archivo data:', error)
      }
    },
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
      localStorage.removeItem('user')
      this.$router.push('/login')
    },
    async submitForm () {
      try {
        const formData = new FormData()
        const newFiles = []

        // Iterate through each archivo
        for (let i = 0; i < this.archivos.length; i++) {
          const archivo = this.archivos[i]
          // Check if a file exists and is not submitted yet
          if (archivo.file && !archivo.submitted) {
            // Append each new file to the FormData object
            formData.append('files', archivo.file)
            newFiles.push(archivo) // Keep track of new files
          }
        }

        if (newFiles.length > 0) {
          // Perform an HTTP POST request to submit the new files
          const response = await axios.post(
            'http://localhost:3000/upload-archivo',
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            }
          )

          // Check if the request was successful
          if (response.status === 201) {
            // Create an object to store the nuevos archivos data
            const nuevosArchivosData = {}

            // Iterate through new files and update the submitted status and file data
            for (let i = 0; i < newFiles.length; i++) {
              const file = response.data.files[i]
              const index = this.archivos.findIndex(
                (archivo) => archivo.fieldName === newFiles[i].fieldName
              )
              this.archivos[index].submitted = true
              this.archivos[index].file = {
                id: file.id,
                filename: file.filename,
                data: file.data // assuming 'data' contains the base64 string
              }
              // Add to nuevosArchivosData
              nuevosArchivosData[this.archivos[index].fieldName] = file.id
            }

            // Fetch the current user data
            const currentUser = await axios.get(
              `http://localhost:3000/users/${this.userId}`
            )

            // Merge the nuevos archivos data with the existing archivos data in the user object
            const updatedArchivosData = {
              ...currentUser.data.archivos,
              ...nuevosArchivosData
            }

            // Update the user collection with the updated archivos data
            await axios.put(`http://localhost:3000/users/${this.userId}`, {
              archivos: updatedArchivosData
            })

            // Update the archivos array in local storage
            localStorage.setItem('archivos', JSON.stringify(this.archivos))
            // Display a success message to the user
            alert('Files submitted successfully!')
          } else {
            // Handle the case where the request was not successful
            console.error('Failed to submit files:', response.statusText)
          }
        } else {
          alert('No new files to submit.')
        }
      } catch (error) {
        // Handle any errors that occur during the submission process
        console.error('Error submitting files:', error)
      }
    },

    async downloadAllFiles () {
      // Ensure the latest data is fetched before downloading
      await this.fetchArchivoData()

      const zip = new JSZip()
      this.archivos.forEach((archivo, index) => {
        if (archivo.file && archivo.file.data) {
          const byteString = atob(archivo.file.data)
          const ab = new ArrayBuffer(byteString.length)
          const ia = new Uint8Array(ab)
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i)
          }
          // Append index to the filename to ensure uniqueness
          const uniqueFilename = `${index}_${archivo.file.filename}`
          zip.file(uniqueFilename, ab)
        }
      })

      zip.generateAsync({ type: 'blob' }).then((content) => {
        saveAs(content, 'archivos.zip')
      })
    },

    deleteFile (index) {
      const archivoId = this.archivos[index].file.id
      axios
        .delete(`http://localhost:3000/archivos/${archivoId}`)
        .then(async (response) => {
          if (response.status === 200) {
            // Remove the archivo ID from the user's archivos field
            const fieldName = this.archivos[index].fieldName
            try {
              const currentUser = await axios.get(
                `http://localhost:3000/users/${this.userId}`
              )
              const updatedArchivosData = { ...currentUser.data.archivos }
              delete updatedArchivosData[fieldName]
              await axios.put(`http://localhost:3000/users/${this.userId}`, {
                archivos: updatedArchivosData
              })
            } catch (error) {
              console.error('Error updating user archivos:', error)
            }

            this.archivos[index].submitted = false
            this.archivos[index].file = null // Clear the file object
            localStorage.setItem('archivos', JSON.stringify(this.archivos))
            window.alert('File deleted successfully!')
          } else {
            console.error('Failed to delete file.')
          }
        })
        .catch((error) => {
          console.error('Error deleting file:', error)
        })
    }
  }
}
</script>

<style scoped>
.v-btn i {
  color: white;
}
</style>
