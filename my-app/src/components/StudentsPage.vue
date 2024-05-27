<template>
  <v-app>
    <v-container fluid>
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
            <!-- Students Data -->
            <v-data-table
              :items="studentsTable"
              align="center"
              :search="search"
              items-per-page-text="Elementos por página"
              pageText=""
            >
              <template v-slot:top>
                <v-toolbar flat color="blue darken-2">
                  <v-toolbar-title>Alumnos</v-toolbar-title>
                  <v-divider class="mx-4" inset vertical></v-divider>
                  <v-spacer></v-spacer>
                  <v-btn icon color="blue darken-2" @click="openCreateDialog">
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                </v-toolbar>
              </template>
              <template v-slot:headers>
                <tr>
                  <th>{{ "ID" }}</th>
                  <th>{{ "Nombre" }}</th>
                  <th>{{ "Apellido Paterno" }}</th>
                  <th>{{ "Apellido Materno" }}</th>
                  <th>{{ "Carrera" }}</th>
                  <th>{{ "Proyecto" }}</th>
                  <!-- Exclude numeroTelefonico from the headers -->
                </tr>
              </template>
              <template v-slot:item="{ item }">
                <tr @click="handleRowClick(item)" class="clickable-row">
                  <td v-for="(value, key) in item" :key="key">
                    <!-- Render project name instead of ID -->
                    <template v-if="key === 'project'">
                      {{ getProjectName(item[key]) }}
                    </template>
                    <template v-else>
                      {{ value }}
                    </template>
                  </td>
                  <td>
                    <v-btn
                      small
                      color="blue darken-2"
                      @click="openFilesDialog(item, $event)"
                    >
                      Documentos
                    </v-btn>
                  </td>
                  <td>
                    <v-btn
                      icon
                      small
                      color="blue darken-2"
                      @click="editUser(item, $event)"
                      style="width: 30px; height: 30px; margin-right: 5px"
                    >
                      <v-icon style="font-size: 18px">mdi-pencil</v-icon>
                    </v-btn>

                    <v-btn
                      icon
                      small
                      color="red darken-2"
                      @click="deleteUser(item._id, $event)"
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
      <v-dialog v-model="editDialog" max-width="500" ref="editDialogForm">
        <v-card>
          <v-card-title>Editar Alumno</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="student.nombre"
              label="Nombre"
              required
              :rules="[(v) => !!v || 'Nombre requerido']"
            ></v-text-field>
            <v-text-field
              v-model="student.apellido"
              label="Apellido Paterno"
              required
              :rules="[(v) => !!v || 'Apellido Paterno requerido']"
            ></v-text-field>
            <v-text-field
              v-model="student.apellidoM"
              label="Apellido Materno"
              required
              :rules="[(v) => !!v || 'Apellido Materno requerido']"
            ></v-text-field>
            <v-text-field
              v-model="student.correo"
              label="Correo electrónico"
              required
              :rules="[
                (v) => !!v || 'Correo requerido',
                (v) => /.+@.+\..+/.test(v) || 'Correo debe ser válido',
              ]"
            ></v-text-field>
            <v-select
              v-model="student.proyecto"
              :items="projects.map((project) => project.nombre)"
              label="Selecciona Proyecto"
              required
              :rules="[(v) => !!v || 'Proyecto requerido']"
              @change="updateEmpresaField($event)"
            ></v-select>
            <v-text-field
              v-model="student.carrera"
              label="Carrera"
              required
              :rules="[(v) => !!v || 'Carrera requerida']"
            ></v-text-field>
            <v-text-field
              v-model="student.numeroTelefonico"
              label="Número telefónico "
              type="number"
              required
              :rules="[(v) => !!v || 'Número telefónico requerido']"
            ></v-text-field>
            <v-text-field
              v-model="student.empresa"
              label="Empresa"
              required
              :rules="[(v) => !!v || 'Empresa requerida']"
            ></v-text-field>
            <v-text-field
              v-model="student.periodo"
              label="Periodo"
              required
              :rules="[(v) => !!v || 'Periodo requerido']"
            ></v-text-field>
            <v-text-field
              v-model="student.asesorExterno.nombre"
              label="Nombre Asesor externo"
              required
              readonly
              :rules="[(v) => !!v || 'Nombre del Asesor requerido']"
            ></v-text-field>
            <v-text-field
              v-model="student.asesorExterno.correo"
              label="Correo Asesor externo"
              required
              readonly
              :rules="[
                (v) => !!v || 'Correo del asesor requerido',
                (v) => /.+@.+\..+/.test(v) || 'Correo debe ser válido',
              ]"
            ></v-text-field>
            <v-text-field
              v-model="student.asesorExterno.telefono"
              label="Número telefónico asesor externo"
              type="number"
              required
              readonly
              :rules="[(v) => !!v || 'Número telefónico del asesor requerido']"
            ></v-text-field>
            <!-- Add more fields as needed -->
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="blue darken-2"
              @click="saveEditedStudent"
              :disabled="!isEditFormValid"
              >Guardar</v-btn
            >
            <v-btn @click="cancelEdit">Cancelar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Create Dialog -->
      <v-dialog v-model="createDialog" max-width="500" ref="createDialogForm">
        <v-card>
          <v-card-title>Crear Nuevo Alumno</v-card-title>
          <v-card-text>
            <!-- <v-text-field v-model="newStudent._id" label="ID"></v-text-field> Remove this line -->
            <v-text-field
              v-model="student._id"
              label="ID"
              type="number"
              required
              :rules="[
                (v) => {
                  console.log('ID value:', v);
                  return !!v || 'ID requerido';
                },
                (v) => {
                  const isValid = /^[0-9]+$/.test(v);
                  console.log('Is ID valid?', isValid);
                  return isValid || 'ID debe contener solo números';
                },
              ]"
            ></v-text-field>
            <v-text-field
              v-model="student.nombre"
              label="Nombre"
              required
              :rules="[(v) => !!v || 'Nombre requerido']"
            ></v-text-field>
            <v-text-field
              v-model="student.apellido"
              label="Apellido Paterno"
              required
              :rules="[(v) => !!v || 'Apellido Paterno requerido']"
            ></v-text-field>
            <v-text-field
              v-model="student.apellidoM"
              label="Apellido Materno"
              required
              :rules="[(v) => !!v || 'Apellido Materno requerido']"
            ></v-text-field>
            <v-text-field
              v-model="student.correo"
              label="Correo Electrónico"
              required
              :rules="[
                (v) => !!v || 'Correo requerido',
                (v) => /.+@.+\..+/.test(v) || 'Correo debe ser válido',
              ]"
            ></v-text-field>
            <v-text-field
              v-model="student.contraseña"
              label="Contraseña"
              type="password"
              required
              :rules="[(v) => !!v || 'Contraseña requerida']"
            ></v-text-field>
            <!-- Add dropdown menu for projects -->
            <v-select
              v-model="student.proyecto"
              :items="projects.map((project) => project.nombre)"
              label="Selecciona proyecto"
              required
              :rules="[(v) => !!v || 'Proyecto requerido']"
              @update:modelValue="updateEmpresaField"
            ></v-select>
            <v-text-field
              v-model="student.carrera"
              label="Carrera"
              required
              :rules="[(v) => !!v || 'Carrera requerida']"
            ></v-text-field>
            <v-text-field
              v-model="student.numeroTelefonico"
              label="Número telefónico"
              type="number"
              required
              :rules="[(v) => !!v || 'Número telefónico requerido']"
            ></v-text-field>
            <v-text-field
              v-model="student.empresa"
              label="Empresa"
              required
              :rules="[(v) => !!v || 'Empresa requerida']"
              readonly
            ></v-text-field>
            <v-text-field
              v-model="student.periodo"
              label="Periodo"
              required
              :rules="[(v) => !!v || 'Periodo requerido']"
            ></v-text-field>
            <v-text-field
              v-model="student.asesorExterno.nombre"
              label="Nombre Asesor externo"
              required
              readonly
              :rules="[(v) => !!v || 'Nombre del Asesor requerido']"
            ></v-text-field>
            <v-text-field
              v-model="student.asesorExterno.correo"
              label="Correo Asesor externo"
              required
              readonly
              :rules="[
                (v) => !!v || 'Correo del asesor requerido',
                (v) => /.+@.+\..+/.test(v) || 'Correo debe ser válido',
              ]"
            ></v-text-field>
            <v-text-field
              v-model="student.asesorExterno.telefono"
              label="Número telefónico de asesor externo"
              type="number"
              required
              readonly
              :rules="[(v) => !!v || 'Número telefónico de asesor requerido']"
            ></v-text-field>

            <!-- Add more fields as needed -->
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="blue darken-2"
              :disabled="!isCreateFormValid"
              @click="saveNewStudent"
              >Guardar</v-btn
            >
            <v-btn @click="cancelCreate">Cancelar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <FilesDialog
        :isOpen="showFilesDialog"
        :student="selectedStudent"
        @update:isOpen="showFilesDialog = $event"
      />
    </v-container>
  </v-app>
