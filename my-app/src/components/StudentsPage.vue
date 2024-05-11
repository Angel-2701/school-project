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
            <!-- Students Data -->
            <v-data-table
              v-if="studentsTable.length > 0"
              :items="studentsTable"
              align="center"
            >
              <template v-slot:top>
                <v-toolbar flat color="blue darken-2">
                  <v-toolbar-title>Students</v-toolbar-title>
                  <v-divider class="mx-4" inset vertical></v-divider>
                  <v-spacer></v-spacer>
                  <v-btn icon color="blue darken-2" @click="openCreateDialog">
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                </v-toolbar>
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
      <v-dialog v-model="editDialog" max-width="500">
        <v-card>
          <v-card-title>Edit Student</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="editedStudent.nombre"
              label="Name"
            ></v-text-field>
            <v-text-field
              v-model="editedStudent.apellido"
              label="Last Name"
            ></v-text-field>
            <v-text-field
              v-model="editedStudent.apellidoM"
              label="Apellido Materno"
            ></v-text-field>
            <v-text-field
              v-model="editedStudent.correo"
              label="Email"
            ></v-text-field>
            <v-select
              v-model="editedStudent.project"
              :items="projects.map((project) => project.name)"
              label="Select Project"
            ></v-select>

            <v-text-field
              v-model="editedStudent.carrera"
              label="Carrera"
            ></v-text-field>
            <v-text-field
              v-model="editedStudent.numeroTelefonico"
              label="Phone Number"
              type="number"
            ></v-text-field>
            <v-text-field
              v-model="editedStudent.empresa"
              label="Empresa"
            ></v-text-field>
            <v-text-field
              v-model="editedStudent.periodo"
              label="Periodo"
            ></v-text-field>
            <v-text-field
              v-model="editedStudent.asesorExterno.nombre"
              label="Nombre Asesor externo"
            ></v-text-field>
            <v-text-field
              v-model="editedStudent.asesorExterno.correo"
              label="Correo Asesor externo"
            ></v-text-field>
            <v-text-field
              v-model="editedStudent.asesorExterno.telefono"
              label="External Advisor Number"
              type="number"
            ></v-text-field>
            <!-- Add more fields as needed -->
          </v-card-text>
          <v-card-actions>
            <v-btn color="blue darken-2" @click="saveEditedStudent">Save</v-btn>
            <v-btn @click="cancelEdit">Cancel</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Create Dialog -->
      <v-dialog v-model="createDialog" max-width="500">
        <v-card>
          <v-card-title>Create New Student</v-card-title>
          <v-card-text>
            <!-- <v-text-field v-model="newStudent._id" label="ID"></v-text-field> Remove this line -->
            <v-text-field v-model="newStudent._id" label="ID"></v-text-field>
            <v-text-field
              v-model="newStudent.nombre"
              label="Name"
            ></v-text-field>
            <v-text-field
              v-model="newStudent.apellido"
              label="Last Name"
            ></v-text-field>
            <v-text-field
              v-model="newStudent.apellidoM"
              label="Apellido Materno"
            ></v-text-field>
            <v-text-field
              v-model="newStudent.correo"
              label="Email"
            ></v-text-field>
            <v-text-field
              v-model="newStudent.contraseña"
              label="Password"
              type="password"
            ></v-text-field>
            <!-- Add dropdown menu for projects -->
            <v-select
              v-model="newStudent.project"
              :items="projects.map((project) => project.name)"
              label="Select Project"
            ></v-select>
            <v-text-field
              v-model="newStudent.carrera"
              label="Carrera"
            ></v-text-field>
            <v-text-field
              v-model="newStudent.numeroTelefonico"
              label="Phone Number"
              type="number"
            ></v-text-field>
            <v-text-field
              v-model="newStudent.empresa"
              label="Empresa"
            ></v-text-field>
            <v-text-field
              v-model="newStudent.periodo"
              label="Periodo"
            ></v-text-field>
            <v-text-field
              v-model="newStudent.asesorExterno.nombre"
              label="Nombre Asesor externo"
            ></v-text-field>
            <v-text-field
              v-model="newStudent.asesorExterno.correo"
              label="Correo Asesor externo"
            ></v-text-field>
            <v-text-field
              v-model="newStudent.asesorExterno.telefono"
              label="External Advisor Number"
              type="number"
            ></v-text-field>
            <!-- Add more fields as needed -->
          </v-card-text>
          <v-card-actions>
            <v-btn color="blue darken-2" @click="saveNewStudent">Save</v-btn>
            <v-btn @click="cancelCreate">Cancel</v-btn>
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
      studentsTable: [],
      students: [],
      projects: [],
      projectMenu: false, // Control for project dropdown menu
      sidebarItems: [
        { title: 'Projects', icon: 'mdi-folder-outline' },
        { title: 'Students', icon: 'mdi-account-plus-outline' },
        { title: 'Teachers', icon: 'mdi-account-tie' }
      ],
      userName: 'John Doe',
      drawer: false,
      editDialog: false,
      editedStudent: {
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
          apellido: '',
          correo: ''
        }
        // Add more fields as needed
      },
      createDialog: false,
      newStudent: {
        rol: 'student',
        nombre: '',
        apellido: '',
        apellidoM: '',
        correo: '',
        project: '',
        contraseña: '',
        carrera: '',
        numeroTelefonico: '',
        empresa: '',
        periodo: '',
        asesorExterno: {
          nombre: '',
          apellido: '',
          correo: ''
        }
        // Add more fields as needed
      }
    }
  },
  methods: {
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
          project: student.project
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
          name: project.name
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
        this.editedStudent = { ...foundStudent }
        this.editDialog = true
      } else {
        console.error(`Student with ID ${student._id} not found.`)
      }
    },

    async saveEditedStudent () {
      try {
        const response = await axios.put(
          `http://localhost:3000/users/${this.editedStudent._id}`,
          this.editedStudent
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
      this.createDialog = true
      // Fetch projects data when opening create dialog
      this.fetchProjects()
    },
    async saveNewStudent () {
      try {
        // Find the selected project object based on its name
        const selectedProject = this.projects.find(
          (project) => project.name === this.newStudent.project
        )
        if (selectedProject) {
          // Save the project ID to the new student data
          this.newStudent.project = selectedProject.id
        }

        const response = await axios.post(
          'http://localhost:3000/register',
          this.newStudent
        )
        if (response.status === 201) {
          console.log('Student created successfully:', response.data)
          this.fetchData()
        } else {
          console.error('Failed to create student:', response.data)
        }
      } catch (error) {
        console.error('Error creating student:', error)
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
      this.newStudent.project = project.name // Set the selected project name
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
      return project ? project.name : ''
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
