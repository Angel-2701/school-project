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
              v-if="students.length > 0"
              :items="students"
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
                <tr>
                  <!-- <td>{{ item._id }}</td> Remove this line -->
                  <!-- Display other fields dynamically -->
                  <td v-for="(value, key) in item" :key="key">
                    {{ value }}
                  </td>
                  <td>
                    <v-btn
                      icon
                      small
                      color="blue darken-2"
                      @click="editUser(item)"
                      style="width: 30px; height: 30px; margin-right: 5px"
                    >
                      <v-icon style="font-size: 18px">mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      small
                      color="red darken-2"
                      @click="deleteUser(item._id)"
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
              v-model="editedStudent.correo"
              label="Email"
            ></v-text-field>
            <v-select
              v-model="editedStudent.project"
              :items="projects"
              label="Select Project"
            ></v-select>
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
              :items="projects"
              label="Select Project"
            ></v-select>
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
        correo: '',
        project: ''
        // Add more fields as needed
      },
      createDialog: false,
      newStudent: {
        nombre: '',
        apellido: '',
        correo: '',
        project: ''
        // Add more fields as needed
      }
    }
  },
  methods: {
    async fetchData () {
      try {
        const response = await axios.get('http://localhost:3000/students')
        this.students = response.data
      } catch (error) {
        console.error('Error fetching students:', error)
      }
    },
    async fetchProjects () {
      try {
        const response = await axios.get('http://localhost:3000/projects')
        // Extract just the names from the projects data
        this.projects = response.data.map((project) => project._id)
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
          this.$router.push('/students')
          break
        case 2:
          this.$router.push('/Teachers')
          break
        default:
          break
      }
    },
    logout () {
      // Logic to logout the user
    },
    editUser (student) {
      this.editedStudent = { ...student } // Copy student data to editedStudent
      this.editDialog = true
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
    async deleteUser (userId) {
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
</style>