</template>

<script>
import axios from 'axios'
import FilesDialog from './FilesDialog.vue'

export default {
  components: {
    FilesDialog
  },
  data () {
    return {
      selectedStudent: null,
      showFilesDialog: false,
      studentsTable: [],
      students: [],
      projects: [],
      projectMenu: false, // Control for project dropdown menu
      sidebarItems: [
        { title: 'Proyectos', icon: 'mdi-folder-outline' },
        { title: 'Alumnos', icon: 'mdi-account-plus-outline' },
        { title: 'Maestros', icon: 'mdi-account-tie' }
      ],
      userName: localStorage.getItem('userName'),
      drawer: false,
      editDialog: false,
      student: {
        _id: '',
        nombre: '',
        apellido: '',
        apellidoM: '',
        correo: '',
        project: '',
        carrera: '',
        numeroTelefonico: '',
        empresa: '',
        periodo: '',
        asesorExterno: {
          nombre: '',
          telefono: '',
          correo: ''
        }
        // Add more fields as needed
      },
      createDialog: false,
      search: ''
    }
  },
  computed: {
    isCreateFormValid () {
      // Check if the form reference exists
      if (!this.$refs.createDialogForm) {
        return false
      }

      // Manually validate each field
      return (
        this.student._id &&
        this.student.nombre &&
        this.student.apellido &&
        this.student.apellidoM &&
        this.student.correo &&
        this.student.contraseña &&
        this.student.proyecto &&
        this.student.carrera &&
        this.student.numeroTelefonico &&
        this.student.empresa &&
        this.student.periodo &&
        this.student.asesorExterno.nombre &&
        this.student.asesorExterno.correo &&
        this.student.asesorExterno.telefono
      )
    },
    isEditFormValid () {
      // Check if the form reference exists
      if (!this.$refs.editDialogForm) {
        return false
      }

      // Manually validate each field
      return (
        this.student.nombre &&
        this.student.apellido &&
        this.student.apellidoM &&
        this.student.proyecto &&
        this.student.carrera &&
        this.student.numeroTelefonico &&
        this.student.empresa &&
        this.student.periodo &&
        this.student.asesorExterno.nombre &&
        this.student.asesorExterno.correo &&
        this.student.asesorExterno.telefono
      )
    }
  },

  methods: {
    updateEmpresaField (selectedProjectName) {
      const selectedProject = this.projects.find(
        (project) => project.nombre === selectedProjectName
      )
      if (selectedProject) {
        this.student.empresa = selectedProject.empresa || '' // Assuming the project object has an 'empresa' field
        const userWithSelectedProject = this.students.find(
          (s) => s.proyecto === selectedProject.id
        )
        if (userWithSelectedProject) {
          const {
            nombre = '',
            correo,
            telefono
          } = userWithSelectedProject.asesorExterno
          this.student.asesorExterno = { nombre, correo, telefono }
        }
      }
    },
    resetStudent () {
      this.student = {
        _id: '',
        nombre: '',
        apellido: '',
        apellidoM: '',
        correo: '',
        project: '',
        carrera: '',
        numeroTelefonico: '',
        empresa: '',
        periodo: '',
        asesorExterno: {
          nombre: '',
          telefono: '',
          correo: ''
        }
        // Add more fields as needed
      }
    },
    openFilesDialog (student, event) {
      event.stopPropagation()
      this.selectedStudent = this.students.find((s) => s._id === student._id)
      this.showFilesDialog = true // Open the dialog with the student's files
    },
    async fetchData () {
      try {
        const response = await axios.get('http://localhost:3000/students')
        this.students = response.data
        this.studentsTable = response.data.map((student) => ({
          _id: student._id,
          nombre: student.nombre,
          apellido: student.apellido,
          apellidoM: student.apellidoM,
          carrera: student.carrera,
          project: student.proyecto
        }))
      } catch (error) {
        console.error('Error fetching students:', error)
      }
    },
    async fetchProjects () {
      try {
        const response = await axios.get('http://localhost:3000/projects')
        // Extract IDs and names from the projects data
        this.projects = response.data.map((project) => ({
          id: project._id,
          nombre: project.nombre,
          empresa: project.empresa
        }))
      } catch (error) {
        console.error('Error fetching projects:', error)
      }
    },

    async navigate (index) {
      switch (index) {
        case 0:
          this.$router.push('/admin')
          break
        case 1:
          this.$router.push('/admin/students')
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
    editUser (student, event) {
      event.stopPropagation() // Stop event propagation
      // Find the student with the matching _id
      const foundStudent = this.students.find((s) => s._id === student._id)
      if (foundStudent) {
        // If the student is found, copy its data to editedStudent
        this.student = { ...foundStudent }
        this.editDialog = true
      } else {
        console.error(`Student with ID ${student._id} not found.`)
      }
    },

    async saveEditedStudent () {
      try {
        const selectedProject = this.projects.find(
          (project) => project.nombre === this.student.proyecto
        )
        if (selectedProject) {
          // Save the project ID to the new student data
          this.student.proyecto = selectedProject.id
        }
        const response = await axios.put(
          `http://localhost:3000/users/${this.student._id}`,
          this.student
        )
        console.log('User updated successfully:', response.data)
        this.fetchData()
      } catch (error) {
        console.error('Error updating user:', error)
      }
      this.editDialog = false
    },
    cancelEdit () {
      this.editDialog = false
    },
    openCreateDialog () {
      this.resetStudent()
      this.createDialog = true
      // Fetch projects data when opening create dialog
      this.fetchProjects()
    },
    async saveNewStudent () {
      try {
        // Validate the form
        if (!this.isCreateFormValid) {
          return // Exit if the form is not valid
        }
        // Find the selected project object based on its name
        const selectedProject = this.projects.find(
          (project) => project.nombre === this.student.proyecto
        )
        if (selectedProject) {
          // Save the project ID to the new student data
          this.student.proyecto = selectedProject.id
        }

        const response = await axios.post(
          'http://localhost:3000/register',
          this.student
        )
        if (response.status === 201) {
          console.log('Student created successfully:', response.data)
          this.fetchData()
        } else {
          console.error('Failed to create student:', response.data)
        }
      } catch (error) {
        if (error.response) {
          // Display an error message to the user if the email already exists
          alert(error.response.data.error)
        }
      }
      this.createDialog = false
    },

    cancelCreate () {
      this.createDialog = false
    },
    async deleteUser (userId, event) {
      event.stopPropagation() // Stop event propagation
      try {
        const response = await axios.delete(
          `http://localhost:3000/users/${userId}`
        )
        console.log('User deleted successfully:', response.data)
        this.fetchData() // Call a method to update the UI or fetch updated data
      } catch (error) {
        console.error('Error deleting user:', error)
      }
    },

    selectProject (project) {
      this.student.proyecto = project.nombre // Set the selected project name
      this.projectMenu = false // Close the dropdown menu
    },
    handleRowClick (item) {
      // Handle row click event here
      console.log('Row clicked:', item)
      // Navigate to a new page and pass the user's ID as route parameters
      this.$router.push({
        name: 'UserDetails',
        params: { userId: item._id }
      })
    },
    getProjectName (projectId) {
      const project = this.projects.find((project) => project.id === projectId)
      return project ? project.nombre : ''
    }
  },
  mounted () {
    this.fetchData()
    this.fetchProjects()
  }
}
</script>

<style scoped>
.v-btn i {
  color: white;
}

.clickable-row:hover {
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
