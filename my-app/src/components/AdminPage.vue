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
        <!-- Main content -->
        <v-col cols="12" style="max-width: 1500px; margin: 0px auto">
          <v-card class="text-center" style="width: 100%; margin: 0px auto">
            <template v-slot:text>
              <v-text-field
                v-model="search"
                label="Buscar"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                hide-details
                single-line
              ></v-text-field>
            </template>
            <!-- Projects Data -->
            <v-data-table
              :items="filteredProjects"
              align="center"
              :search="search"
              items-per-page-text="Elementos por página"
              pageText=""
            >
              <template v-slot:top>
                <v-toolbar flat color="blue darken-2">
                  <v-toolbar-title>Proyectos</v-toolbar-title>
                  <v-divider class="mx-4" inset vertical></v-divider>
                  <v-spacer></v-spacer>
                  <v-btn icon color="blue darken-2" @click="openCreateDialog">
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                </v-toolbar>
              </template>
              <template v-slot:item="{ item }">
                <tr @click="handleRowClick(item)" class="clickable-row">
                  <td>{{ item._id }}</td>
                  <td>{{ item.nombre }}</td>
                  <td>{{ item.empresa }}</td>
                  <td>
                    <!-- Use small prop to make the buttons smaller -->
                    <v-btn
                      icon
                      small
                      color="blue darken-2"
                      @click="editProject(item, $event)"
                      style="width: 30px; height: 30px; margin-right: 5px"
                    >
                      <v-icon style="font-size: 18px">mdi-pencil</v-icon>
                    </v-btn>

                    <v-btn
                      icon
                      small
                      color="red darken-2"
                      @click="deleteProject(item)"
                      style="width: 30px; height: 30px; margin-right: 5px"
                    >
                      <v-icon style="font-size: 18px">mdi-delete</v-icon>
                    </v-btn>
                  </td>
                </tr>
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-main>

      <!-- Edit Dialog -->
      <v-dialog v-model="editDialog" max-width="500">
        <v-card>
          <v-card-title>Editar Proyecto</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="editedProjectName"
              label="Nombre del Proyecto"
              required
              :rules="[(v) => !!v || 'Proyecto requerido']"
            ></v-text-field>
            <v-text-field
              v-model="editedProjectCompany"
              label="Empresa"
              required
              :rules="[(v) => !!v || 'Empresa requerida']"
            ></v-text-field>
            <v-text-field
              v-model="asesorExterno.nombre"
              label="Nombre Asesor externo"
              required
              :rules="[(v) => !!v || 'Nombre del Asesor requerido']"
            ></v-text-field>
            <v-text-field
              v-model="asesorExterno.correo"
              label="Correo Asesor externo"
              required
              :rules="[
                (v) => !!v || 'Correo del asesor requerido',
                (v) => /.+@.+\..+/.test(v) || 'Correo debe ser válido',
              ]"
            ></v-text-field>
            <v-text-field
              v-model="asesorExterno.telefono"
              label="Número telefónico asesor externo"
              type="number"
              required
              :rules="[(v) => !!v || 'Número telefónico del asesor requerido']"
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="blue darken-2"
              @click="saveEditedProject"
              :disabled="isEditSaveDisabled"
              >Guardar</v-btn
            >
            <v-btn @click="cancelEdit">Cancelar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Create Dialog -->
      <v-dialog v-model="createDialog" max-width="500">
        <v-card>
          <v-card-title>Crear Nuevo Proyecto</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="newProject._id"
              label="ID"
              required
              :rules="[
                (v) => !!v || 'ID requerido',
                (v) => /^[0-9]+$/.test(v) || 'ID debe contener solo números',
              ]"
            ></v-text-field>
            <v-text-field
              v-model="newProject.nombre"
              label="Nombre del Proyecto"
              required
              :rules="[(v) => !!v || 'Nombre del Proyecto requerido']"
            ></v-text-field>
            <v-text-field
              v-model="newProject.empresa"
              label="Empresa"
              required
              :rules="[(v) => !!v || 'Empresa requerida']"
            ></v-text-field>
            <v-text-field
              v-model="newProject.asesorExterno.nombre"
              label="Nombre Asesor externo"
              required
              :rules="[(v) => !!v || 'Nombre del Asesor requerido']"
            ></v-text-field>
            <v-text-field
              v-model="newProject.asesorExterno.correo"
              label="Correo Asesor externo"
              required
              :rules="[
                (v) => !!v || 'Correo del asesor requerido',
                (v) => /.+@.+\..+/.test(v) || 'Correo debe ser válido',
              ]"
            ></v-text-field>
            <v-text-field
              v-model="newProject.asesorExterno.telefono"
              label="Número telefónico asesor externo"
              type="number"
              required
              :rules="[(v) => !!v || 'Número telefónico del asesor requerido']"
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="blue darken-2"
              @click="saveNewProject"
              :disabled="isSaveDisabled"
              >Guardar</v-btn
            >
            <v-btn @click="cancelCreate">Cancelar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </v-app>
</template>

<script>
import axios from 'axios'

