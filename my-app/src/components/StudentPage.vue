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

      <v-main>
        <v-col cols="12" style="max-width: 1000px; margin: 0 auto">
          <v-card class="mx-auto" max-width="800">
            <v-card-title class="blue darken-2 white--text">
              Información del Proyecto
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="project.nombre"
                    label="Proyecto"
                    readonly
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="project.empresa"
                    label="Empresa"
                    readonly
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-divider class="my-4"></v-divider>
              <v-row>
                <v-col cols="12" md="4" class="d-flex">
                  <v-file-input
                    v-model="file1"
                    label="Cargar seguimiento 1"
                    prepend-icon="mdi-upload"
                    type="file"
                    :disabled="file1Uploaded"
                    @change="onFileChange(1, $event)"
                    accept="application/pdf"
                  ></v-file-input>
                </v-col>
                <v-col cols="12" md="4" class="d-flex">
                  <v-file-input
                    v-model="file2"
                    label="Cargar seguimiento 2"
                    prepend-icon="mdi-upload"
                    type="file"
                    :disabled="!file1Uploaded || file2Uploaded"
                    @change="onFileChange(2, $event)"
                    accept="application/pdf"
                  ></v-file-input>
                </v-col>
                <v-col cols="12" md="4" class="d-flex">
                  <v-file-input
                    v-model="file3"
                    label="Cargar seguimiento 3"
                    prepend-icon="mdi-upload"
                    type="file"
                    :disabled="!file2Uploaded || file3Uploaded"
                    @change="onFileChange(3, $event)"
                    accept="application/pdf"
                  ></v-file-input>
                </v-col>
              </v-row>
            </v-card-text>
            <v-divider class="my-4"></v-divider>
            <div v-if="orderedPdfFiles.length > 0">
              <v-card-title class="blue darken-2 white--text">
                ARCHIVOS SUBIDOS
              </v-card-title>
              <v-row>
                <v-col
                  v-for="(file, index) in orderedPdfFiles"
                  :key="index"
                  cols="12"
                  md="4"
                  class="d-flex align-center"
                >
                  <v-card class="ma-2 pa-2" outlined>
                    <v-card-text class="text-center">
                      <v-icon color="blue darken-2" size="48"
                        >mdi-file-pdf-box</v-icon
                      >
                      <div>{{ file.filename }}</div>
                    </v-card-text>
                    <v-divider></v-divider>
                    <v-btn
                      :href="
                        'data:application/octet-stream;base64,' + file.data
                      "
                      :download="file.filename"
                      color="blue darken-2"
                      block
                    >
                      Descargar
                    </v-btn>
                    <v-btn
                      color="red darken-2"
                      block
                      @click="deleteFile(file._id)"
                    >
                      Eliminar
                    </v-btn>
                  </v-card>
                </v-col>
              </v-row>
            </div>

            <v-card-actions>
              <v-btn
                color="blue darken-2"
                @click="uploadFiles"
                :disabled="allFilesUploaded"
              >
                Subir seguimiento {{ nextFileNumber }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-main>
    </v-container>
  </v-app>
</template>

<script>
import axios from 'axios'

export default {
  data () {
    return {
      file1Uploaded: localStorage.getItem('file1Uploaded') === 'true' || false,
      file2Uploaded: localStorage.getItem('file2Uploaded') === 'true' || false,
      file3Uploaded: localStorage.getItem('file3Uploaded') === 'true' || false,
      file1Id: localStorage.getItem('file1Id') || null,
      file2Id: localStorage.getItem('file2Id') || null,
      file3Id: localStorage.getItem('file3Id') || null,
      userName: localStorage.getItem('userName'),
      selectedFile: null,
      pdfFiles: [],
      drawer: false,
      sidebarItems: [
        { title: 'Proyecto', icon: 'mdi-folder-outline' },
        { title: 'Asesorias', icon: 'mdi-account-plus-outline' },
        { title: 'Archivos', icon: 'mdi-file-document-outline' }
      ],
      userId: localStorage.getItem('id'), // Retrieve the user's name from localStorage
      project: {
        name: '',
        company: ''
      },
      file1: null,
      file2: null,
      file3: null
    }
  },
  mounted () {
    this.fetchProject()
    this.fetchPDFFiles()
  },
  computed: {
    nextFileNumber () {
      if (!this.file1Uploaded) {
        return 1
      } else if (!this.file2Uploaded) {
        return 2
      } else if (!this.file3Uploaded) {
        return 3
      } else {
        return 'All'
      }
    },
    allFilesUploaded () {
      return this.file1Uploaded && this.file2Uploaded && this.file3Uploaded
    },
    orderedPdfFiles () {
      const orderedFiles = []

      if (this.file1Id) {
        const file1 = this.getFileById(this.file1Id)
        if (file1) orderedFiles.push(file1)
      }

      if (this.file2Id) {
        const file2 = this.getFileById(this.file2Id)
        if (file2) orderedFiles.push(file2)
      }

      if (this.file3Id) {
        const file3 = this.getFileById(this.file3Id)
        if (file3) orderedFiles.push(file3)
      }

      return orderedFiles
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
      // Logic to logout the user
      // For example, you can clear any user data or tokens stored in localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Redirect the user to the login page
      this.$router.push('/login')
    },
    fetchProject () {
      // Get the user ID from localStorage or another context

      if (!this.userId) {
        console.error('No user ID found.')
        return
      }

      // Fetch the user data
      axios
        .get(`http://localhost:3000/users/${this.userId}`)
        .then((response) => {
          const user = response.data
          const projectId = user.proyecto

          if (!projectId) {
            console.error('No project ID found for the user.')
            return
          }

          // Fetch the project data using the projectId
          return axios.get(`http://localhost:3000/projects/${projectId}`)
        })
        .then((response) => {
          if (response) {
            this.project = response.data // Save the project in this.project
          }
        })
        .catch((error) => {
          console.error('Error fetching project data:', error)
        })
    },
    onFileChange (fileNumber, event) {
      switch (fileNumber) {
        case 1:
          this.file1 = event.target.files[0]
          break
        case 2:
          this.file2 = event.target.files[0]
          break
        case 3:
          this.file3 = event.target.files[0]
          break
        default:
          break
      }
    },
    async uploadFiles () {
      if (this.file1 && !this.file1Uploaded) {
        await this.uploadFile(1, this.file1)
      }
      if (this.file2 && !this.file2Uploaded) {
        await this.uploadFile(2, this.file2)
      }
      if (this.file3 && !this.file3Uploaded) {
        await this.uploadFile(3, this.file3)
      }
    },
    async uploadFile (fileNumber, file) {
      if (!file) {
        alert(`Please select a PDF file ${fileNumber} first!`)
        return
      }

      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await axios.post(
          'http://localhost:3000/upload',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        )

        if (response.status === 201) {
          alert(`File ${fileNumber} uploaded successfully!`)
          this[`file${fileNumber}Uploaded`] = true
          localStorage.setItem(`file${fileNumber}Uploaded`, 'true')

          // Extract the ID of the uploaded file
          const fileId = response.data.file.id

          // Save the file ID in local storage
          this[`file${fileNumber}Id`] = fileId
          localStorage.setItem(`file${fileNumber}Id`, fileId)

          // Send a PUT request to update the user with the file ID
          await axios.put(`http://localhost:3000/users/${this.userId}`, {
            [`seguimiento${fileNumber}`]: fileId
          })

          this.fetchPDFFiles() // After successful upload, fetch PDF files again
        } else {
          alert(`Failed to upload file ${fileNumber}.`)
        }
      } catch (error) {
        console.error(`Error uploading file ${fileNumber}:`, error)
        alert(`Error uploading file ${fileNumber}.`)
      }
    },

    async fetchPDFFiles () {
      try {
        const response = await axios.get('http://localhost:3000/files')
        this.pdfFiles = response.data

        // Update file IDs and uploaded status
        this.setUploadedFileIds()
      } catch (error) {
        console.error('Error fetching PDF files:', error)
        alert('Error fetching PDF files.')
      }
    },
    async deleteFile (fileId) {
      try {
        const response = await axios.delete(
          `http://localhost:3000/files/${fileId}`
        )
        if (response.status === 200) {
          alert('File deleted successfully!')
          await this.updateUserFileProperty(fileId) // Update user's file property
          this.fetchPDFFiles() // Refresh the list of PDF files
        } else {
          alert('Failed to delete file.')
        }
      } catch (error) {
        console.error('Error deleting file:', error)
        alert('Error deleting file.')
      }
    },

    async updateUserFileProperty (fileId) {
      try {
        const userResponse = await axios.get(
          `http://localhost:3000/users/${this.userId}`
        )
        const userData = userResponse.data

        // Check which property contains the fileId to be deleted
        let fileProperty
        let deletedFileNumber

        if (userData.seguimiento1 === fileId) {
          fileProperty = 'seguimiento1'
          deletedFileNumber = 1
        } else if (userData.seguimiento2 === fileId) {
          fileProperty = 'seguimiento2'
          deletedFileNumber = 2
        } else if (userData.seguimiento3 === fileId) {
          fileProperty = 'seguimiento3'
          deletedFileNumber = 3
        }

        if (fileProperty) {
          await axios.put(`http://localhost:3000/users/${this.userId}`, {
            [fileProperty]: null
          })

          // Update local state and localStorage
          this[`file${deletedFileNumber}Uploaded`] = false
          this[`file${deletedFileNumber}Id`] = null
          localStorage.removeItem(`file${deletedFileNumber}Uploaded`)
          localStorage.removeItem(`file${deletedFileNumber}Id`)
        }
      } catch (error) {
        console.error('Error updating user file property:', error)
      }
    },

    getFileById (fileId) {
      return this.pdfFiles.find((file) => file._id === fileId)
    },

    setUploadedFileIds () {
      for (let i = 1; i <= 3; i++) {
        const fileId = localStorage.getItem(`file${i}Id`)
        if (fileId) {
          this[`file${i}Uploaded`] = true
          this[`file${i}Id`] = fileId
        } else {
          this[`file${i}Uploaded`] = false
          this[`file${i}Id`] = null
        }
      }
    }
  }
}
</script>

<style scoped>
.v-btn i {
  color: white;
}
</style>
