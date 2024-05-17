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
                    :disabled="!file2Uploaded"
                    @change="onFileChange(3, $event)"
                    accept="application/pdf"
                  ></v-file-input>
                </v-col>
              </v-row>
            </v-card-text>
            <v-divider class="my-4"></v-divider>
            <div v-if="pdfFiles.length > 0">
              <v-card-title class="blue darken-2 white--text">
                ARCHIVOS SUBIDOS
              </v-card-title>
              <v-row>
                <v-col
                  v-for="(file, index) in pdfFiles"
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
                    <v-card-actions>
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
                    </v-card-actions>
                  </v-card>
                </v-col>
              </v-row>
            </div>
            <v-card-actions>
              <v-btn color="blue darken-2" @click="uploadFiles">
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
      userName: localStorage.getItem('userName'),
      selectedFile: null,
      pdfFiles: [],
      drawer: false,
      sidebarItems: [
        { title: 'Proyecto', icon: 'mdi-folder-outline' },
        { title: 'Asesorias', icon: 'mdi-account-plus-outline' }
      ],
      userId: localStorage.getItem('id'), // Retrieve the user's name from localStorage
      project: {
        name: '',
        company: ''
      },
      file1: null,
      file2: null,
      file3: null,
      file1Uploaded: false,
      file2Uploaded: false,
      file3Uploaded: false
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
        // Check which files have already been uploaded
        this.pdfFiles.forEach((file) => {
          if (file.filename === 'file1.pdf') {
            this.file1Uploaded = true
          } else if (file.filename === 'file2.pdf') {
            this.file2Uploaded = true
          } else if (file.filename === 'file3.pdf') {
            this.file3Uploaded = true
          }
        })
      } catch (error) {
        console.error('Error fetching PDF files:', error)
        alert('Error fetching PDF files.')
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