export default {
  data () {
    return {
      projects: [],
      tableHeaders: [],
      sidebarItems: [
        { title: 'Proyectos', icon: 'mdi-folder-outline' },
        { title: 'Alumnos', icon: 'mdi-account-plus-outline' },
        { title: 'Maestros', icon: 'mdi-account-tie' }
      ],
      userName: localStorage.getItem('userName'), // Retrieve the user's name from localStorage
      drawer: false,
      editDialog: false,
      editedProjectName: '',
      editedProjectId: '',
      editedProjectCompany: '',
      createDialog: false,
      newProject: {
        nombre: '',
        empresa: '',
        _id: '',
        asesorExterno: {
          nombre: '',
          telefono: '',
          correo: ''
        }
      },
      search: '',
      asesorExterno: {
        nombre: '',
        telefono: '',
        correo: ''
      }
    }
  },
  computed: {
    filteredProjects () {
      return this.projects.slice().reverse() // Keep the original project data intact, just reverse the order
    },
    // Compute whether the "Save" button should be disabled
    isEditSaveDisabled () {
      // Check if any required field is empty or invalid
      return !this.isEditNameValid() || !this.isEditCompanyValid()
    },
    isSaveDisabled () {
      // Check if any required field is empty or invalid
      return (
        !this.isIdValid() ||
        !this.isNameValid() ||
        !this.isCompanyValid() ||
        !this.isAsesorNombreValid() ||
        !this.isAsesorCorreoValid() ||
        !this.isAsesorTelefonoValid()
      )
    }
  },
  methods: {
    isIdValid () {
      return /^[0-9]+$/.test(this.newProject._id)
    },
    isNameValid () {
      return !!this.newProject.nombre
    },
    isCompanyValid () {
      return !!this.newProject.empresa
    },
    isAsesorNombreValid () {
      return !!this.newProject.asesorExterno.nombre
    },
    isAsesorCorreoValid () {
      return (
        !!this.newProject.asesorExterno.correo &&
        /.+@.+\..+/.test(this.newProject.asesorExterno.correo)
      )
    },
    isAsesorTelefonoValid () {
      return !!this.newProject.asesorExterno.telefono
    },
    isEditNameValid () {
      return !!this.editedProjectName
    },
    isEditCompanyValid () {
      return !!this.editedProjectCompany
    },
    async fetchData () {
      try {
        const response = await axios.get('http://localhost:3000/projects')
        this.projects = response.data

        // Generate table headers based on the keys of the first project
        if (this.projects.length > 0) {
          // Access the first project from the reactive proxy object
          const firstProject = this.projects[0]

          // Extract keys from the first project and capitalize them
          const keys = Object.keys(firstProject)
            .filter((key) => key !== 'asesorExterno')
            .map((key) => ({
              text: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize first letter
              value: key
            }))

          // Set the tableHeaders property with the generated headers
          this.tableHeaders = keys
        }
      } catch (error) {
        console.error('Error fetching projects:', error)
      }
    },

    navigate (index) {
      switch (index) {
        case 0:
          this.$router.push('/admin')
          break
        case 1:
          this.$router.push('/admin/Students')
          break
        case 2:
          this.$router.push('/admin/Teachers')
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
    editProject (project, event) {
      // Stop the propagation of the click event
      event.stopPropagation()

      this.editedProjectName = project.nombre
      this.editedProjectId = project._id
      this.editedProjectCompany = project.empresa
      this.asesorExterno.nombre = project.asesorExterno.nombre
      this.asesorExterno.telefono = project.asesorExterno.telefono
      this.asesorExterno.correo = project.asesorExterno.correo
      this.editDialog = true
    },

    saveEditedProject () {
      // Create an object with the updated project data
      const updatedProject = {
        nombre: this.editedProjectName, // Assuming the only editable field is the project name
        empresa: this.editedProjectCompany,
        asesorExterno: this.asesorExterno
      }

      // Make an HTTP PUT request to update the project
      axios
        .put(
          `http://localhost:3000/projects/${this.editedProjectId}`,
          updatedProject
        )
        .then((response) => {
          // Check if the project was successfully updated
          if (response.status === 200) {
            console.log('Project updated successfully:', response.data)

            // Optionally, you can fetch the updated projects from the server again
            this.fetchData()
          } else {
            console.error('Failed to update project:', response.data)
          }
        })
        .catch((error) => {
          console.error('Error updating project:', error)
        })

      // Close the edit dialog
      this.editDialog = false
    },

    deleteProject (project) {
      // Prompt the user for confirmation before deleting the project
      if (confirm('¿Estás seguro que deseas borrar este proyecto?')) {
        // Make an HTTP DELETE request to delete the project
        axios
          .delete(`http://localhost:3000/projects/${project._id}`)
          .then((response) => {
            // Check if the project was successfully deleted
            if (response.status === 200) {
              console.log('Project deleted successfully:', response.data)

              // Optionally, you can fetch the updated projects from the server again
              this.fetchData()
            } else {
              console.error('Failed to delete project:', response.data)
            }
          })
          .catch((error) => {
            console.error('Error deleting project:', error)
          })
      }
    },
    openCreateDialog () {
      this.createDialog = true
    },
    saveNewProject () {
      axios
        .post('http://localhost:3000/projects', this.newProject)
        .then((response) => {
          if (response.status === 201) {
            console.log('Project created successfully:', response.data)
            this.fetchData()
          } else {
            console.error('Failed to create project:', response.data)
          }
        })
        .catch((error) => {
          if (error.response) {
            // Display an error message to the user if the email already exists
            alert(error.response.data.error)
          }
        })
      this.createDialog = false
    },
    cancelCreate () {
      this.createDialog = false
    },

    cancelEdit () {
      this.editDialog = false
    },
    handleRowClick (item) {
      // Handle row click event here
      console.log('Row clicked:', item)
      // You can perform any action you want here, such as navigating to another page or displaying more information about the clicked item.
    }
  },
  mounted () {
    this.fetchData()
  }
}
</script>

<style scoped>
/* Adjustments for burger menu icon color */
.v-btn i {
  color: white;
}

/* Add shadow to indicate clickable rows */
.clickable-row:hover {
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
